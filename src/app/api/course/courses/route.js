import { NextResponse } from "next/server";
import _db from "../../../../../utils/db";
import CourseModel from "../../../../../models/Courses/Course.model";

await _db();

// Add Multiple Courses
export const POST = async (request) => {
  try {
    const courses = await request.json(); // Expecting an array of objects

    if (!Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json(
        { success: false, error: "Input must be a non-empty array of courses" },
        { status: 400 }
      );
    }

    for (const course of courses) {
      const {
        courseName,
        price,
        duration,
        level,
        languages,
        thumbnail,
        syllabus,
        summaryText,
        editorContent,
        taglineIncludes,
        overviewTagline,
        finalText,
        tagline_in_the_box,
        tagline,
        videoLink,
        courseIncludes = [],
        syllabusOverview = [],
        thoughts = [],
        tags = [],
        category,
        subcategory,
        availability,
        certificate = false,
        instructor,
        featuredCourse = false,
        enrolledUsers = [],
      } = course;

      // Validate required fields
      if (
        !courseName ||
        !price ||
        !duration ||
        !level ||
        !languages ||
        !tagline
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Missing required fields: courseName, price, duration, level, languages, tagline",
          },
          { status: 400 }
        );
      }
    }

    // Save all valid courses to the DB
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
};
