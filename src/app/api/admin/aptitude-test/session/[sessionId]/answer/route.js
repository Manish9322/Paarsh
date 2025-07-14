import { NextResponse } from "next/server";
import TestSessionModel from "../../../../../../../../models/AptitudeTest/TestSession.model";
import _db from "../../../../../../../../utils/db";
import { authMiddleware } from "../../../../../../../../middlewares/auth";

await _db();

export const PATCH = authMiddleware(
  async function (request, { params }) {
    try {
      const { sessionId } = params;
      const { questionId, selectedAnswer } = await request.json();

      if (!questionId || selectedAnswer === undefined) {
        return NextResponse.json(
          {
            success: false,
            error: "Question ID and selected answer are required",
          },
          { status: 400 },
        );
      }

      const session = await TestSessionModel.findById(sessionId);
      if (!session) {
        return NextResponse.json(
          { success: false, error: "Session not found" },
          { status: 404 },
        );
      }

      if (session.status !== "active") {
        return NextResponse.json(
          { success: false, error: "Session is not active" },
          { status: 400 },
        );
      }

      // Find or create question entry
      const questionIndex = session.questions.findIndex(
        (q) => q.question.toString() === questionId,
      );
      if (questionIndex === -1) {
        session.questions.push({
          question: questionId,
          selectedAnswer,
          isCorrect: false, // Set based on actual question data in production
          timeSpent: 0, // Update as needed
        });
      } else {
        session.questions[questionIndex].selectedAnswer = selectedAnswer;
      }

      await session.save();

      return NextResponse.json({
        success: true,
        message: "Answer saved successfully",
      });
    } catch (error) {
      console.error("Save answer error:", error);
      return NextResponse.json(
        { success: false, error: "Something went wrong" },
        { status: 500 },
      );
    }
  },
  ["student"],
);
