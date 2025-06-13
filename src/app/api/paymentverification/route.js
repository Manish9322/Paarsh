import { NextResponse } from "next/server";
import crypto from "crypto";
import TransactionModel from "../../../../models/Transaction.model";
import UserModel from "../../../../models/User.model";
import CourseModel from "../../../../models/Courses/Course.model";
import { RAZORPAY_KEY_SECRET } from "../../../../config/config";
import AgentModel from "models/Agent.model";
import ReferralSettingsModel from "models/RefferalSetting.model";
import mongoose from "mongoose";

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
    
    // Handle agent referral code if present
    if (transaction.agentRefCode) {
      const agent = await AgentModel.findOne({
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

    // Check if user has any valid purchased courses (in new format)
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

    // Auto-migrate user's purchasedCourses if they have old format data
    if (user.purchasedCourses && user.purchasedCourses.length > 0) {
      const needsMigration = user.purchasedCourses.some(course => {
        return typeof course === 'string' || 
               (course && mongoose.Types.ObjectId.isValid(course) && !course.course);
      });

      if (needsMigration) {
        console.log(`Auto-migrating purchasedCourses for user: ${userId}`);
        
        // Migrate existing courses
        const migratedCourses = [];
        for (const courseRef of user.purchasedCourses) {
          let oldCourseId;
          
          if (typeof courseRef === 'string') {
            oldCourseId = courseRef;
          } else if (courseRef && courseRef.course) {
            // Already in new format
            migratedCourses.push(courseRef);
            continue;
          } else if (mongoose.Types.ObjectId.isValid(courseRef)) {
            oldCourseId = courseRef.toString();
          } else {
            continue; // Skip invalid entries
          }

          try {
            const oldCourse = await CourseModel.collection.findOne({
              _id: new mongoose.Types.ObjectId(oldCourseId)
            });

            if (oldCourse) {
              const durationInDays = oldCourse.duration || 365;
              const purchaseDate = new Date();
              const oldExpiryDate = new Date(
                purchaseDate.getTime() + durationInDays * 24 * 60 * 60 * 1000
              );

              migratedCourses.push({
                course: new mongoose.Types.ObjectId(oldCourseId),
                purchaseDate: purchaseDate,
                expiryDate: oldExpiryDate,
                isExpired: false
              });
            }
          } catch (error) {
            console.log(`Error migrating course ${oldCourseId}:`, error.message);
          }
        }

        // Add the new course
        migratedCourses.push({
          course: courseId,
          purchaseDate: new Date(),
          expiryDate: expiryDate,
          isExpired: false,
        });

        // Update with all migrated courses
        await UserModel.collection.updateOne(
          { _id: userId },
          {
            $set: {
              purchasedCourses: migratedCourses
            }
          }
        );
      } else {
        // No migration needed, just add new course
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
      }
    } else {
      // No existing courses, just add new one
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
    }

    // Add user to course's enrolledUsers
    await CourseModel.collection.updateOne(
      { _id: courseId },
      {
        $addToSet: { enrolledUsers: userId },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Payment successful, access granted",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
};