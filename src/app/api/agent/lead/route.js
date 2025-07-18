import { NextResponse } from "next/server";
import LeadModel from "models/Lead.model";
import CourseModel from "models/Courses/Course.model"
import AgentModel from "models/Agent.model";
import { authMiddleware } from "../../../../../middlewares/auth";
import _db from "../../../../../utils/db";

await _db();

export const POST = authMiddleware(async (request) => {
  try {

    const {user} = request;

    const agentId = user._id


    const {
      customerName,
      customerEmail,
      customerMobile,
      courseId,
      notes = "",

    } = await request.json();
    if (!customerName || !customerEmail || !customerMobile  || !courseId || !agentId ) {
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
      customerMobile,
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

export const GET = authMiddleware(async (request) => {
  try {

    const agent = request.user;

    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Agent not authenticated" },
        { status: 401 }
      );
    } 

    const leads = await LeadModel.find({ agentId: agent._id });
    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.error("Error while fetching leads:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["agent"]);

export const PATCH = authMiddleware(async (request) => {
  try {
    const { user } = request;
    const agentId = user._id;

    const { leadId, customerName, customerEmail, customerMobile, courseId, notes, status } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: "leadId is required" },
        { status: 400 }
      );
    }

    const lead = await LeadModel.findOne({ _id: leadId, agentId });
    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found or unauthorized access" },
        { status: 404 }
      );
    }

    if (customerEmail && !/^\S+@\S+\.\S+$/.test(customerEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Optional: validate courseId
    if (courseId) {
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return NextResponse.json(
          { success: false, error: "Invalid courseId: Course not found" },
          { status: 400 }
        );
      }
    }

    // Update fields if provided
    if (customerName) lead.customerName = customerName;
    if (customerEmail) lead.customerEmail = customerEmail;
    if (customerMobile) lead.customerMobile = customerMobile;
    if (courseId) lead.courseId = courseId;
    if (notes !== undefined) lead.notes = notes;
    if (status) lead.status = status;
    lead.updatedAt = new Date();

    await lead.save();

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Error while updating lead:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["agent"]);
  
export const DELETE = authMiddleware(async (request) => {
  try {
    const { user } = request;
    const agentId = user._id;

    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: "leadId is required" },
        { status: 400 }
      );
    }

    const deleted = await LeadModel.findOneAndDelete({ _id: leadId, agentId });

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Lead not found or unauthorized access" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Error while deleting lead:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["agent"]);