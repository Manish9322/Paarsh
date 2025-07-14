import { NextResponse } from "next/server";
import CourseVideoModel from "../../../../../models/Courses/CouresVideo.model";
import { authMiddleware } from "../../../../../middlewares/auth";
import _db from "../../../../../utils/db";
import UserModel from "../../../../../models/User.model";
import mongoose from "mongoose";

await _db();

export const POST = authMiddleware(async (req) => {
  try {
    const { courseId, courseName, topics } = await req.json();

    // Prepare the topics array with correctly named fields, including resourceId
    const formattedTopics = topics.map((topic) => ({
      topicName: topic.topicName || topic.name,
      videos: topic.videos.map((video) => ({
        videoName: video.videoName || video.name,
        videoId: video.videoId || video.id,
        resourceId: video.resourceId || null, // Include resourceId in the data
        notesId: video.notesId || null,
      })),
    }));

    // Find existing course video or create new one
    let courseVideo = await CourseVideoModel.findOne({ courseId });

    if (courseVideo) {
      courseVideo.topics = formattedTopics;
      await courseVideo.save();
    } else {
      courseVideo = new CourseVideoModel({
        courseId,
        courseName,
        topics: formattedTopics,
      });
      await courseVideo.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Course videos saved successfully",
        data: courseVideo,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error while saving course videos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, ["admin"]);

export const GET = authMiddleware(async (req) => {
  try {
    const { user } = req;

    if (!user) {
      return NextResponse.json(
        { error: "User is not authenticated" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 },
      );
    }

    // Fetch course videos
    const courseVideos = await CourseVideoModel.findOne({ courseId }).populate(
      "courseId",
    );

    if (!courseVideos) {
      return NextResponse.json({ success: false, data: null }, { status: 200 });
    }

    return NextResponse.json(
      { success: true, data: courseVideos },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, ["admin"]);
