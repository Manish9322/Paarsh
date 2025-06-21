import { NextResponse } from "next/server";
import _db from "../../../../utils/db";
import PracticeTestModel from "../../../../models/PracticeTest.model";
import CourseModel from "../../../../models/Courses/Course.model";
import { authMiddleware } from "../../../../middlewares/auth";
import mongoose from "mongoose"; // Import mongoose for ObjectId validation

_db();

// Add Practice Test
export const POST = authMiddleware(async (request) => {
  try {
    const {
      testName,
      linkedCourses,
      skill,
      level,
      questionCount,
      duration,
      questions,
    } = await request.json();

    if (
      !testName ||
      !linkedCourses ||
      !skill ||
      !level ||
      !questionCount ||
      !duration ||
      !questions
    ) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    const coursesExist = await CourseModel.find({
      _id: { $in: linkedCourses },
    });
    if (coursesExist.length !== linkedCourses.length) {
      return NextResponse.json(
        { success: false, error: "One or more linked courses do not exist" },
        { status: 400 }
      );
    }

    const newPracticeTest = new PracticeTestModel({
      testName,
      linkedCourses,
      skill,
      level,
      questionCount,
      duration,
      questions,
    });

    await newPracticeTest.save();

    await CourseModel.updateMany(
      { _id: { $in: linkedCourses } },
      { $push: { practiceTests: newPracticeTest._id } }
    );

    return NextResponse.json({
      success: true,
      message: "Practice test created successfully",
      data: newPracticeTest,
    });
  } catch (error) {
    console.error("Error while creating practice test:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}, ["admin"]);

// Get Practice Tests (All or by ID)
export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const practiceTest = await PracticeTestModel.findById(id).populate(
        "linkedCourses"
      );
      if (!practiceTest) {
        return NextResponse.json(
          { success: false, error: "Practice test not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: practiceTest });
    }

    const practiceTests = await PracticeTestModel.find().populate(
      "linkedCourses"
    );
    return NextResponse.json({ success: true, data: practiceTests });
  } catch (error) {
    console.error("Error fetching practice tests:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
};

// Edit Practice Test
export const PUT = authMiddleware(async (request) => {
  try {
    const {
      _id,
      testName,
      linkedCourses,
      skill,
      level,
      questionCount,
      duration,
      questions,
    } = await request.json();

    if (!_id) {
      return NextResponse.json(
        { success: false, error: "Practice test ID is required" },
        { status: 400 }
      );
    }

    if (
      !testName ||
      !linkedCourses ||
      !skill ||
      !level ||
      !questionCount ||
      !duration ||
      !questions
    ) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    const coursesExist = await CourseModel.find({
      _id: { $in: linkedCourses },
    });
    if (coursesExist.length !== linkedCourses.length) {
      return NextResponse.json(
        { success: false, error: "One or more linked courses do not exist" },
        { status: 400 }
      );
    }

    const existingTest = await PracticeTestModel.findById(_id);
    if (!existingTest) {
      return NextResponse.json(
        { success: false, error: "Practice test not found" },
        { status: 404 }
      );
    }

    await CourseModel.updateMany(
      { practiceTests: _id },
      { $pull: { practiceTests: _id } }
    );
    await CourseModel.updateMany(
      { _id: { $in: linkedCourses } },
      { $push: { practiceTests: _id } }
    );

    const updatedTest = await PracticeTestModel.findByIdAndUpdate(
      _id,
      {
        testName,
        linkedCourses,
        skill,
        level,
        questionCount,
        duration,
        questions,
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Practice test updated successfully",
      data: updatedTest,
    });
  } catch (error) {
    console.error("Error updating practice test:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}, ["admin"]);

// Delete Practice Test
export const DELETE = authMiddleware(async (request) => {
  try {
    const body = await request.json();
    console.log("Received DELETE body:", body);
    const { id } = body;

    if (!id || typeof id !== "string") {
      console.error("Invalid ID received:", id);
      return NextResponse.json(
        { success: false, error: "Practice test ID must be a valid string" },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("Invalid ObjectId format:", id);
      return NextResponse.json(
        { success: false, error: "Invalid ObjectId format" },
        { status: 400 }
      );
    }

    const deletedTest = await PracticeTestModel.findByIdAndDelete(id);
    if (!deletedTest) {
      console.error("Practice test not found for ID:", id);
      return NextResponse.json(
        { success: false, error: "Practice test not found" },
        { status: 404 }
      );
    }

    // Update linked courses
    await CourseModel.updateMany(
      { practiceTests: id },
      { $pull: { practiceTests: id } }
    );

    return NextResponse.json({
      success: true,
      message: "Practice test deleted successfully",
      data: deletedTest,
    });
  } catch (error) {
    console.error("Error deleting practice test:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}, ["admin"]);