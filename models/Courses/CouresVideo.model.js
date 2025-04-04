const mongoose = require("mongoose");

const courseVideoSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    enrolledUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    topics: [
      {
        topicName: { type: String, required: true },
        videos: [
          {
            videoName: { type: String, required: true },
            videoId: { type: String, required: true },
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

const CourseVideoModel =
  mongoose.models.CourseVideo ||
  mongoose.model("CourseVideo", courseVideoSchema);

module.exports = CourseVideoModel;
