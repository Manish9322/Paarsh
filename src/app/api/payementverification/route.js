import { NextResponse } from "next/server";
import crypto from "crypto";
import TransactionModel from "../../../../models/Transaction.model";
import UserModel from "../../../../models/User.model";
import CourseModel from "../../../../models/Courses/Course.model";
import { RAZORPAY_KEY_SECRET } from "@/config/config";

export const POST = async (request) => {
  try {
    const razorpaySignature = request.headers.get("x-razorpay-signature");

    if (!razorpaySignature) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { order_id, razorpay_payment_id, razorpay_signature } =
      body.payload.payment.entity;

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

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 },
      );
    }

    transaction.status = "SUCCESS";
    transaction.paymentId = razorpay_payment_id;
    transaction.signature = razorpay_signature;
    await transaction.save();

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
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
};
