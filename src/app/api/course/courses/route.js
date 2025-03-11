import { NextResponse } from "next/server";
import _db from "../../../../../utils/db";
import CourseModel from "../../../../../models/Courses/Course.model";
import { authMiddleware } from "../../../../../middlewares/auth";

_db();

// Add Multiple Courses
export const POST = authMiddleware(async (request) => {
  try {
    const courses = await request.json(); // Expecting an array of objects

    // Validate if the input is an array and not empty
    if (!Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json(
        { success: false, error: "Input must be a non-empty array of courses" },
        { status: 400 }
      );
    }

    // Validate required fields for each course
    for (const course of courses) {
      const {
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
        editorContent,
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
      } = course;

      if (!category || !courseName || !duration || !price || !languages || !level || !instructor || !tagline) {
        return NextResponse.json(
          { success: false, error: "All required fields must be provided for each course" },
          { status: 400 }
        );
      }
    }

    // Insert multiple courses at once
    const newCourses = await CourseModel.insertMany(courses);

    return NextResponse.json({
      success: true,
      message: "Courses added successfully",
      data: newCourses,
    });

  } catch (error) {
    console.error("Error while adding courses:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, true);
