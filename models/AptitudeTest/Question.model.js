import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
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
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["aptitude", "logical", "quantitative", "verbal", "technical"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

questionSchema.index({ category: 1 });

export default mongoose.models.Question ||
  mongoose.model("Question", questionSchema);
