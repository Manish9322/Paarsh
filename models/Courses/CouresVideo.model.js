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
            resourceId: { type: String }, // Optional resource file for each video
            notesId: { type: String }, // Optional notes file for each video
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
export default CourseVideoModel;
