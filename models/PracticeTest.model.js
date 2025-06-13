const mongoose = require("mongoose");

const practiceTestSchema = new mongoose.Schema(
  {
    testName: {
      type: String,
      required: true,
    },
    linkedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    skill: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["Easy", "Intermediate", "Difficult"],
      required: true,
    },
    questionCount: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    questions: [
      {
        questionText: {
          type: String,
          required: true,
        },
        options: [
          {
            type: String,
            required: true,
          },
        ],
        correctAnswer: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const PracticeTestModel =
  mongoose.models.PracticeTest ||
  mongoose.model("PracticeTest", practiceTestSchema);

 PracticeTestModel;