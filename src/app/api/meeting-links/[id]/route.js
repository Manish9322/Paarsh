import { NextResponse } from "next/server";
import _db from "../../../../../utils/db";
import MeetingLink from "../../../../../models/MeetingLink.model";
import { authMiddleware } from "../../../../../middlewares/auth";

_db();

// GET a single meeting link by ID
export async function GET(req, { params }) {
  try {
    const id = params.id;
    
    const meetingLink = await MeetingLink.findOne({ _id: id, isDeleted: false });
    
    if (!meetingLink) {
      return NextResponse.json(
        { success: false, message: "Meeting link not found" },
        { status: 404 }
      );
    }
    
    // Update status based on date if needed
    const meetingDate = new Date(meetingLink.date);
    const today = new Date();
    
    if (meetingLink.status !== "cancelled" && meetingDate < today && meetingLink.status !== "past") {
      meetingLink.status = "past";
      await meetingLink.save();
    }
    
    return NextResponse.json({ success: true, data: meetingLink });
  } catch (error) {
    console.error("Error fetching meeting link:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch meeting link", error: error.message },
      { status: 500 }
    );
  }
}

// PUT update a meeting link (admin only)
export async function PUT(req, { params }) {
  try {
    // Verify admin authentication
    const authResult = await authMiddleware(req, ["admin"]);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }
    
    await dbConnect();
    const id = params.id;
    const body = await req.json();
    
    const meetingLink = await MeetingLink.findOne({ _id: id, isDeleted: false });
    
    if (!meetingLink) {
      return NextResponse.json(
        { success: false, message: "Meeting link not found" },
        { status: 404 }
      );
    }
    
    // Update fields
    const updatedFields = [
      "title", "description", "date", "time", "link", 
      "platform", "instructor", "status", "recording"
    ];
    
    updatedFields.forEach(field => {
      if (body[field] !== undefined) {
        meetingLink[field] = body[field];
      }
    });
    
    await meetingLink.save();
    
    return NextResponse.json({ 
      success: true, 
      message: "Meeting link updated successfully", 
      data: meetingLink 
    });
  } catch (error) {
    console.error("Error updating meeting link:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update meeting link", error: error.message },
      { status: 500 }
    );
  }
}

// PATCH to update the status (admin only)
export async function PATCH(req, { params }) {
  try {
    // Verify admin authentication
    const authResult = await authMiddleware(req, ["admin"]);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }
    
    await dbConnect();
    const id = params.id;
    const body = await req.json();
    
    if (!body.status || !["upcoming", "past", "cancelled"].includes(body.status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status provided" },
        { status: 400 }
      );
    }
    
    const meetingLink = await MeetingLink.findOne({ _id: id, isDeleted: false });
    
    if (!meetingLink) {
      return NextResponse.json(
        { success: false, message: "Meeting link not found" },
        { status: 404 }
      );
    }
    
    // Update status
    meetingLink.status = body.status;
    
    // If adding a recording for past meetings
    if (body.recording && meetingLink.status === "past") {
      meetingLink.recording = body.recording;
    }
    
    await meetingLink.save();
    
    return NextResponse.json({ 
      success: true, 
      message: "Meeting link status updated successfully", 
      data: meetingLink 
    });
  } catch (error) {
    console.error("Error updating meeting link status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update meeting link status", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE a meeting link (soft delete) (admin only)
export async function DELETE(req, { params }) {
  try {
    // Verify admin authentication
    const authResult = await authMiddleware(req, ["admin"]);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }
    
    await dbConnect();
    const id = params.id;
    
    const meetingLink = await MeetingLink.findOne({ _id: id, isDeleted: false });
    
    if (!meetingLink) {
      return NextResponse.json(
        { success: false, message: "Meeting link not found" },
        { status: 404 }
      );
    }
    
    // Soft delete
    meetingLink.isDeleted = true;
    await meetingLink.save();
    
    return NextResponse.json({ 
      success: true, 
      message: "Meeting link deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting meeting link:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete meeting link", error: error.message },
      { status: 500 }
    );
  }
} 