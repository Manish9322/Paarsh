const mongoose = require("mongoose");

const courseVideoSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    topics: [
      {
        topicName: { type: String, required: true },
        order: { type: Number, required: true }, 
        videos: [
          {
            title: { type: String, required: true }, 
            videoUrl: { type: String, required: true }, 
            order: { type: Number, required: true }, 
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
