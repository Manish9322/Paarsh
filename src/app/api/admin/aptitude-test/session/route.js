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

    if (!studentId || !testId || !collegeId || !batchName) {
      return NextResponse.json(
        { success: false, error: "Student ID, test ID, college ID, and batch name are required" },
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

    const test = await TestModel.findOne({ testId, college: collegeId, batchName });
    if (!test) {
      return NextResponse.json(
        { success: false, error: "Invalid test" },
        { status: 400 }
      );
    }

    // Comprehensive test validation
    const currentDate = new Date();
    
    // Function to format date-time for user-friendly messages
    const formatDateTime = (date) => {
      return new Date(date).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    };

    // Validate test timing if it has expiry
    if (test.hasExpiry) {
      // Validate test configuration
      if (!test.startTime || !test.endTime) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Test schedule is not properly configured. Please contact your administrator." 
          },
          { status: 403 }
        );
      }

      const startTime = new Date(test.startTime);
      const endTime = new Date(test.endTime);

      // Test hasn't started yet
      if (currentDate < startTime) {
        return NextResponse.json(
          { 
            success: false, 
            error: `This test is scheduled to begin on ${formatDateTime(startTime)}. Please return at the scheduled time.` 
          },
          { status: 403 }
        );
      }

      // Test has ended
      if (currentDate > endTime) {
        return NextResponse.json(
          { 
            success: false, 
            error: `This test ended on ${formatDateTime(endTime)}. The test window has closed.` 
          },
          { status: 403 }
        );
      }

      // Test is active but about to end
      const minutesUntilEnd = Math.floor((endTime.getTime() - currentDate.getTime()) / (1000 * 60));
      if (minutesUntilEnd < test.testDuration) {
        return NextResponse.json(
          { 
            success: false, 
            error: `This test will end in ${minutesUntilEnd} minutes, which is less than the required test duration (${test.testDuration} minutes). You cannot start the test now.` 
          },
          { status: 403 }
        );
      }
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
    });

    if (existingSession) {
      if (existingSession.status === "completed" && !test.testSettings.allowRetake) {
        return NextResponse.json(
          {
            success: false,
            error: "You have already completed this test. Retakes are not allowed.",
          },
          { status: 403 }
        );
      }

      if (existingSession.status === "pending" || existingSession.status === "active") {
        return NextResponse.json(
          {
            success: true,
            message: "Existing test session found",
            data: { sessionId: existingSession._id },
          },
          { status: 200 }
        );
      }
    }

    const questions = await QuestionModel.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: test.testSettings.questionsPerTest } },
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
      batchName,
      test: test._id,
      duration: test.testDuration,
      status: "pending",
      passingPercentage: test.testSettings.passingScore,
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