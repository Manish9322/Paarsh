import { NextResponse } from "next/server";
import _db from "../../../../../utils/db";
import { authMiddleware } from "../../../../../middlewares/auth";
import UserProgressModel from "../../../../../models/Courses/UserProgress.model";
import CourseModel from "../../../../../models/Courses/Course.model"; // Assuming you have a Course model

_db();

export const GET = authMiddleware(async (request) => {
  try {
    const userId = request.user._id; // Assuming authMiddleware attaches user info to request

    // Find all user progress documents
    const userProgressList = await UserProgressModel.find({ userId });

   

    const completedCourses = [];
    const allCoursesProgress = [];

    // Loop through the user's progress records
    for (let progressDoc of userProgressList) {
      const courseDetails = await CourseModel.findById(progressDoc.courseId); // Assuming you store course data in CourseModel
      if (courseDetails) {
        // Push to allCoursesProgress
        allCoursesProgress.push({
          courseId: progressDoc.courseId,
          courseProgress: progressDoc.courseProgress,
          courseCompleted: progressDoc.courseCompleted,
          courseName: courseDetails.courseName,
          courseDuration: courseDetails.duration,
          courseLevel: courseDetails.level,
        });

        // Push to completedCourses if completed
        if (progressDoc.courseCompleted) {
          completedCourses.push({
            courseId: progressDoc.courseId,
            courseProgress: progressDoc.courseProgress,
            courseName: courseDetails.courseName,
            courseDuration: courseDetails.duration,
            courseLevel: courseDetails.level,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      completedCourses,      // Only completed courses
      allCoursesProgress,    // All progress records
    });

  } catch (error) {
    console.error("Error fetching course data:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["user"]);
