// app/api/test/start/route.js
import { NextResponse } from "next/server";
import TestSessionModel from "../../../../../../models/AptitudeTest/TestSession.model";
import CollegeModel from "../../../../../../models/AptitudeTest/College.model";
import TestModel from "../../../../../../models/AptitudeTest/Test.model";
import _db from "../../../../../../utils/db";
import { authMiddleware } from "../../../../../../middlewares/auth";

await _db();

export const POST = authMiddleware(async function (request) {
  try {
    const { sessionId, testId, collegeId } = await request.json();

    if (!sessionId || !testId || !collegeId) {
      return NextResponse.json(
        { success: false, error: "Session ID, test ID, and college ID are required" },
        { status: 400 }
      );
    }

    const college = await CollegeModel.findOne({ _id: collegeId, testIds: testId });
    if (!college) {
      return NextResponse.json(
        { success: false, error: "Invalid test link or college" },
        { status: 400 }
      );
    }

    const test = await TestModel.findOne({ testId, college: collegeId });
    if (!test) {
      return NextResponse.json(
        { success: false, error: "Invalid test" },
        { status: 400 }
      );
    }

    const session = await TestSessionModel.findById(sessionId).populate("questions.question");
    if (!session || session.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "Invalid or already started test session" },
        { status: 400 }
      );
    }

    session.status = "active";
    session.startTime = new Date();
    await session.save();

    const questions = session.questions.map((q) => ({
      _id: q.question._id,
      text: q.question.text,
      options: q.question.options,
      selectedAnswer: q.selectedAnswer,
      timeSpent: q.timeSpent,
    }));

    return NextResponse.json({
      success: true,
      message: "Test session started successfully",
      data: {
        session: {
          sessionId: session._id,
          startTime: session.startTime,
          duration: session.duration,
          status: session.status,
        },
        questions,
      },
    });
  } catch (error) {
    console.error("Start test session error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}, ["student"]);