import mongoose from "mongoose";

const testSessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true,
  },
  testId: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number,

    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["pending", "active", "completed"],
    default: "pending",
  },
  questions: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "aptitudeQuestions",
        required: true,
      },
      selectedAnswer: { type: Number, default: -1 },
      isCorrect: { type: Boolean, default: false },
      timeSpent: { type: Number, default: 0 },
    },
  ],
  ipAddress: { type: String },
  userAgent: { type: String },
  browserInfo: {
    name: { type: String },
    version: { type: String },
    platform: { type: String },
  },
  isPassed: {
    type: Boolean,
    default: false,
  },
  passingPercentage: {
    type: Number,
    default: 40, // Default passing percentage is 40%
  },
});

testSessionSchema.index({ student: 1, college: 1, testId: 1 });

export default mongoose.models.TestSession ||
  mongoose.model("TestSession", testSessionSchema);
