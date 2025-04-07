export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb', // Adjust this limit as needed
    },
  },
};

import { NextResponse } from "next/server";
import CourseVideoModel from "../../../../../models/Courses/CouresVideo.model";
import { authMiddleware } from "../../../../../middlewares/auth";
import _db from "../../../../../utils/db";
import { uploadFileToVPS } from "../../../../../utils/uploadfile"; // Import the VPS upload function

_db();

export const POST = authMiddleware(async (req) => {
  try {
    const { courseId, courseName, topics } = await req.json();
    
    console.log("courseId", courseId);
    console.log("courseName", courseName);
    console.log("topics", topics);

    // Prepare the topics array with correctly named fields
    const formattedTopics = topics.map(topic => ({
      topicName: topic.topicName || topic.name,
      videos: topic.videos.map(video => ({
        videoName: video.videoName || video.name,
        videoId: video.videoId || video.id,
      }))
    }));

    // Iterate over topics and upload videos
    for (const topic of formattedTopics) {
      for (const video of topic.videos) {
        if (video.videoId && video.videoId.startsWith("data:video/")) {
          // Upload the video to VPS
          const videoUrl = await uploadFileToVPS(
            video.videoId,
            video.videoName,
          );
          if (!videoUrl) {
            return NextResponse.json(
              { success: false, message: "Video upload failed" },
              { status: 500 },
            );
          }
          // Replace Base64 with the video URL
          video.videoId = videoUrl;
        }
      }
    }
    
    // Find existing course video or create new one
    let courseVideo = await CourseVideoModel.findOne({ courseId });
    
    if (courseVideo) {
      // Update existing document
      courseVideo.topics = formattedTopics;
      await courseVideo.save();
    } else {
      // Create new document
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
        message: "Course videos uploaded successfully",
        data: courseVideo,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error while uploading course videos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, true);

export const GET = async (req) => {
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
    
    const courseVideos = await CourseVideoModel.findOne({ courseId }).populate(
      "courseId",
    );
    
    if (!courseVideos) {
      return NextResponse.json(
        { success: false, data: null },
        { status: 200 },
      );
    }
    
    return NextResponse.json({ success: true, data: courseVideos }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};