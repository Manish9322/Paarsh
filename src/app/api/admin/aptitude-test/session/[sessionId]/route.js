import { NextResponse } from "next/server";
import { calculateScore } from "../../../../../../../utils/AptitudeTest/calculateTestScore";
import TestSession from "../../../../../../../models/AptitudeTest/TestSession.model";
import Question from "../../../../../../../models/Question.model";

export async function POST(request, { params }) {
  try {
    const { sessionId } = params;
    const { answers } = await request.json();

    // Find the test session
    const session = await TestSession.findById(sessionId)
      .populate({
        path: "questions.question",
        model: Question,
        select: "question options explanation category"
      });

    if (!session) {
      return NextResponse.json(
        { error: "Test session not found" },
        { status: 404 }
      );
    }

    if (session.status === "completed") {
      return NextResponse.json(
        { error: "Test has already been submitted" },
        { status: 400 }
      );
    }

    // Convert answers array to object for easier lookup
    const answersMap = answers.reduce((acc, ans) => {
      acc[ans.questionId] = ans.selectedAnswer;
      return acc;
    }, {});

    // Calculate score
    const result = calculateScore(session.questions, answersMap);

    // Update session with results
    session.score = result.score;
    session.percentage = result.percentage;
    session.answers = answers;
    session.status = "completed";
    session.submittedAt = new Date();

    await session.save();

    return NextResponse.json({
      score: result.score,
      percentage: result.percentage,
      totalQuestions: result.totalQuestions,
      correctedAnswers: result.correctedAnswers
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    return NextResponse.json(
      { error: "Failed to submit test" },
      { status: 500 }
    );
  }
}

