import { NextResponse } from "next/server";
import JobApplicationModel from "../../../../../Paarsh/models/JobApplication/JobApplication.model";
import _db from "../../../../../Paarsh/utils/db";
import notificationHelper from "../../../../utils/notificationHelper";

_db();

export async function POST(req) {
  try {
    const { fullName, email, phoneNumber, desiredRole, portfolioUrl, resume, coverLetter } = await req.json();

    try {
      const application = new JobApplicationModel({
        fullName,
        email,
        phoneNumber,
        desiredRole,
        portfolioUrl,
        resume,
        coverLetter,
      });

      await application.save();

        // 2. Trigger admin notification
      await notificationHelper.notifyJobApplication({
      userId: null, // Not logged-in user, coming from public form
      userName: fullName,
      position: desiredRole,
      applicationId: application._id,
    });

      return NextResponse.json({ message: "Application submitted successfully" }, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { error: "Error submitting application", details: error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error submitting Application:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Get All Job Applications
export async function GET() {
  try {
    const applications = await JobApplicationModel.find(); // Fetch all job applications
    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    console.error("Error fetching job applications:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete Job Application by ID
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Job Application ID is required" },
        { status: 400 }
      );
    }

    const deletedApplication = await JobApplicationModel.findByIdAndDelete(id);

    if (!deletedApplication) {
      return NextResponse.json(
        { success: false, error: "Job Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Job Application deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job application:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}