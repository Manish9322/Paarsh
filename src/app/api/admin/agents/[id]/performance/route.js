import { NextResponse } from "next/server";
import _db from "../../../../../../../utils/db";
import AgentModel from "../../../../../../../models/Agent.model";
import TargetModel from "../../../../../../../models/AgentTarget.model";
import SaleModel from "../../../../../../../models/AgentSale.model";
import { authMiddleware } from "../../../../../../../middlewares/auth";

await _db();

export const GET = authMiddleware(async (request, { params }) => {
  try {
    const { id } = params;

    // Get agent details
    const agent = await AgentModel.findById(id);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    // Get all targets for this agent
    const targets = await TargetModel.find({agentId: id}).sort({ createdAt: -1 });

    // Get current active target
    const currentTarget = await TargetModel.findOne({
      agentId: id,
      status: "active"
    });

    // Calculate performance metrics
    const completedTargets = targets.filter(t => t.status === "completed");
    const achievedTargets = completedTargets.filter(t => 
      t.achievedCount >= t.targetCount && t.achievedAmount >= t.targetAmount
    );

    const performance = {
      agent: {
        name: `${agent.firstName} ${agent.lastName}`,
        agentCode: agent.agentCode,
        totalSale: agent.totalSale,
        countSale: agent.countSale
      },
      currentTarget: currentTarget ? {
        ...currentTarget.toObject(),
        countProgress: currentTarget.targetCount > 0 ? 
          (currentTarget.achievedCount / currentTarget.targetCount * 100).toFixed(2) : 0,
        amountProgress: currentTarget.targetAmount > 0 ? 
          (currentTarget.achievedAmount / currentTarget.targetAmount * 100).toFixed(2) : 0,
        isCountAchieved: currentTarget.achievedCount >= currentTarget.targetCount,
        isAmountAchieved: currentTarget.achievedAmount >= currentTarget.targetAmount
      } : null,
      history: targets,
      summary: {
        totalTargets: targets.length,
        completedTargets: completedTargets.length,
        achievedTargets: achievedTargets.length,
        successRate: completedTargets.length > 0 ? 
          (achievedTargets.length / completedTargets.length * 100).toFixed(2) : 0
      }
    };

    return NextResponse.json({
      success: true,
      data: performance
    });

  } catch (error) {
    console.error("Error getting performance:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["admin"]);