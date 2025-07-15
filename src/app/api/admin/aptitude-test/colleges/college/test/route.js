import { NextResponse } from "next/server";
import CollegeModel from "../../../../../../../../models/AptitudeTest/College.model";
import TestModel from "../../../../../../../../models/AptitudeTest/Test.model";
import _db from "../../../../../../../../utils/db";
import { authMiddleware } from "../../../../../../../../middlewares/auth";
import TestSessionModel from "../../../../../../../../models/AptitudeTest/TestSession.model";
import mongoose from "mongoose";

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

      const tests = await TestModel.find(query).lean().exec();
      return NextResponse.json({
        success: true,
        message: "Tests fetched successfully",
        data: tests.map((test) => ({
          ...test,
        })),
      });
    } catch (error) {
      console.error("Fetch tests error:", error);
      return NextResponse.json(
        { success: false, message: "Something went wrong" },
        { status: 500 },
      );
    }
  },
  ["admin"],
);