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
        { status: 400 }
      );
    }
    
    // Log the full enquiry data for debugging
    console.log("Received syllabus download enquiry:", {
      ...body,
      // Redact sensitive information in logs
      email: body.email ? `${body.email.split('@')[0].slice(0,3)}...@${body.email.split('@')[1]}` : null,
      mobile: body.mobile ? `${body.mobile.slice(0,2)}...${body.mobile.slice(-2)}` : null
    });
    
    // In a real application, you would:
    // 1. Save the enquiry to your database
    // const enquiry = {
    //   name: body.name,
    //   email: body.email,
    //   mobile: body.mobile,
    //   subject: body.subject,
    //   message: body.message,
    //   status: body.status || "pending",
    //   courseId: body.courseId || null,
    //   courseName: body.courseName || null,
    //   source: body.source || "syllabus_download",
    //   downloadedAt: body.downloadedAt || new Date().toISOString(),
    //   createdAt: new Date().toISOString()
    // };
    // 
    // await db.collection("enquiries").insertOne(enquiry);
    
    // 2. Send an email notification to administrators
    // await sendAdminNotification({
    //   type: "syllabus_download",
    //   userName: body.name,
    //   userEmail: body.email,
    //   userMobile: body.mobile,
    //   courseName: body.courseName,
    //   message: `User has requested to download the syllabus for ${body.courseName || "a course"}.`
    // });
    
    // 3. Possibly send a confirmation email to the user
    // await sendUserConfirmation({
    //   to: body.email,
    //   name: body.name,
    //   courseName: body.courseName,
    //   subject: "Your syllabus download confirmation"
    // });
    
    // Mock success response
    return NextResponse.json(
      {
        success: true,
        message: "Enquiry created successfully",
        data: {
          id: "mock-enquiry-id-" + Date.now(),
          // Don't return sensitive information
          name: body.name,
          courseName: body.courseName || null,
          createdAt: new Date().toISOString()
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating enquiry:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create enquiry",
        error: error.message,
      },
      { status: 500 }
    );
  }
} 