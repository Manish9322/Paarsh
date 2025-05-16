import { NextResponse } from "next/server";
import _db from "../../../../../utils/db";
import { authMiddleware } from "../../../../../middlewares/auth";
import CourseModel from "models/Courses/Course.model";
import UserProgressModel from "models/Courses/UserProgress.model";

_db();

export const GET = authMiddleware(async (request) => {
  try {
    const {user} = request;

    const userId = user._id;

    // Fetch all progress records for the user
    const userProgress = await UserProgressModel.find({ userId })
      .populate("courseId") // Populate course details if needed
      .lean();

    if (!userProgress.length) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Transform data
    const progressData = userProgress.map((progress) => ({
      courseId: progress.courseId._id,
      courseProgress: progress.courseProgress,
      courseCompleted: progress.courseCompleted,
      updatedAt: progress.updatedAt,
      courseName: progress.courseId.courseName, // Assuming populated
      thumbnail: progress.courseId.thumbnail,
      level: progress.courseId.level,
      instructor: progress.courseId.instructor,
    }));

    return NextResponse.json({
      success: true,
      data: progressData,
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["user"]);