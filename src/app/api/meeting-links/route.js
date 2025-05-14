import { NextResponse } from "next/server";
import _db from "../../../../utils/db";
import MeetingLink from "../../../../models/MeetingLink.model";
import { authMiddleware } from "../../../../middlewares/auth";

_db();        
// GET all meeting links
export const GET = authMiddleware(async (req) => {
  try {
    
    // Extract query parameters for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const sortField = searchParams.get("sortField");
    const sortOrder = searchParams.get("sortOrder") || "asc";
    
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
    
    // Build sort options
    const sortOptions = {};
    if (sortField) {
      sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;
    } else {
      // Default sort: upcoming meetings first, then by date
      sortOptions["status"] = 1; // upcoming first
      sortOptions["date"] = 1; // earliest date first
    }
    
    // Fetch meeting links with pagination
    const meetingLinks = await MeetingLink.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Count total documents for pagination
    const totalItems = await MeetingLink.countDocuments(query);
    
    // Get statistics for dashboard
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Count upcoming meetings
    const upcomingCount = await MeetingLink.countDocuments({
      isDeleted: false,
      status: "upcoming",
    });
    
    // Count past meetings with recordings
    const recordingsCount = await MeetingLink.countDocuments({
      isDeleted: false,
      status: "past",
      recording: { $exists: true, $ne: null, $ne: "" },
    });
    
    // Count meetings created in the last week for growth stats
    const newMeetingsLastWeek = await MeetingLink.countDocuments({
      isDeleted: false,
      createdAt: { $gte: lastWeek },
    });
    
    // Count previous week for comparison
    const twoWeeksAgo = new Date(lastWeek);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
    const prevWeekMeetings = await MeetingLink.countDocuments({
      isDeleted: false,
      createdAt: { $gte: twoWeeksAgo, $lt: lastWeek },
    });
    
    // Count new upcoming meetings created in the last week
    const newUpcomingLastWeek = await MeetingLink.countDocuments({
      isDeleted: false,
      status: "upcoming",
      createdAt: { $gte: lastWeek },
    });
    
    // Count new recordings added in the last month
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const newRecordingsLastMonth = await MeetingLink.countDocuments({
      isDeleted: false,
      status: "past",
      recording: { $exists: true, $ne: null, $ne: "" },
      "recording.createdAt": { $gte: lastMonth },
    });
    
    // Update status based on date automatically before sending response
    const updatedLinks = await Promise.all(meetingLinks.map(async link => {
      const meetingDate = new Date(link.date);
      const today = new Date();
      
      // If status is not cancelled and the date has passed, update to past
      if (link.status !== "cancelled" && meetingDate < today && link.status !== "past") {
        link.status = "past";
        await link.save(); // Save the updated status
      }
      
      return link;
    }));
    
    return NextResponse.json({
      success: true,
      message: "Meeting links fetched successfully",
      data: {
        meetings: updatedLinks,
        pagination: {
          totalItems,
          page,
          limit,
          totalPages: Math.ceil(totalItems / limit)
        },
        stats: {
          total: totalItems,
          upcoming: upcomingCount,
          recordings: recordingsCount,
          growth: {
            total: newMeetingsLastWeek - prevWeekMeetings,
            upcoming: newUpcomingLastWeek,
            recordings: newRecordingsLastMonth
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching meeting links:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} , ["admin" , "user"]);

// POST create a new meeting link (admin only)
export const POST = authMiddleware(async (req) => {
  try {
    const { user } = req;
    
    // Check if user is admin
    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    
    // Validate required fields
    const requiredFields = ["title", "description", "date", "time", "link", "platform", "instructor"];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }
    
    // Create new meeting link
    const meetingLink = new MeetingLink({
      ...body,
      createdBy: user._id,  // Add the admin's ID as creator
    });
    
    await meetingLink.save();
    
    return NextResponse.json({
      success: true,
      message: "Meeting link created successfully",
      data: meetingLink
    });
  } catch (error) {
    console.error("Error creating meeting link:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["admin"]);

// DELETE all meeting links (admin only) - Not recommended but included for completeness
export const DELETE = authMiddleware(async (req) => {
  try {
    const { user } = req;
    
    // Check if user is admin
    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    // This is a dangerous operation, so let's add an extra check
    const { searchParams } = new URL(req.url);
    const confirmation = searchParams.get("confirm");
    
    if (confirmation !== "CONFIRM_DELETE_ALL") {
      return NextResponse.json(
        { success: false, error: "This operation requires explicit confirmation" },
        { status: 400 }
      );
    }
    
    // Soft delete all meeting links
    await MeetingLink.updateMany({}, { isDeleted: true });
    
    return NextResponse.json({
      success: true,
      message: "All meeting links have been soft-deleted",
      data: null
    });
  } catch (error) {
    console.error("Error deleting all meeting links:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["admin"]); 