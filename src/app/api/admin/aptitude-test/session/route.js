// app/api/test/session/route.js
import { NextResponse } from "next/server";
import TestSessionModel from "../../../../../../models/AptitudeTest/TestSession.model";
import StudentModel from "../../../../../../models/AptitudeTest/Student.model";
import CollegeModel from "../../../../../../models/AptitudeTest/College.model";
import TestModel from "../../../../../../models/AptitudeTest/Test.model";
import QuestionModel from "../../../../../../models/Question.model";
import _db from "../../../../../../utils/db";
import { authMiddleware } from "../../../../../../middlewares/auth";

await _db();

export const POST = authMiddleware(async function (request) {
  try {
    const { studentId, testId, collegeId, batchName } = await request.json();

    if (!studentId || !testId || !collegeId , !batchName) {
      return NextResponse.json(
        { success: false, error: "Student ID, test ID, and college ID , batch name are required" },
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

    const student = await StudentModel.findById(studentId);
    if (!student || student.college.toString() !== collegeId) {
      return NextResponse.json(
        { success: false, error: "Student not registered for this college" },
        { status: 403 }
      );
    }

    const existingSession = await TestSessionModel.findOne({
      student: studentId,
      college: collegeId,
      testId,
      batchName,
      test: test._id,
      passingPercentage: test.testSettings.passingPercentage,
      status: { $in: ["pending", "active"] },
    });
    if (existingSession && !test.testSettings.allowRetake) {
      return NextResponse.json(
        {
          success: true,
          message: "Existing test session found",
          data: { sessionId: existingSession._id },
        },
        { status: 200 }
      );
    }

    const questions = await QuestionModel.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: test.testSettings.questionsPerTest } }
    ]);

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "No active questions available" },
        { status: 400 }
      );
    }

    const session = new TestSessionModel({
      student: studentId,
      college: collegeId,
      testId,
      duration: test.testDuration,
      status: "pending",
      questions: questions.map((q) => ({
        question: q._id,
        selectedAnswer: -1,
        isCorrect: false,
        timeSpent: 0,
      })),
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      browserInfo: { name: "unknown", version: "unknown", platform: "unknown" },
    });
    await session.save();

    return NextResponse.json({
      success: true,
      message: "Test session created successfully",
      data: {
        sessionId: session._id,
      },
    });
  } catch (error) {
    console.error("Create test session error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}, ["student"]);