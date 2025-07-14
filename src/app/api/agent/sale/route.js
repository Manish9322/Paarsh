import { NextResponse } from "next/server";
import _db from "../../../../../utils/db";
import AgentModel from "../../../../../models/Agent.model";
import TargetModel from "../../../../../models/AgentTarget.model";
import SaleModel from "../../../../../models/AgentSale.model";
import { authMiddleware } from "../../../../../middlewares/auth";

await _db();

export const POST = authMiddleware(async (request) => {
  try {
    const {
      agentId,
      amount,
      saleDate,
      description,
      customerName
    } = await request.json();

    if (!agentId || !amount) {
      return NextResponse.json(
        { success: false, error: "Agent ID and amount are required" },
        { status: 400 }
      );
    }

    const saleDateTime = saleDate ? new Date(saleDate) : new Date();

    // Find agent
    const agent = await AgentModel.findById(agentId);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    // Find active target for this sale date
    const activeTarget = await TargetModel.findOne({
      agentId,
      status: "active",
      startDate: { $lte: saleDateTime },
      endDate: { $gte: saleDateTime }
    });

    // Create sale record
    const newSale = new SaleModel({
      agentId,
      targetId: activeTarget ? activeTarget._id : null,
      amount,
      saleDate: saleDateTime,
      description,
      customerName
    });

    await newSale.save();

    // Update agent totals
    agent.totalSale += amount;
    agent.countSale += 1;
    await agent.save();

    // Update target achievement if active target exists
    if (activeTarget) {
      activeTarget.achievedCount += 1;
      activeTarget.achievedAmount += amount;
      await activeTarget.save();
    }

    return NextResponse.json({
      success: true,
      message: "Sale added successfully",
      data: {
        sale: newSale,
        targetUpdated: !!activeTarget
      }
    });

  } catch (error) {
    console.error("Error adding sale:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["admin", "agent"]);
