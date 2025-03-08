import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import authMiddleware from "../../../../middlewares/auth";
import UserModel from "../../../../models/User.model";
import CourseModel from "../../../../models/Courses/Course.model";
import TransactionModel from "../../../../models/Transaction.model";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "@/config/config";

export const POST = authMiddleware(async (request) => {
  try {
    const { userId, courseId } = await request.json();

    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, error: "User ID and Course ID required" },
        { status: 400 },
      );
    }

    const user = await UserModel.findById(userId);
    const course = await CourseModel.findById(courseId);

    if (!user || !course) {
      return NextResponse.json(
        { success: false, error: "User or Course not found" },
        { status: 404 },
      );
    }

    if (user.purchasedCourses.includes(courseId)) {
      return NextResponse.json(
        { success: false, error: "Course already purchased" },
        { status: 400 },
      );
    }

    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: parseInt(course.price) * 100, // Convert to paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    });

    const newTransaction = new TransactionModel({
      userId,
      courseId,
      orderId: order.id,
      amount: parseInt(course.price),
      status: "PENDING",
    });

    await newTransaction.save();

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
});
