import { NextResponse } from "next/server";
import crypto from "crypto";
import TransactionModel from "../../../../models/Transaction.model";
import UserModel from "../../../../models/User.model";
import CourseModel from "../../../../models/Courses/Course.model";
import { RAZORPAY_KEY_SECRET } from "../../../../config/config";

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

    transaction.status = "SUCCESS";
    transaction.paymentId = razorpay_payment_id;
    transaction.signature = razorpaySignature;
    await transaction.save();

    // Fetch user and course details

    const user = await UserModel.findById(transaction.userId);

    const isFirstPurchase = user.purchasedCourses.length === 0;

    // If first purchase and referredBy exists and reward not given
    if (isFirstPurchase && user.referredBy && !user.firstPurchaseRewardGiven) {
      const referrer = await UserModel.findById(user.referredBy);
      if (referrer) {
        // Reward logic: e.g., add ₹100 to walletBalance (you need walletBalance field in user model)
        referrer.walletBalance = (referrer.walletBalance || 0) + 100;
        await referrer.save();

        user.firstPurchaseRewardGiven = true; // Important to not give reward twice
      }
    }

    await user.save();

    await UserModel.findByIdAndUpdate(transaction.userId, {
      $push: { purchasedCourses: transaction.courseId },
    });
    await CourseModel.findByIdAndUpdate(transaction.courseId, {
      $push: { enrolledUsers: transaction.userId },
    });

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
