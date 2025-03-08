import { NextResponse } from "next/server";
import _db from "../../../../../utils/db";
import CourseModel from "../../../../../models/Courses/Course.model";

_db();

export const GET = async (req) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    console.log("Course ID:", id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      );
    }

    // ✅ Fetch full course data but with optimizations
    const course = await CourseModel.findById(id)
      .lean() // Convert Mongoose document to a plain JavaScript object
      .exec();

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    console.error("Error fetching course:", error.message);

    if (error.name === "CastError") {
      return NextResponse.json(
        { success: false, error: "Invalid Course ID" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};
