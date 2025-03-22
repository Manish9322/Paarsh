import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MeetingLink from "../../../../models/MeetingLink.model";
import { authMiddleware } from "../../../../middlewares/authMiddleware";

// GET all meeting links
export async function GET(req) {
  try {
    await dbConnect();
    
    // Extract query parameters for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    
    // Build query
    const query = { isDeleted: false };
    
    // Add status filter if provided
    if (status && ["upcoming", "past", "cancelled"].includes(status)) {
      query.status = status;
    }
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch meeting links with pagination
    const meetingLinks = await MeetingLink.find(query)
      .sort({ date: 1 }) // Sort by date (upcoming first)
      .skip(skip)
      .limit(limit);
    
    // Count total documents for pagination
    const total = await MeetingLink.countDocuments(query);
    
    // Update status based on date automatically before sending response
    const updatedLinks = meetingLinks.map(link => {
      const meetingDate = new Date(link.date);
      const today = new Date();
      
      // If status is not cancelled and the date has passed, update to past
      if (link.status !== "cancelled" && meetingDate < today && link.status !== "past") {
        link.status = "past";
        link.save(); // Save the updated status
      }
      
      return link;
    });
    
    return NextResponse.json({
      success: true,
      data: updatedLinks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching meeting links:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch meeting links", error: error.message },
      { status: 500 }
    );
  }
}

// POST create a new meeting link (admin only)
export async function POST(req) {
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
    
    const body = await req.json();
    
    // Validate required fields
    const requiredFields = ["title", "description", "date", "time", "link", "platform", "instructor"];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }
    
    // Create new meeting link
    const meetingLink = new MeetingLink({
      ...body,
      createdBy: authResult.user._id,  // Add the admin's ID as creator
    });
    
    await meetingLink.save();
    
    return NextResponse.json(
      { success: true, message: "Meeting link created successfully", data: meetingLink },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating meeting link:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create meeting link", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE all meeting links (admin only) - Not recommended but included for completeness
export async function DELETE(req) {
  try {
    // Verify admin authentication with high privileges check
    const authResult = await authMiddleware(req, ["admin"]);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }
    
    // This is a dangerous operation, so let's add an extra check
    const { searchParams } = new URL(req.url);
    const confirmation = searchParams.get("confirm");
    
    if (confirmation !== "CONFIRM_DELETE_ALL") {
      return NextResponse.json(
        { success: false, message: "This operation requires explicit confirmation" },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Soft delete all meeting links
    await MeetingLink.updateMany({}, { isDeleted: true });
    
    return NextResponse.json(
      { success: true, message: "All meeting links have been soft-deleted" }
    );
  } catch (error) {
    console.error("Error deleting all meeting links:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete all meeting links", error: error.message },
      { status: 500 }
    );
  }
} 