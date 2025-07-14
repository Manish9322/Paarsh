// app/api/admin/colleges/route.js
import { NextResponse } from 'next/server';
import CollegeModel from '../../../../../../models/AptitudeTest/College.model';
import _db from '../../../../../../utils/db';
import { authMiddleware } from '../../../../../../middlewares/auth';
import TestSessionModel from '../../../../../../models/AptitudeTest/TestSession.model';

await _db();

export const POST = authMiddleware(async function (request) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400 } 
      );
    }

    const existingCollege = await CollegeModel.findOne({ email });
    if (existingCollege) {
      return NextResponse.json(
        { success: false, message: "College with this email already exists" },
        { status: 400 }
      );
    }

    const college = new CollegeModel({
      name,
      email,
      createdBy: request.user._id,
    });
    await college.save();

    return NextResponse.json({
      success: true,
      message: "College created successfully",
      data: college,
    });
  } catch (error) {
    console.error("College creation error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}, ["admin"]);

export const GET = authMiddleware(async function(request) {
  try {
   
    const colleges = await CollegeModel.find()
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, colleges });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} , ["admin"]);



export const PUT = authMiddleware(async function (request, { params }) {

  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get("collegeId");
    
    const { name, email } = await request.json();

    const college = await CollegeModel.findByIdAndUpdate(
      collegeId,
      {
        name,
        email,
      },
      { new: true, runValidators: true }
    );

    if (!college) {
      return NextResponse.json(
        { success: false, message: "College not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, college });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} , ["admin"]
);

export const DELETE = authMiddleware(async function(request, { params }) {


  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get("collegeId");

    const college = await CollegeModel.findByIdAndDelete(collegeId);
    if (!college) {
      return NextResponse.json(
        { success: false, message: "College not found" },
        { status: 404 }
      );
    }

    // Delete associated TestSessions
    await TestSessionModel.deleteMany({ college: college._id });

    return NextResponse.json({
      success: true,
      message: "College and associated test sessions deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} , ["admin"]
);

