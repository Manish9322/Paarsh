import { NextResponse } from "next/server";
import UserModel from "../../../../../models/User.model";
import CourseVideoModel from "../../../../../models/Courses/CouresVideo.model";
import { authMiddleware } from "../../../../../middlewares/auth";
import _db from "../../../../../utils/db";
import CourseModel from "../../../../../models/Courses/Course.model";
import mongoose from "mongoose";

await _db();

// Helper function to convert buffer to ObjectId
function bufferToObjectId(buffer) {
  if (!buffer || !buffer.data) return null;
  try {
    // Convert buffer data array to Buffer and then to ObjectId
    const bufferObj = Buffer.from(buffer.data || buffer);
    return new mongoose.Types.ObjectId(bufferObj);
  } catch (error) {
    console.error("Error converting buffer to ObjectId:", error);
    return null;
  }
}

export const GET = authMiddleware(async (req) => {
  try {
    const { user } = req;

    if (!user) {
      return NextResponse.json(
        { error: "User is not authenticated" },
        { status: 401 },
      );
    }

    // Fetch user details without population first
    const existingUser = await UserModel.findById(user._id);
    
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extract course IDs from the buffer data
    const courseIds = [];
    const purchasedCoursesWithIds = [];

    existingUser.purchasedCourses.forEach((course) => {
      let courseId = null;
      
      // Check if course field exists and is valid
      if (course.course) {
        courseId = course.course;
      } 
      // If course field is missing but buffer exists, try to convert buffer to ObjectId
      else if (course.buffer) {
        courseId = bufferToObjectId(course.buffer);
      }

      if (courseId) {
        courseIds.push(courseId);
        purchasedCoursesWithIds.push({
          ...course.toObject(),
          courseId: courseId
        });
      } else {
        console.warn("Could not extract course ID from:", course);
      }
    });

    if (courseIds.length === 0) {
      return NextResponse.json(
        { purchasedCourses: [] },
        { status: 200 },
      );
    }

    // Fetch course details
    const courses = await CourseModel.find({ 
      _id: { $in: courseIds } 
    }).select("courseName price duration level thumbnail instructor");
    
    
    // Create a map for quick lookup
    const courseMap = courses.reduce((map, course) => {
      map[course._id.toString()] = course;
      return map;
    }, {});
    
    // Fetch videos for purchased courses
    const courseVideos = await CourseVideoModel.find({
      courseId: { $in: courseIds },
    }).populate("courseId", "courseName");


    // Create response with manual population
    const purchasedCoursesWithVideos = purchasedCoursesWithIds.map((course) => {
      const courseDetails = courseMap[course.courseId.toString()];
      const videos = courseVideos.find(
        (cv) => String(cv.courseId._id) === String(course.courseId),
      );

      return {
        _id: course._id,
        course: courseDetails || null,
        purchaseDate: course.purchaseDate,
        expiryDate: course.expiryDate,
        isExpired: course.isExpired,
        videos: videos ? videos.topics : [],
      };
    });

    return NextResponse.json(
      { purchasedCourses: purchasedCoursesWithVideos },
      { status: 200 },
    );

  } catch (error) {
    console.error("Error fetching purchased courses:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, ["user"]);