import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, email, mobile, subject, message } = body;

    if (!name || !email || !mobile || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 },
      );
    }

    // Log the full enquiry data for debugging
    console.log("Received syllabus download enquiry:", {
      ...body,
      // Redact sensitive information in logs
      email: body.email
        ? `${body.email.split("@")[0].slice(0, 3)}...@${body.email.split("@")[1]}`
        : null,
      mobile: body.mobile
        ? `${body.mobile.slice(0, 2)}...${body.mobile.slice(-2)}`
        : null,
    });

    await notificationHelper.notifyEnquiry({
      userId: user._id,
      userName: user.name,
      subject: "How to access the course?",
      enquiryId: "enquiry_123abc",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Enquiry created successfully",
        data: {
          id: "mock-enquiry-id-" + Date.now(),
          // Don't return sensitive information
          name: body.name,
          courseName: body.courseName || null,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating enquiry:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create enquiry",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
