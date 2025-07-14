import { NextResponse } from "next/server";
import crypto from "crypto";
import TransactionModel from "../../../../models/Transaction.model";
import UserModel from "../../../../models/User.model";
import CourseModel from "../../../../models/Courses/Course.model";
import { RAZORPAY_KEY_SECRET } from "../../../../config/config";
import AgentModel from "models/Agent.model";
import ReferralSettingsModel from "models/RefferalSetting.model";
import TargetModel from "models/AgentTarget.model";
import SaleModel from "models/AgentSale.model";
import mongoose from "mongoose";
import _db from "../../../../utils/db";
import notificationHelper from "../../../../utils/notificationHelper";

await _db();

export const POST = async (request) => {  
  try {
    // Check for signature in headers (webhook style)
    let razorpaySignature = request.headers.get("x-razorpay-signature");

    // If not in headers, we'll get it from the body later
    const body = await request.json();

    // For client-side verification, the signature will be in the body
    if (!razorpaySignature && body.razorpay_signature) {
      razorpaySignature = body.razorpay_signature;
    }

    // For webhook style verification
    if (
      !razorpaySignature &&
      body.payload?.payment?.entity?.razorpay_signature
    ) {
      razorpaySignature = body.payload.payment.entity.razorpay_signature;
    }

    if (!razorpaySignature) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Missing signature" },
        { status: 401 },
      );
    }

    // Get order_id and payment_id from the appropriate location in the payload
    let order_id, razorpay_payment_id;

    if (body.payload?.payment?.entity) {
      // Webhook style payload
      order_id = body.payload.payment.entity.order_id;
      razorpay_payment_id = body.payload.payment.entity.razorpay_payment_id;
    } else {
      // Client-side verification payload
      order_id = body.razorpay_order_id;
      razorpay_payment_id = body.razorpay_payment_id;
    }

    if (!order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { success: false, error: "Invalid payment data" },
        { status: 400 },
      );
    }

    const transaction = await TransactionModel.findOne({
      orderId: order_id,
      status: "PENDING",
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Invalid or already processed transaction" },
        { status: 404 },
      );
    }

    const secret = RAZORPAY_KEY_SECRET;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 },
      );
    }

    // Update transaction status
    transaction.status = "SUCCESS";
    transaction.paymentId = razorpay_payment_id;
    transaction.signature = razorpaySignature;
    await transaction.save();
    
    let agent = null;
    
    // Handle agent referral code if present
    if (transaction.agentRefCode) {
      agent = await AgentModel.findOne({
        agentCode: transaction.agentRefCode,
      });

      if (agent) {
        agent.totalSale = (agent.totalSale || 0) + transaction.amount;
        agent.countSale = (agent.countSale || 0) + 1;
        await agent.save();
      }
    }

    // Convert IDs to ObjectId for MongoDB operations
    const userId = new mongoose.Types.ObjectId(transaction.userId);
    const courseId = new mongoose.Types.ObjectId(transaction.courseId);
    
    // Get user and course details
    const user = await UserModel.collection.findOne({ _id: userId });
    const course = await CourseModel.collection.findOne({ _id: courseId });
    const referralSettings = await ReferralSettingsModel.findOne();

    if (!user || !course) {
      return NextResponse.json(
        { success: false, error: "User or course not found" },
        { status: 404 },
      );
    }

    // Record agent sale if agent exists
    if (agent) {
      try {
        const saleDate = new Date();
        
        // Find active target for this sale date
        const activeTarget = await TargetModel.findOne({
          agentId: agent._id,
          status: "active",
          startDate: { $lte: saleDate },
          endDate: { $gte: saleDate }
        });

        // Create sale record
        const newSale = new SaleModel({
          agentId: agent._id,
          targetId: activeTarget ? activeTarget._id : null,
          amount: transaction.amount,
          saleDate: saleDate,
          description: `Course purchase: ${course.title || 'Course'}`,
          customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
        });

        await newSale.save();

        // Update target achievement if active target exists
        if (activeTarget) {
          activeTarget.achievedCount += 1;
          activeTarget.achievedAmount += transaction.amount;
          await activeTarget.save();
        }

        console.log(`Sale recorded for agent ${agent.agentCode}: Amount ${transaction.amount}`);
      } catch (saleError) {
        console.error("Error recording agent sale:", saleError);
        // Don't fail the entire payment process if sale recording fails
        // Just log the error and continue
      }
    }

    // Check if user has any valid purchased courses (all data is in new format)
    const validPurchasedCourses = (user.purchasedCourses || []).filter(
      pc => pc && pc.course && pc.expiryDate
    );
    const isFirstPurchase = validPurchasedCourses.length === 0;

    // Handle referral rewards if applicable
    if (isFirstPurchase && user.referredBy && !user.firstPurchaseRewardGiven && referralSettings) {
      const referrerId = new mongoose.Types.ObjectId(user.referredBy);
      const referrer = await UserModel.collection.findOne({ _id: referrerId });
      
      if (referrer) {
        const referredUsersCount = await UserModel.collection.countDocuments({
          referredBy: referrerId,
          firstPurchaseRewardGiven: true,
        });
        
        if (
          referralSettings.maxReferrals === 0 ||
          referredUsersCount < referralSettings.maxReferrals
        ) {
          // Credit reward to referrer
          await UserModel.collection.updateOne(
            { _id: referrerId },
            {
              $inc: { walletBalance: referralSettings.cashbackAmount },
            }
          );

          // Update user's reward status
          await UserModel.collection.updateOne(
            { _id: userId },
            {
              $set: {
                firstPurchaseRewardGiven: true,
                firstPurchaseRewardAmount: referralSettings.cashbackAmount,
              },
            }
          );
        }
      }
    }

    // Calculate expiry date
    const expiryDate = new Date(
      Date.now() + course.duration * 24 * 60 * 60 * 1000
    );

    // Add new course to user's purchased courses (using new format)
    await UserModel.collection.updateOne(
      { _id: userId },
      {
        $push: {
          purchasedCourses: {
            course: courseId,
            purchaseDate: new Date(),
            expiryDate: expiryDate,
            isExpired: false,
          },
        },
      }
    );

    // Add user to course's enrolledUsers
    await CourseModel.collection.updateOne(
      { _id: courseId },
      {
        $addToSet: { enrolledUsers: userId },
      }
    );

     // ✅ Send notification after purchase success
    await notificationHelper.notifyCoursesPurchase({
      userId,
      courseId,
      courseName: course.title,
      purchaseAmount: transaction.amount,
      userName: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    });


    return NextResponse.json({
      success: true,
      message: "Payment successful, access granted",
      saleRecorded: !!agent
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
};