import { NextResponse } from "next/server";
import _db from "../../../../../utils/db";
import CourseModel from "../../../../../models/Courses/Course.model";

_db();

export const GET = async (req) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    console.log("id is the : ", id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 },
      );
    }

    const course = await CourseModel.findById(id).exec();
    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
};
