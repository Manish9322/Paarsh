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

    console.log("User Progress:", userProgressList);

    const completedCourses = [];

    // Loop through the user's progress records
    for (let progressDoc of userProgressList) {
      if (progressDoc.courseCompleted) {
        // Fetch the course details for each completed course
        const courseDetails = await CourseModel.findById(progressDoc.courseId); // Assuming you store course data in CourseModel
          console.log("Course Details:", courseDetails);
        if (courseDetails) {
          completedCourses.push({
            courseId: progressDoc.courseId, // courseId from user progress
            courseProgress: progressDoc.courseProgress,
            courseName: courseDetails.courseName, // Adding course name
            courseDuration: courseDetails.duration, // Adding course 
            courseLevel: courseDetails.level, // Adding course level
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      completedCourses, // Send the list of completed courses with additional details
    });

  } catch (error) {
    console.error("Error fetching completed courses:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["user"]);
