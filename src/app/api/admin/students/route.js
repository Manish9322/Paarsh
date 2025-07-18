import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../../middlewares/auth";
import _db from "../../../../../utils/db";
import Student from "../../../../../models/AptitudeTest/Student.model";
import College from "../../../../../models/AptitudeTest/College.model";

// Initialize database connection
await _db();

// Get All Students
export const GET = authMiddleware(async () => {
  try {
    const students = await Student.find({})
      .populate('college', 'name')
      .lean()
      .exec();
    
    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, ["admin"]);

// Delete Student
export const DELETE = authMiddleware(
  async (request) => {
    try {
      const { id } = await request.json();

      if (!id) {
        return NextResponse.json(
          { success: false, error: "Student ID is required" },
          { status: 400 },
        );
      }

      const deletedStudent = await Student.findByIdAndDelete(id).exec();

      if (!deletedStudent) {
        return NextResponse.json(
          { success: false, error: "Student not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        message: "Student deleted successfully",
        data: deletedStudent,
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 },
      );
    }
  },
  ["admin"],
); 