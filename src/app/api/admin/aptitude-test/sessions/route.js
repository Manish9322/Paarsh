import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { authMiddleware } from "../../../../../../middlewares/auth"; // Adjust path as needed
import TestSession from "../../../../../../models/AptitudeTest/TestSession.model"; // Adjust path to your TestSession model
import Student from "../../../../../../models/AptitudeTest/Student.model";
import College from "../../../../../../models/AptitudeTest/College.model";
import _db from "../../../../../../utils/db";

await _db();

export const GET = authMiddleware(
  async function (request) {
    try {
      const { searchParams } = new URL(request.url);
      const collegeId = searchParams.get("collegeId");
    
      // Validate collegeId if provided
      if (collegeId && !mongoose.Types.ObjectId.isValid(collegeId)) {
        console.error("Invalid collegeId:", collegeId);
        return NextResponse.json(
          { success: false, message: "Invalid collegeId" },
          { status: 400 },
        );
      }

      // Build query
      const query = collegeId
        ? { college: new mongoose.Types.ObjectId(collegeId) }
        : {};
     
      // Fetch test sessions with populated student and college fields
      const testSessions = await TestSession.find(query)
        .populate("student", "name") // Populate student name
        .populate("college", "name") // Populate college name
        .sort({ startTime: -1 }); // Sort by startTime, newest first

      return NextResponse.json({ success: true, testSessions });
    } catch (error) {
      console.error("Error fetching test sessions:", error.message);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }
  },
  ["admin"],
);
