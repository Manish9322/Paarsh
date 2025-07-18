import { NextResponse } from "next/server";
import _db from "../../../../utils/db";
import { authMiddleware } from "../../../../middlewares/auth";
import CourseVideoModel from "../../../../models/Courses/CouresVideo.model";
import UserProgressModel from "../../../../models/Courses/UserProgress.model";

await _db();

export const POST = authMiddleware(async (request) => {
  try {
    const { videoId, courseId, progress, completed } = await request.json();
    const userId = request.user._id; // Assuming authMiddleware attaches user info to request

    // Validate input
    if (!videoId || !courseId || progress === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the course exists and the video is part of it
    const courseVideo = await CourseVideoModel.findOne({ courseId });
    if (!courseVideo) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    let videoExists = false;
    for (const topic of courseVideo.topics) {
      if (topic.videos.some((video) => video._id.toString() === videoId.toString())) {
        videoExists = true;
        break;
      }
    }

    if (!videoExists) {
      return NextResponse.json(
        { success: false, error: "Video not found in course" },
        { status: 404 }
      );
    }

    // Find or create user progress document
    let userProgress = await UserProgressModel.findOne({
      userId,
      courseId,
    });

    if (!userProgress) {
      userProgress = new UserProgressModel({
        userId,
        courseId,
        progress: [],
        courseProgress: 0,
        courseCompleted: false,
      });
    }

    // Check if video progress exists
    let videoProgress = userProgress.progress.find(
      (vp) => vp.videoId === videoId
    );

    if (videoProgress && videoProgress.completed) {
      return NextResponse.json({
        success: true,
        message: "Video is already completed, no updates applied",
        wasAlreadyCompleted: true,
        data: videoProgress,
      });
    }

    if (videoProgress) {
      // Update existing video progress
      videoProgress.progress = Math.min(progress, 100);
      videoProgress.completed = completed || progress === 100;
    } else {
      // Add new video progress
      userProgress.progress.push({
        videoId,
        progress: Math.min(progress, 100),
        completed: completed || progress === 100,
      });
    }

    // Calculate course progress
    const totalVideos = courseVideo.topics.reduce(
      (sum, topic) => sum + topic.videos.length,
      0
    );

    const totalProgress = userProgress.progress.reduce(
      (sum, vid) => sum + vid.progress,
      0
    );

    userProgress.courseProgress = totalVideos > 0 ? totalProgress / totalVideos : 0;

    // Check if course is completed
    userProgress.courseCompleted = userProgress.progress.length === totalVideos &&
      userProgress.progress.every((vid) => vid.completed);

    await userProgress.save();

    return NextResponse.json({
      success: true,
      message: "Video progress updated successfully",
      wasAlreadyCompleted: false,
      data: {
        videoProgress: userProgress.progress.find((vp) => vp.videoId === videoId),
        courseProgress: userProgress.courseProgress,
        courseCompleted: userProgress.courseCompleted,
      },
    });
  } catch (error) {
    console.error("Error updating video progress:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["user"]);

export const GET = authMiddleware(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const userId = request.user._id; // Assuming authMiddleware attaches user info to request

    // Validate input
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Check if the course exists
    const courseVideo = await CourseVideoModel.findOne({ courseId });
    if (!courseVideo) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Find user progress
    const userProgress = await UserProgressModel.findOne({
      userId,
      courseId,
    });

    // Transform progress data into a convenient format for the frontend
    const progressData = {
      videos: {},
      courseProgress: 0,
      courseCompleted: false,
    };

    if (userProgress) {
      userProgress.progress.forEach((video) => {
        progressData.videos[video.videoId] = {
          progress: video.progress || 0,
          completed: video.completed || false,
        };
      });
      progressData.courseProgress = userProgress.courseProgress || 0;
      progressData.courseCompleted = userProgress.courseCompleted || false;
    }

    return NextResponse.json({
      success: true,
      data: progressData,
    });
  } catch (error) {
    console.error("Error fetching video progress:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
  
}, ["user"]);
