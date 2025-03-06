import { NextResponse } from "next/server";
import _db from "../../../../utils/db";
import CourseModel from "../../../../models/Courses/Course.model";
import { authMiddleware } from "../../../../middlewares/auth";

_db();

// Add Course

export const POST = authMiddleware(async (request) => {
  try {
    const {
      category,
      subcategory,
      courseName,
      duration,
      price,
      level,
      languages,
      instructor,
      thumbnail, // Base64 Image
      syllabus, // Base64 PDF
      summaryText,
      tagline,
      taglineIncludes,
      overviewTagline,
      finalText,
      tagline_in_the_box,
      videoLink,
      courseIncludes = [],
      syllabusOverview = [],
      thoughts = [],
      tags = [],
      availability,
      certificate = false,
      featuredCourse = false,
    } = await request.json();

    // Validate required fields
    if (
      !category ||
      !courseName ||
      !duration ||
      !price ||
      !languages ||
      !level ||
      !instructor ||
      !tagline
    ) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 },
      );
    }

    // Create new course
    const newCourse = new CourseModel({
      category,
      subcategory,
      courseName,
      duration,
      price,
      level,
      languages,
      instructor,
      thumbnail,
      syllabus,
      summaryText,
      tagline,
      taglineIncludes,
      overviewTagline,
      finalText,
      tagline_in_the_box,
      videoLink,
      courseIncludes,
      syllabusOverview,
      thoughts,
      tags,
      availability,
      certificate,
      featuredCourse,
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
export const GET = async () => {
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
};

// Edit Course

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

    // List of required fields
    const requiredFields = [
      "category",
      "courseName",
      "duration",
      "price",
      "languages",
      "level",
      "instructor",
      "tagline",
    ];

    for (const field of requiredFields) {
      if (!updateData?.formData[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 },
        );
      }
    }

    // Extract update data properly
    const {
      category,
      subcategory,
      courseName,
      duration,
      price,
      level,
      languages,
      instructor,
      thumbnail, // Base64 Image
      syllabus, // Base64 PDF
      summaryText,
      tagline,
      taglineIncludes,
      overviewTagline,
      finalText,
      tagline_in_the_box,
      videoLink,
      courseIncludes = [],
      syllabusOverview = [],
      thoughts = [],
      tags = [],
      availability,
      certificate = false,
      featuredCourse = false,
    } = updateData?.formData;

    // Find and update course
    const updatedCourse = await CourseModel.findByIdAndUpdate(
      id,
      {
        $set: {
          category,
          subcategory,
          courseName,
          duration,
          price,
          level,
          languages,
          instructor,
          thumbnail,
          syllabus,
          summaryText,
          tagline,
          taglineIncludes,
          overviewTagline,
          finalText,
          tagline_in_the_box,
          videoLink,
          courseIncludes,
          syllabusOverview,
          thoughts,
          tags,
          availability,
          certificate,
          featuredCourse,
        },
      },
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
