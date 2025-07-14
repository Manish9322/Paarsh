import { NextResponse } from "next/server";
import JobPositionModel from "models/JobApplication/JobPosition.model";
import _db from "utils/db";

await _db();

export async function POST(req) {
  try {
    const { position, department, location, workType, description, skillsRequired, expiryDate, salaryRange, experienceLevel } = await req.json();

    const jobPosition = new JobPositionModel({
      position,
      department,
      location,
      workType,
      description,
      skillsRequired,
      expiryDate,
      salaryRange,
      experienceLevel,
    });

    await jobPosition.save();

    return NextResponse.json({ message: "Job position created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating job position:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const jobPositions = await JobPositionModel.find({ isActive: true });
    return NextResponse.json({ success: true, data: jobPositions });
  } catch (error) {
    console.error("Error fetching job positions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { id, ...updateData } = await req.json();
    const updatedPosition = await JobPositionModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPosition) {
      return NextResponse.json({ error: "Job position not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Job position updated successfully", data: updatedPosition });
  } catch (error) {
    console.error("Error updating job position:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    const deletedPosition = await JobPositionModel.findByIdAndDelete(id);
    if (!deletedPosition) {
      return NextResponse.json({ error: "Job position not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Job position deleted successfully" });
  } catch (error) {
    console.error("Error deleting job position:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}