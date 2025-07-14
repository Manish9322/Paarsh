import { NextResponse } from "next/server";
import _db from "../../../../utils/db";
import UserPracticeAttemptModel from "../../../../models/UserPracticeAttempt.model";
import PracticeTestModel from "models/PracticeTest.model";
import { authMiddleware } from "../../../../middlewares/auth";

await _db();

export const GET = authMiddleware(
  async (request) => {
    try {
      const practiceAttempts = await UserPracticeAttemptModel.find()
        .populate("userId", "name email")
        .populate("practiceTestId", "testName skill level");

      const formattedAttempts = practiceAttempts.map((attempt) => ({
        userId: attempt.userId._id,
        practiceTestId: attempt.practiceTestId._id,
        testName: attempt.practiceTestId.testName,
        skill: attempt.practiceTestId.skill,
        level: attempt.practiceTestId.level,
        completedAt: attempt.completedAt,
        score: attempt.score,
      }));

      return NextResponse.json({
        success: true,
        data: formattedAttempts,
      });
    } catch (error) {
      console.error("Error fetching user practice attempts:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 },
      );
    }
  },
  ["admin"],
);
