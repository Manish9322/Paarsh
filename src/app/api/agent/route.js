import { NextResponse } from "next/server";
import _db from "../../../../utils/db";
import bcrypt from "bcryptjs";
import AgentModel from "../../../../models/Agent.model";
import { authMiddleware } from "../../../../middlewares/auth";

_db();

// Function to generate a unique referral code
const generateUniqueAgentCode = async (firstName, lastName) => {
  let agentCode;
  let isUnique = false;

  while (!isUnique) {
    const initials = (firstName[0] + lastName[0]).toUpperCase(); // Extract initials (e.g., "John Doe" → "JD")
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit random number
    agentCode = `${initials}${randomNumber}`; // Example: "JD1234"

    // Check if referral code already exists
    const existingAgent = await AgentModel.findOne({ agentCode });
    if (!existingAgent) {
      isUnique = true;
    }
  }

  return agentCode;
};

// Create Agent
export const POST = authMiddleware(async (request) => {
  try {
    const { firstName, lastName, email, mobile, gender, state, city ,password} =
      await request.json();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !mobile ||
      !gender ||
      !city ||
      !state ||
      !password
    ) {
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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique referral code
    const agentCode = await generateUniqueAgentCode(firstName, lastName);

    const newAgent = new AgentModel({
      firstName,
      lastName,
      email,
      password : hashedPassword,
      mobile,
      gender,
      state,
      city,
      agentCode,
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
}, ["admin"]);

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
}, ["admin"]);

// Update Agent
export const PUT = authMiddleware(async (request) => {
  try {
    const { formData } = await request.json();
    const id = formData?._id; // ✅ Extract ID from formData
    console.log("formatDatais ", formData.id);
    console.log("formData", formData);

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Agent ID is required" },
        { status: 400 },
      );
    }

    // Define required fields for validation
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "mobile",
      "gender",
      "state",
      "city",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 },
        );
      }
    }

    // Update agent
    const updatedAgent = await AgentModel.findByIdAndUpdate(
      id,
      { $set: formData },
      { new: true, runValidators: true },
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
}, ["admin"]);

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
}, ["admin"]);

