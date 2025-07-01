import { NextResponse } from "next/server";
import FeedbackModel from "../../../../models/Feedback.model";
import UserModel from "../../../../models/User.model";

export async function GET() {
  try {
    const feedbacks = await FeedbackModel.find()
      .populate("userId", "name email")
      .populate("courseId", "courseName")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { feedbackText, rating, userId, courseId } = await request.json();

    // Validate input
    if (!feedbackText || !rating || !userId || !courseId) {
      return NextResponse.json(
        {
          success: false,
          message: "Feedback text, rating, user ID and course ID are required",
        },
        { status: 400 },
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be between 1 and 5",
        },
        { status: 400 },
      );
    }

    // Verify user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      // Fallback to anonymous user if userId is invalid
      const defaultUser = await UserModel.findOne({
        email: "anonymous@example.com",
      });
      const fallbackUserId = defaultUser
        ? defaultUser._id
        : (
            await UserModel.create({
              name: "Anonymous",
              email: "anonymous@example.com",
            })
          )._id;

      const feedback = new FeedbackModel({
        userId,
        feedbackText,
        rating,
        courseId,
      });

      await feedback.save();

      return NextResponse.json({
        success: true,
        data: feedback,
      });
    }

    const feedback = new FeedbackModel({
      userId,
      feedbackText,
      rating,
      courseId,
    });

    await feedback.save();

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Feedback ID is required",
        },
        { status: 400 },
      );
    }

    const feedback = await FeedbackModel.findByIdAndDelete(id);

    if (!feedback) {
      return NextResponse.json(
        {
          success: false,
          message: "Feedback not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}
