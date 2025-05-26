import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../../middlewares/auth";
import TransactionModel from "models/Transaction.model";
import AgentModel from "models/Agent.model";
import _db from "../../../../../utils/db";
import CourseModel from "models/Courses/Course.model";

_db();

export const GET = authMiddleware(async (request) => {
  try {
    const user = request.user;
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    const agent = await AgentModel.findById(user._id);

    if (!agent || !agent.agentCode) {
      return NextResponse.json(
        { success: false, error: "Agent not found or agent code missing" },
        { status: 404 }
      );
    }

    const allTransactions = await TransactionModel.find({
      agentRefCode: agent.agentCode,
    })
      .populate("userId", "name email")
      .populate("courseId", "courseName price");

    const completed = allTransactions.filter(tx => tx.status === "SUCCESS");
    const pending = allTransactions.filter(tx => tx.status === "PENDING");

    return NextResponse.json({
      success: true,
      message: "Agent sales fetched successfully",
      data: {
        all: allTransactions,
        completed,
        pending,
      },
    });
  } catch (error) {
    console.error("Error fetching agent sales:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["agent"]);
