import { NextResponse } from "next/server";
import _db from "../../../../../utils/db";
import UserPracticeAttemptModel from "../../../../../models/UserPracticeAttempt.model";
import PracticeTestModel from "../../../../../models/PracticeTest.model";
import { authMiddleware } from "../../../../../middlewares/auth";

_db();

export const POST = authMiddleware(
  async (request) => {
    try {
      const userId = request.user._id;
      const { practiceTestId, answers } = await request.json();

      if (!practiceTestId || !answers) {
        return NextResponse.json(
          {
            success: false,
            error: "Practice test ID and answers are required",
          },
          { status: 400 },
        );
      }

      const practiceTest = await PracticeTestModel.findById(practiceTestId);
      if (!practiceTest) {
        return NextResponse.json(
          { success: false, error: "Practice test not found" },
          { status: 404 },
        );
      }

      // Calculate score
      let score = 0;
      const processedAnswers = answers.map((answer) => {
        const question = practiceTest.questions.find(
          (q) => q._id.toString() === answer.questionId,
        );
        const isCorrect =
          question && answer.selectedAnswer === question.correctAnswer;
        if (isCorrect) score += 1;
        return {
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          isCorrect,
        };
      });

      const newAttempt = new UserPracticeAttemptModel({
        userId,
        practiceTestId,
        completedAt: new Date(),
        score,
        answers: processedAnswers,
      });

      await newAttempt.save();

      return NextResponse.json({
        success: true,
        message: "Practice test attempt recorded successfully",
        data: newAttempt,
      });
    } catch (error) {
      console.error("Error recording practice test attempt:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Internal server error" },
        { status: 500 },
      );
    }
  },
  ["user"],
);
