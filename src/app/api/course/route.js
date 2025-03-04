import { NextResponse } from "next/server";
import _db from "../../../../utils/db";
import CourseModel from "../../../../models/Courses/Course.model";
import { authMiddleware } from "../../../../middlewares/auth";

_db();

//  Create Course
export const POST = authMiddleware(async (request) => {
  try {
    const {
      courseCategory,
      courseSubCategory,
      courseName,
      courseDuration,
      courseFees,
      languages,
      level,
      courseType,
      instructor,
      thumbnailImage,
      shortDescription,
      longDescription,
      availability,
      keywords,
      feturedCourse,
    } = await request.json();

    if (
      !courseCategory ||
      !courseName ||
      !courseDuration ||
      !courseFees ||
      !languages ||
      !level ||
      !courseType ||
      !instructor ||
      !thumbnailImage ||
      !shortDescription ||
      !longDescription ||
      !keywords
    ) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 },
      );
    }

    const newCourse = new CourseModel({
      courseCategory,
      courseSubCategory,
      courseName,
      courseDuration,
      courseFees,
      languages,
      level,
      courseType,
      instructor,
      thumbnailImage,
      shortDescription,
      longDescription,
      availability,
      keywords,
      feturedCourse,
    });

    await newCourse.save();

    return NextResponse.json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.error("Error while creating course:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, true);

//  Get All Courses
export const GET = (async () => {
  try {
    const courses = await CourseModel.find();
    return NextResponse.json({ success: true, data: courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
});

//  Update Course
export const PUT = authMiddleware(async (request) => {
  try {
    const { ...updateData } = await request.json();
    const id = updateData?.formData?._id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 },
      );
    }

    const requiredFields = [
      "courseCategory",
      "courseName",
      "courseDuration",
      "courseFees",
      "languages",
      "level",
      "courseType",
      "instructor",
      "thumbnailImage",
      "shortDescription",
      "longDescription",
      "keywords",
    ];

    for (const field of requiredFields) {
      if (!updateData?.formData[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 },
        );
      }
    }

    const updatedCourse = await CourseModel.findByIdAndUpdate(
      id,
      { $set: updateData?.formData },
      { new: true, runValidators: true },
    );

    if (!updatedCourse) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, true);

//  Delete Course
export const DELETE = authMiddleware(async (request) => {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 },
      );
    }

    const deletedCourse = await CourseModel.findByIdAndDelete(id);

    if (!deletedCourse) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
      data: deletedCourse,
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, true);
