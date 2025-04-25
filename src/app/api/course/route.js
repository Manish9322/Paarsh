import { NextResponse } from "next/server";
import _db from "../../../../utils/db";
import CourseModel from "../../../../models/Courses/Course.model";
import { authMiddleware } from "../../../../middlewares/auth";
import { uploadBase64ToVPS } from "../../../../utils/uploadfile";

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

    const thumbnailUrl = thumbnail
      ? await uploadBase64ToVPS(thumbnail, "thumbnail")
      : null;
    const syllabusUrl = syllabus
      ? await uploadBase64ToVPS(syllabus, "syllabus")
      : null;
    const videoUrl = videoLink
      ? await uploadBase64ToVPS(videoLink, "videoLink")
      : null;

    

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
      thumbnail: thumbnailUrl,
      syllabus: syllabusUrl,
      summaryText,
      editorContent,
      tagline,
      taglineIncludes,
      overviewTagline,
      finalText,
      tagline_in_the_box,
      videoLink: videoUrl,
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

    // Fetch the existing course first to compare files
    const existingCourse = await CourseModel.findById(id);
    if (!existingCourse) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 },
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
      editorContent,
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

    // Helper function to remove old file from VPS
    const removeOldFileFromVPS = async (oldFileUrl) => {
      if (oldFileUrl) {
        try {
          // Extract file path from URL
          const filePathMatch = oldFileUrl.match(/\/uploads\/(.+)$/);
          if (filePathMatch && filePathMatch[1]) {
            const filePath = `uploads/${filePathMatch[1]}`;
            // Call a function to delete the file (you'll need to implement this)
            await deleteFileFromVPS(filePath);
          }
        } catch (error) {
          console.error("Error removing old file:", error);
          // Continue with the update even if file removal fails
        }
      }
    };

    // Process thumbnail
    let thumbnailUrl = existingCourse.thumbnail;
    if (thumbnail) {
      if (thumbnail.startsWith('data:')) {
        // If there's a new thumbnail, remove the old one
        if (existingCourse.thumbnail) {
          await removeOldFileFromVPS(existingCourse.thumbnail);
        }
        thumbnailUrl = await uploadBase64ToVPS(thumbnail, "thumbnail");
      } else if (thumbnail !== existingCourse.thumbnail) {
        // If thumbnail is a URL but different from existing, update it
        thumbnailUrl = thumbnail;
      }
    }
    
    // Process syllabus
    let syllabusUrl = existingCourse.syllabus;
    if (syllabus) {
      if (syllabus.startsWith('data:')) {
        // If there's a new syllabus, remove the old one
        if (existingCourse.syllabus) {
          await removeOldFileFromVPS(existingCourse.syllabus);
        }
        syllabusUrl = await uploadBase64ToVPS(syllabus, "syllabus");
      } else if (syllabus !== existingCourse.syllabus) {
        // If syllabus is a URL but different from existing, update it
        syllabusUrl = syllabus;
      }
    }
    
    // Process video link
    let videoUrl = existingCourse.videoLink;
    if (videoLink) {
      if (videoLink.startsWith('data:')) {
        // If there's a new video, remove the old one
        if (existingCourse.videoLink) {
          await removeOldFileFromVPS(existingCourse.videoLink);
        }
        videoUrl = await uploadBase64ToVPS(videoLink, "videoLink");
      } else if (videoLink !== existingCourse.videoLink) {
        // If video link is a URL but different from existing, update it
        videoUrl = videoLink;
      }
    }

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
          thumbnail: thumbnailUrl,
          syllabus: syllabusUrl,
          summaryText,
          tagline,
          taglineIncludes,
          overviewTagline,
          editorContent,
          finalText,
          tagline_in_the_box,
          videoLink: videoUrl,
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
