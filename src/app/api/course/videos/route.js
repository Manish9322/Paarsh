import { NextResponse } from "next/server";
import CourseVideoModel from "../../../../../models/Courses/CouresVideo.model";
import { authMiddleware } from "../../../../../middlewares/auth";
import _db from "../../../../../utils/db";

_db();

export const POST = authMiddleware(async (req) => {
  try {
    const { courseId, topics } = await req.json();
    const newCourseVideo = new CourseVideoModel({ courseId, topics });

    await newCourseVideo.save();
    return NextResponse.json(
      { message: "Course videos added successfully", newCourseVideo },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, true);

export const GET = authMiddleware(async (req) => {
  try {
    const { user } = req;

    if (!user) {
      return NextResponse.json(
        { error: "User is not authenticated" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 },
      );
    }

    const courseVideos = await CourseVideoModel.findOne({ courseId }).populate(
      "courseId",
    );

    if (!courseVideos) {
      return NextResponse.json(
        { error: "No videos found for this course" },
        { status: 404 },
      );
    }

    return NextResponse.json({ courseVideos }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
