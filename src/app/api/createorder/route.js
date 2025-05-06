import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import {authMiddleware} from "../../../../middlewares/auth";
import UserModel from "../../../../models/User.model";
import CourseModel from "../../../../models/Courses/Course.model";
import TransactionModel from "../../../../models/Transaction.model";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "../../../../config/config";
import shortid from "shortid";
import _db from "../../../../utils/db";

_db();

export const POST = authMiddleware(async (request) => {
  try {
    const { userId, courseId, amount, offerId } = await request.json();

    if (!userId || !courseId || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
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
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const payment_capture = 1;
    const currency = "INR";
    const options = {
      amount: (amount * 100).toString(),
      currency,
      receipt: shortid.generate(),
      payment_capture,
      notes: {
        userId,
        courseId,
        offerId, // Include offer ID in payment notes if available
      },
    };

    try {
      const order = await razorpay.orders.create(options);
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
        data: {
          id: order.id,
          currency: order.currency,
          amount: order.amount,
        },
      });
    } catch (err) {
      console.log(err);
      return NextResponse.json(
        { success: false, error: "Error creating order" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
});
