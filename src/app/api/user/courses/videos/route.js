import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../../../middlewares/auth";
import _db from "../../../../../../utils/db";
import mongoose from "mongoose";
import UserModel from "models/User.model";
import CourseVideoModel from "models/Courses/CouresVideo.model";


export const GET = authMiddleware(async (req) => {
  try {
    const { user } = req;

    if (!user) {
      return NextResponse.json(
        { error: "User is not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Await user data from DB
    const userData = await UserModel.findById(user._id).select("purchasedCourses");

    // Check if courseId is among purchased courses
    const hasPurchased = userData.purchasedCourses.some((purchasedCourseId) =>
      purchasedCourseId.equals(new mongoose.Types.ObjectId(courseId))
    );
      
    if (!hasPurchased) {
      return NextResponse.json(
        { error: "You have not purchased this course" },
        { status: 403 }
      );
    }

    // Fetch course videos
    const courseVideos = await CourseVideoModel.findOne({ courseId }).populate("courseId");

    if (!courseVideos) {
      return NextResponse.json({ success: false, data: null }, { status: 200 });
    }

    return NextResponse.json(
      { success: true, data: courseVideos },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});