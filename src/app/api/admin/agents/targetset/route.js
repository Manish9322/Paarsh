import { NextResponse } from "next/server";
import _db from "../../../../../../utils/db";
import AgentModel from "../../../../../../models/Agent.model";
import TargetModel from "../../../../../../models/AgentTarget.model";
import { authMiddleware } from "../../../../../../middlewares/auth";

_db();

export const POST = authMiddleware(async (request) => {
  try {
    const {
      agentId,
      startDate,
      endDate,
      targetCount,
      targetAmount,
      targetType,
      notes
    } = await request.json();

    // Validate agent exists
    const agent = await AgentModel.findById(agentId);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    // Check if agent already has an active target
    if (agent.activeTarget) {
      // First, cancel/complete the existing active target
      await TargetModel.findByIdAndUpdate(
        agent.activeTarget,
        { status: "cancelled" }
      );
    }

    // Check for overlapping active targets for this specific agent (additional safety check)
    const overlappingTarget = await TargetModel.findOne({
      agentId,
      status: "active",
      $or: [
        {
          startDate: { $lte: new Date(startDate) },
          endDate: { $gte: new Date(startDate) }
        },
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(endDate) }
        }
      ]
    });

    if (overlappingTarget) {
      return NextResponse.json(
        {
          success: false,
          error: `Agent ${agent.firstName} ${agent.lastName} already has an active target from ${overlappingTarget.startDate.toDateString()} to ${overlappingTarget.endDate.toDateString()}`
        },
        { status: 400 }
      );
    }

    // Create individual target for this agent
    const newTarget = new TargetModel({
      agentId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      targetCount,
      targetAmount,
      targetType: targetType || "monthly",
      notes,
      status: "active"
    });

    await newTarget.save();

    // Update agent's activeTarget field
    await AgentModel.findByIdAndUpdate(
      agentId,
      { activeTarget: newTarget._id },
      { new: true }
    );

    // Populate the target with agent details
    await newTarget.populate('agentId', 'firstName lastName agentCode email');

    return NextResponse.json({
      success: true,
      message: `Individual target set successfully for ${agent.firstName} ${agent.lastName}`,
      data: newTarget
    });

  } catch (error) {
    console.error("Error setting individual target:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["admin"]);