import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import { authMiddleware } from "../../../../../middlewares/auth"; // Adjust path
import UserModel from "../../../../../models/User.model";
import CourseModel from "../../../../../models/Courses/Course.model";
import TransactionModel from "../../../../../models/Transaction.model";
import ReferralSettingsModel from "../../../../../models/RefferalSetting.model"; // Add this import
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "../../../../../config/config";
import _db from "../../../../../utils/db";

_db();

export const POST = authMiddleware(async (request) => {
  try {
    const { transactionId, adminNote } = await request.json();

    // Validate input
    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: "Missing transactionId" },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return NextResponse.json(
        { success: false, error: "Invalid transactionId format" },
        { status: 400 }
      );
    }
    
    //  Find transaction
    const transaction = await TransactionModel.findById(transactionId);
    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    //  Verify transaction is PENDING
    if (transaction.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          error: `Transaction already processed with status: ${transaction.status}`,
        },
        { status: 400 }
      );
    }

    //  Find user and course
    // Convert IDs to ObjectId for MongoDB operations
    const userId = new mongoose.Types.ObjectId(transaction.userId);
    const courseId = new mongoose.Types.ObjectId(transaction.courseId);
    
    // Get user and course details
    const user = await UserModel.collection.findOne({ _id: userId });
    const course = await CourseModel.collection.findOne({ _id: courseId });
    const referralSettings = await ReferralSettingsModel.findOne();

    if (!user || !course) {
      return NextResponse.json(
        { success: false, error: "User or Course not found" },
        { status: 404 }
      );
    }

    // Check if user has any valid purchased courses (in new format)
    const validPurchasedCourses = (user.purchasedCourses || []).filter(
      pc => pc && pc.course && pc.expiryDate
    );
    
    // Check if user already has access to this course
    const existingPurchase = validPurchasedCourses.find(
      (purchase) => purchase.course.toString() === transaction.courseId.toString()
    );
    
    if (existingPurchase) {
      return NextResponse.json(
        { success: false, error: "Course already purchased" },
        { status: 400 }
      );
    }

    //  Verify payment status with Razorpay
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    let payment;
    try {
      // Fetch payments for the order
      const payments = await razorpay.orders.fetchPayments(transaction.orderId);
      // Find a successful payment
      payment = payments.items.find((p) => p.status === "captured");

      if (!payment) {
        return NextResponse.json(
          {
            success: false,
            error: "No successful payment found for this order",
          },
          { status: 400 }
        );
      }
    } catch (err) {
      console.error("Razorpay API error:", err);
      return NextResponse.json(
        { success: false, error: "Error verifying payment with Razorpay" },
        { status: 500 }
      );
    }

    //  Use MongoDB transaction for atomic updates
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Update transaction to SUCCESS
      transaction.status = "SUCCESS";
      transaction.paymentId = payment.id;
      transaction.signature = "MANUAL"; // No signature since verified via API
      transaction.updatedAt = new Date();
      await transaction.save({ session });

      // Calculate expiry date based on course duration
      const expiryDate = new Date(
        Date.now() + course.duration * 24 * 60 * 60 * 1000
      );
      const purchaseDate = new Date();

      // Update user: Add course to purchasedCourses with new schema structure
      const courseData = {
        course: transaction.courseId,
        purchaseDate: purchaseDate,
        expiryDate: expiryDate,
        isExpired: false
      };

      await UserModel.findByIdAndUpdate(
        transaction.userId,
        { $push: { purchasedCourses: courseData } },
        { session, new: true }
      );

      // Update course: Add user to enrolledUsers
      await CourseModel.findByIdAndUpdate(
        transaction.courseId,
        { $push: { enrolledUsers: transaction.userId } },
        { session, new: true }
      );

      // Handle agent referral code if present
      if (transaction.agentRefCode) {
        const AgentModel = mongoose.model("Agent"); // Adjust model name/path
        const agent = await AgentModel.findOne({
          agentCode: transaction.agentRefCode,
        }).session(session);
        if (agent) {
          agent.totalSale = (agent.totalSale || 0) + transaction.amount;
          agent.countSale = (agent.countSale || 0) + 1;
          await agent.save({ session });
        }
      }

      // Handle referral reward if first purchase
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

      await session.commitTransaction();
      console.log("Manual course access granted:", {
        transactionId,
        orderId: transaction.orderId,
        userId: transaction.userId,
        courseId: transaction.courseId,
        paymentId: payment.id,
        expiryDate: expiryDate,
        adminNote,
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Database transaction error:", error);
      throw error;
    } finally {
      session.endSession();
    }

    return NextResponse.json({
      success: true,
      data: {
        transactionId,
        orderId: transaction.orderId,
        userId: transaction.userId,
        courseId: transaction.courseId,
        expiryDate: expiryDate,
      },
    });
  } catch (error) {
    console.error("POST /admin/grant-manual-access error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["admin"]);