import { NextResponse } from "next/server";
import CollegeModel from "../../../../../models/AptitudeTest/College.model";
import TestModel from "../../../../../models/AptitudeTest/Test.model";
import TestSessionModel from "../../../../../models/AptitudeTest/TestSession.model";
import QuestionModel from "../../../../../models/Question.model";
import _db from "../../../../../utils/db";
import { authMiddleware } from "../../../../../middlewares/auth";

await _db();

export const GET = authMiddleware(async function (request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const testId = searchParams.get("testId");
    const collegeId = searchParams.get("collegeId");

    if (!sessionId || !testId || !collegeId) {
      return NextResponse.json(
        { success: false, error: "Session ID, test ID, and college ID are required" },
        { status: 400 }
      );
    }

    // Get the test session and populate the questions
    const session = await TestSessionModel.findById(sessionId).populate({
      path: "questions.question",
      model: QuestionModel,
      select: "question options category explanation"
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Test session not found" },
        { status: 404 }
      );
    }

    const testDetails = {
      name: "Aptitude Test",
      college: "Test College",
      duration: session.duration,
      totalQuestions: session.questions.length,
      passingScore: 60,
      allowRetake: false,
      instructions: [
        "Read each question carefully.",
        "Navigate using the provided controls.",
        "Mark questions for review if unsure.",
        "Submit when ready.",
      ],
      rules: [
        "No external resources allowed.",
        "Stable internet connection required.",
        "Complete within the allotted time.",
      ],
    };

    // Format questions for the frontend
    const formattedQuestions = session.questions.map(q => ({
      _id: q.question._id.toString(),
      question: q.question.question,
      options: q.question.options,
      selectedAnswer: q.selectedAnswer,
      timeSpent: q.timeSpent
    }));

    return NextResponse.json({
      success: true,
      message: "Test information fetched successfully",
      data: {
        session: {
          sessionId: session._id,
          startTime: session.startTime,
          duration: session.duration,
          status: session.status,
        },
        testDetails,
        questions: formattedQuestions,
      },
    });
  } catch (error) {
    console.error("Get test info error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}, ["student"]);