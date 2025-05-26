import { NextResponse } from "next/server";
import _db from "../../../../utils/db";
import CourseModel from "../../../../models/Courses/Course.model";
import PracticeTestModel from "../../../../models/PracticeTest.model";
import { authMiddleware } from "../../../../middlewares/auth";

_db();

export const GET = authMiddleware(async (request) => {
  try {
    const userId = request.user.id; // Assuming authMiddleware adds user to request

    // Find courses where the user is enrolled
    const enrolledCourses = await CourseModel.find({
      enrolledUsers: userId,
    }).select("_id");

    const courseIds = enrolledCourses.map((course) => course._id);

    // Find practice tests linked to these courses
    const practiceTests = await PracticeTestModel.find({
      linkedCourses: { $in: courseIds },
    }).populate("linkedCourses", "courseName");

    return NextResponse.json({
      success: true,
      data: practiceTests,
    });
  } catch (error) {
    console.error("Error fetching user practice tests:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["user"]);