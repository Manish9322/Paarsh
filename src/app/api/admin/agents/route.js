import { NextResponse } from "next/server";
import _db from "../../../../../utils/db";
import bcrypt from "bcryptjs";
import AgentModel from "../../../../../models/Agent.model";
import TargetModel from "../../../../../models/AgentTarget.model";
import { authMiddleware } from "../../../../../middlewares/auth";
import { agentCredentialsMail } from "../../../../../utils/MailTemplates/agentCredentialMailTemplate";
import emailSender from "../../../../../utils/mailSender";
import crypto from "crypto";


 await _db();

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

const generateRandomPassword = () => {
  return crypto.randomBytes(4).toString("hex"); // 8-character random string
};

// Create Agent
export const POST = authMiddleware(async (request) => {
  try {
    const { firstName, lastName, email, mobile, gender, state, city } =
      await request.json();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !mobile ||
      !gender ||
      !city ||
      !state 
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


     // Generate a unique referral code
    const agentCode = await generateUniqueAgentCode(firstName, lastName);
    const randomPassword = generateRandomPassword();
     // Hash the password
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

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

        // Send email with credentials + reset password link
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetUrl = `https://paarshedu.com/agentreset-password?token=${resetToken}&email=${email}`;

    // Optionally, store token in DB with expiry if not using JWT
    newAgent.resetToken = resetToken;
    newAgent.tokenExpiry = Date.now() + 30 * 60 * 1000;
    await newAgent.save();

      const message = agentCredentialsMail(firstName, agentCode, email, randomPassword , resetUrl);
        const emailOptions = {
          email: email, 
          subject: "Welcome to PaarshEdu - Agent Credentials",
          message: message,
        };
    
        await emailSender(emailOptions);

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
    // Fetch all agents and populate only target count and amount
    const agents = await AgentModel.find()
      .populate({
        path: 'activeTarget',
        select: 'targetAmount targetCount'
      });

    return NextResponse.json({ 
      success: true, 
      data: agents,
      summary: {
        totalAgents: agents.length,
        agentsWithActiveTargets: agents.filter(agent => agent.activeTarget).length,
        agentsWithoutTargets: agents.filter(agent => !agent.activeTarget).length
      }
    });
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


// Update Agent Target
export const PATCH = authMiddleware(async (request) => {
  try {
    const { id, targetType, targetValue } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Agent ID is required" },
        { status: 400 },
      );
    }

    if (!targetType || !["count", "price"].includes(targetType)) {
      return NextResponse.json(
        { success: false, error: "Valid target type (count or price) is required" },
        { status: 400 },
      );
    }

    if (targetValue === undefined || targetValue < 0) {
      return NextResponse.json(
        { success: false, error: "Valid target value is required" },
        { status: 400 },
      );
    }

    // Create update object with the specified target type and reset the other type to 0
    const updateData = {
      [`target.${targetType}`]: targetValue,
      [`target.${targetType === "count" ? "price" : "count"}`]: 0, // Set the other type to 0
    };

    // Update the specific target field and reset the other
    const updatedAgent = await AgentModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedAgent) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Agent target ${targetType} updated successfully`,
      data: updatedAgent,
    });
  } catch (error) {
    console.error("Error while updating agent target:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, ["admin"]);
