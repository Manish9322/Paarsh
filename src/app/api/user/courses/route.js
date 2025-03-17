import { NextResponse } from "next/server";
import UserModel from "../../../../../models/User.model";
import CourseVideoModel from "../../../../../models/Courses/CouresVideo.model";
import { authMiddleware } from "../../../../../middlewares/auth";
import _db from "../../../../../utils/db";
import CourseModel from "../../../../../models/Courses/Course.model";


_db();

export const GET = authMiddleware(async (req) => {
  try {
    const { user } = req;

    if (!user) {
      return NextResponse.json(
        { error: "User is not authenticated" },
        { status: 401 },
      );
    }

    // Fetch user details along with purchased courses
    const existingUser = await UserModel.findById(user._id).populate({
      path: "purchasedCourses",
      select: "courseName price duration level thumbnail instructor",
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extract purchased course IDs
    const purchasedCourseIds = existingUser.purchasedCourses.map(
      (course) => course._id,
    );

    // Fetch videos for purchased courses
    const courseVideos = await CourseVideoModel.find({
      courseId: { $in: purchasedCourseIds },
    }).populate("courseId", "courseName"); // Populate course name for reference

    // Create response with courses and their videos
    const purchasedCoursesWithVideos = existingUser.purchasedCourses.map(
      (course) => {
        const videos = courseVideos.find(
          (cv) => String(cv.courseId._id) === String(course._id),
        );
        return {
          ...course.toObject(),
          videos: videos ? videos.topics : [], // Attach videos if found, otherwise empty array
        };
      },
    );

    return NextResponse.json(
      { purchasedCourses: purchasedCoursesWithVideos },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
