// models/Question.model.js
import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      text: {
        type: String,
        required: true,
      },
      isCorrect: {
        type: Boolean,
        default: false,
      },
    },
  ],
  correctAnswer: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["aptitude", "logical", "quantitative", "verbal", "technical"],
  },
  explanation: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

QuestionSchema.index({ category: 1 });

export default mongoose.models.aptitudeQuestions ||
  mongoose.model("aptitudeQuestions", QuestionSchema);
