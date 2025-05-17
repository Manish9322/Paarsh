import { NextResponse } from "next/server";
import LeadModel from "models/Lead.model";
import CourseModel from "models/Courses/Course.model"
import AgentModel from "models/Agent.model";
import { authMiddleware } from "../../../../../middlewares/auth";
import _db from "../../../../../utils/db";

_db();

export const POST = authMiddleware(async (request) => {
  try {

    const {user} = request;

    const agentId = user._id

    console.log("agentId",agentId)

    const {
      customerName,
      customerEmail,
      courseId,
      notes = "",
    } = await request.json();

    if (!customerName || !customerEmail || !courseId || !agentId ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "All required fields (customerName, customerEmail, courseId, agentId) must be provided",
        },
        { status: 400 }
      );
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    const course = await CourseModel.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Invalid courseId: Course not found" },
        { status: 400 }
      );
    }

    const agent = await AgentModel.findById(agentId);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Invalid agentId: Agent not found" },
        { status: 400 }
      );
    }

    const newLead = new LeadModel({
      customerName,
      customerEmail,
      courseId,
      agentId,
      notes,
    });

    await newLead.save();

    return NextResponse.json({
      success: true,
      message: "Lead created successfully",
      data: newLead,
    });
  } catch (error) {
    console.error("Error while creating lead:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["agent"]);
