import { NextResponse } from "next/server";
import _db from "../../../../utils/db";
import AgentModel from "../../../../models/Agent.model";
import { authMiddleware } from "../../../../middlewares/auth";

await _db();

// Get All Agents
export const GET = authMiddleware(async (req) => {
  try {
    const { user } = req;

    if (!user) {
      return NextResponse.json(
        { error: "Agent is not authenticated" },
        { status: 401 },
      );
    }

    const agentId = user._id;

    const agents = await AgentModel.findById(agentId).exec();
    return NextResponse.json({ success: true, data: agents });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, ["agent"]);
