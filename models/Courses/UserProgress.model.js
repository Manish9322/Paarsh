const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    progress: [
      {
        videoId: { type: String, required: true },
        progress: { type: Number, default: 0 }, // Progress for individual video (e.g., percentage watched)
        completed: { type: Boolean, default: false }, // Whether the video is completed
      },
    ],
    courseProgress: {
      type: Number,
      default: 0, // Overall course progress (e.g., percentage of all videos completed)
    },
    courseCompleted: {
      type: Boolean,
      default: false, // Whether the entire course is completed
    },
  },
  { timestamps: true }
);

const UserProgressModel =
  mongoose.models.UserProgress ||
  mongoose.model("UserProgress", userProgressSchema);

module.exports = UserProgressModel;