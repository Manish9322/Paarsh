import { NextResponse } from "next/server";
import crypto from "crypto";
import TransactionModel from "../../../../models/Transaction.model";
import UserModel from "../../../../models/User.model";
import CourseModel from "../../../../models/Courses/Course.model";
import { RAZORPAY_KEY_SECRET } from "../../../../config/config";

// GET endpoint to fetch all transactions
export async function GET() {
  try {
    const transactions = await TransactionModel.find()
      .populate('userId', 'name email')
      .populate('courseId', 'courseName price')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}

