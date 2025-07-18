import { NextResponse } from "next/server";
import EnquiryModel from "../../../../models/Enquiry.model";
import notificationHelper from "utils/notificationHelper";

// GET endpoint to fetch enquiries
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const query = id ? { _id: id } : {};

    const enquiries = await EnquiryModel.find(query).sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: enquiries,
    });
  } catch (error) {
    console.error("GET error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}

// POST endpoint to create a new enquiry
export async function POST(request) {
  try {
    const { name, email, mobile } = await request.json();

    // Validate required fields
    if (!name || !email || !mobile) {
      return NextResponse.json(
        {
          success: false,
          message: "All required fields (name, email, mobile) must be provided",
        },
        { status: 400 },
      );
    }

    const enquiry = new EnquiryModel({
      name,
      email,
      mobile,
    });

    await enquiry.save();

    await notificationHelper.notifyEnquiry({
      userId: null,
      userName: name,
      subject: "How to access the course?",
      enquiryId: enquiry._id,
    });


    return NextResponse.json({
      success: true,
      data: enquiry,
      message: "Enquiry created successfully",
    });
  } catch (error) {
    console.error("POST error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}

// DELETE endpoint to delete an enquiry by ID
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Enquiry ID is required",
        },
        { status: 400 },
      );
    }

    const enquiry = await EnquiryModel.findByIdAndDelete(id);

    if (!enquiry) {
      return NextResponse.json(
        {
          success: false,
          message: "Enquiry not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    console.error("DELETE error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}
