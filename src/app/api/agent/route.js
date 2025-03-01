import { NextResponse } from "next/server";
import _db from "../../../../utils/db";
import AgentModel from "../../../../models/Agent.model";
import { authMiddleware } from "../../../../middlewares/auth";

_db();

// Create Agent
export const POST = authMiddleware(async (request) => {
  try {
    const { firstName, lastName, email, mobile, gender, state , city } =
      await request.json();

    if (!firstName || !lastName || !email || !mobile || !gender || !city || !state) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 },
      );
    }

    const existingAgent = await AgentModel.findOne({ email });

    if (existingAgent) {
      return NextResponse.json(
        { success: false, error: "Agent with this email already exists" },
        { status: 400 },
      );
    }

    const newAgent = new AgentModel({
      firstName,
      lastName,
      email,
      mobile,
      gender,
      state,
      city,
    });

    await newAgent.save();

    return NextResponse.json({
      success: true,
      message: "Agent created successfully",
      data: newAgent,
    });
  } catch (error) {
    console.error("Error while creating agent:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, true);

// Get All Agents
export const GET = authMiddleware(async () => {
  try {
    const agents = await AgentModel.find();
    return NextResponse.json({ success: true, data: agents });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, true);

// Update Agent
export const PUT = authMiddleware(async (request) => {
  try {
    const { id, firstName, lastName, email, mobile, gender, state , city } =
      await request.json();

    if (
      !id ||
      !firstName ||
      !lastName ||
      !email ||
      !mobile ||
      !gender ||
      !state ||
      !city
    ) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 },
      );
    }

    const updatedAgent = await AgentModel.findByIdAndUpdate(
      id,
      { firstName, lastName, email, mobile, gender, state,city },
      { new: true },
    );

    if (!updatedAgent) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Agent updated successfully",
      data: updatedAgent,
    });
  } catch (error) {
    console.error("Error while updating agent:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, true);

// Delete Agent
export const DELETE = authMiddleware(async (request) => {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Agent ID is required" },
        { status: 400 },
      );
    }

    const deletedAgent = await AgentModel.findByIdAndDelete(id);

    if (!deletedAgent) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Agent deleted successfully",
    });
  } catch (error) {
    console.error("Error while deleting agent:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, true);
