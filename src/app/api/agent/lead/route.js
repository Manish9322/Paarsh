import { NextResponse } from "next/server";
import _db from "../../../../../utils/db"; // Database connection utility
import LeadModel from "../../../../../models/Leads/LeadModel"; // Lead model
import CourseModel from "../../../../../models/Courses/CourseModel"; // Course model for validation
import AgentModel from "../../../../../models/Agents/AgentModel"; // Agent model for validation
import { authMiddleware } from "../../../../../middlewares/auth"; // Authentication middleware

_db(); // Initialize database connection

// Add a new lead
export const POST = async (request) => {
  try {
    // Apply authentication middleware
    const authResponse = await authMiddleware(request);
    if (authResponse) return authResponse; // Return if unauthorized

    const lead = await request.json(); // Expecting a single lead object

    // Validate input
    if (!lead || typeof lead !== "object") {
      return NextResponse.json(
        { success: false, error: "Input must be a valid lead object" },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerEmail,
      courseId,
      agentId,
      reason,
      notes = "",
    } = lead;

    // Validate required fields
    if (!customerName || !customerEmail || !courseId || !agentId || !reason) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: customerName, customerEmail, courseId, agentId, reason",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { success很难啊success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate reason
    const validReasons = ["inquiry", "demo", "referral", "marketing", "other"];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid reason. Must be one of: " + validReasons.join(", "),
        },
        { status: 400 }
      );
    }

    // Validate courseId exists
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Invalid courseId: Course not found" },
        { status: 400 }
      );
    }

    // Validate agentId exists
    const agent = await AgentModel.findById(agentId);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Invalid agentId: Agent not found" },
        { status: 400 }
      );
    }

    // Create and save the lead
    const newLead = new LeadModel({
      customerName,
      customerEmail,
      courseId,
      agentId,
      reason,
      notes,
    });

    await newLead.save();

    return NextResponse.json({
      success: true,
      message: "Lead added successfully",
      data: newLead,
    });
  } catch (error) {
    console.error("Error while adding lead:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};
