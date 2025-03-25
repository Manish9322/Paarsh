import { NextResponse } from "next/server";
import _db from "../../../../../utils/db";
import MeetingLink from "../../../../../models/MeetingLink.model";
import { authMiddleware } from "../../../../../middlewares/auth";


_db();

// GET single meeting link
export const GET = authMiddleware(async (req, { params }) => {
  try {
    await dbConnect();
    const meetingLink = await MeetingLink.findOne({
      _id: params.id,
      isDeleted: false,
    });

    if (!meetingLink) {
      return NextResponse.json(
        { success: false, error: "Meeting link not found" },
        { status: 404 }
      );
    }

    // Update status if needed
    const now = new Date();
    const meetingDate = new Date(meetingLink.date);
    const meetingTime = meetingLink.time.split(" - ")[0];
    const [hours, minutes] = meetingTime.split(":");
    meetingDate.setHours(parseInt(hours), parseInt(minutes), 0);

    if (now > meetingDate && meetingLink.status === "upcoming") {
      meetingLink.status = "past";
      await meetingLink.save();
    }

    return NextResponse.json({
      success: true,
      message: "Meeting link fetched successfully",
      data: meetingLink,
    });
  } catch (error) {
    console.error("Error fetching meeting link:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
});

// PUT update a meeting link (admin only)
export const PUT = authMiddleware(async (req, { params }) => {
  try {
    const { user } = req;
    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    
    const meetingLink = await MeetingLink.findOne({
      _id: params.id,
      isDeleted: false,
    });

    if (!meetingLink) {
      return NextResponse.json(
        { success: false, error: "Meeting link not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updatedFields = [
      "title",
      "description",
      "date",
      "time",
      "link",
      "platform",
      "instructor",
      "status",
      "recording",
      "duration",
      "meetingId",
      "passcode",
      "hostUrl",
      "participantUrl",
      "startUrl",
      "joinUrl"
    ];

    updatedFields.forEach((field) => {
      if (body[field] !== undefined) {
        meetingLink[field] = body[field];
      }
    });

    await meetingLink.save();

    return NextResponse.json({
      success: true,
      message: "Meeting link updated successfully",
      data: meetingLink,
    });
  } catch (error) {
    console.error("Error updating meeting link:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
});

// PATCH update meeting status (admin only)
export const PATCH = authMiddleware(async (req, { params }) => {
  try {
    const { user } = req;
    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const meetingLink = await MeetingLink.findOne({
      _id: params.id,
      isDeleted: false,
    });

    if (!meetingLink) {
      return NextResponse.json(
        { success: false, error: "Meeting link not found" },
        { status: 404 }
      );
    }

    const { status, recording } = await req.json();

    if (!["upcoming", "past", "cancelled"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    meetingLink.status = status;
    if (recording) {
      meetingLink.recording = recording;
    }

    await meetingLink.save();

    return NextResponse.json({
      success: true,
      message: "Meeting status updated successfully",
      data: meetingLink,
    });
  } catch (error) {
    console.error("Error updating meeting status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
});

// DELETE meeting link (admin only)
export const DELETE = authMiddleware(async (req, { params }) => {
  try {
    const { user } = req;
    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }


    const meetingLink = await MeetingLink.findOne({
      _id: params.id,
      isDeleted: false,
    });

    if (!meetingLink) {
      return NextResponse.json(
        { success: false, error: "Meeting link not found" },
        { status: 404 }
      );
    }

    meetingLink.isDeleted = true;
    await meetingLink.save();

    return NextResponse.json({
      success: true,
      message: "Meeting link deleted successfully",
      data: meetingLink,
    });
  } catch (error) {
    console.error("Error deleting meeting link:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}); 