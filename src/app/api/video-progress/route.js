import { NextResponse } from "next/server";
import _db from "../../../../utils/db";
import { authMiddleware } from "../../../../middlewares/auth";
import CourseVideoModel from "../../../../models/Courses/CouresVideo.model";

_db();

export const POST = authMiddleware(async (request) => {
  try {
    const { videoId, courseId, progress, completed } = await request.json();

    if (!videoId || !courseId || progress === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the course video document
    let courseVideo = await CourseVideoModel.findOne({ courseId: courseId });

    if (!courseVideo) {
      return NextResponse.json(
        { success: false, error: "Course video not found" },
        { status: 404 }
      );
    }

    // Check if the video is already completed
    let videoUpdated = false;
    let wasAlreadyCompleted = false;

    courseVideo.topics = courseVideo.topics.map(topic => ({
      ...topic,
      videos: topic.videos.map(video => {
        if (video._id.toString() === videoId.toString()) {
          if (video.completed) {
            wasAlreadyCompleted = true; // Flag if video is already completed
            return video; // Skip updating if already completed
          }
          videoUpdated = true;
          return {
            ...video,
            progress: Math.min(progress, 100), // Cap progress at 100
            completed: completed || false
          };
        }
        return video;
      })
    }));

    if (wasAlreadyCompleted) {
      return NextResponse.json({
        success: true,
        message: "Video is already completed, no updates applied",
        wasAlreadyCompleted: true,
        data: courseVideo
      });
    }

    if (!videoUpdated) {
      return NextResponse.json(
        { success: false, error: "Video not found in course" },
        { status: 404 }
      );
    }

    await courseVideo.save();

    return NextResponse.json({
      success: true,
      message: "Video progress updated successfully",
      wasAlreadyCompleted: false,
      data: courseVideo
    });
  } catch (error) {
    console.error("Error updating video progress:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
});

export const GET = authMiddleware(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      );
    }

    const courseVideo = await CourseVideoModel.findOne({ courseId });

    if (!courseVideo) {
      return NextResponse.json(
        { success: false, error: "Course video not found" },
        { status: 404 }
      );
    }
    
    // Transform the data into a more convenient format for the frontend
    const progressData = {};
    courseVideo.topics.forEach(topic => {
      topic.videos.forEach(video => {
        progressData[video.videoId] = {
          progress: video.progress || 0,
          completed: video.completed || false
        };
      });
    });

    return NextResponse.json({
      success: true,
      data: progressData
    });
  } catch (error) {
    console.error("Error fetching video progress:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
});