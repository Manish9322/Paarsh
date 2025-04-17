import { NextResponse } from "next/server";
import JobApplicationModel from "../../../../../Paarsh/models/JobApplication/JobApplication.model";
import _db from "../../../../../Paarsh/utils/db";

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

      return NextResponse.json({ message: "Application submitted successfully" }, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { error: "Error submitting application", details: error.message },
        { status: 500 }
      );
    }
  } catch (error) {b
    console.error("Error submitting Application:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
