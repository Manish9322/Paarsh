import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import generateTokens from "../../../../../../../utils/generateTokens";
import StudentModel from "../../../../../../../models/AptitudeTest/Student.model";
import validator from "validator";
import _db from "../../../../../../../utils/db";
import CollegeModel from "../../../../../../../models/AptitudeTest/College.model";
import TestModel from "../../../../../../../models/AptitudeTest/Test.model";

_db();

export async function POST(request) {
  try {
    const { email, password, testId, collegeId } = await request.json();

    if (!email || !password || !testId || !collegeId) {
      return NextResponse.json(
        { success: false, error: "Email, password, test ID, and college ID are required" },
        { status: 400 }
      );
    }

    const college = await CollegeModel.findOne({ _id: collegeId, testIds: testId });
    if (!college) {
      return NextResponse.json(
        { success: false, error: "Invalid test link or college" },
        { status: 400 }
      );
    }

    const test = await TestModel.findOne({ testId, college: collegeId });
    if (!test) {
      return NextResponse.json(
        { success: false, error: "Invalid test" },
        { status: 400 }
      );
    }

    const student = await StudentModel.findOne({ email, college: collegeId });
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    const { accessToken, refreshToken } = generateTokens(student._id, "student");
    const { password: _, ...safeUser } = student.toObject();

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: { ...safeUser, role: "student", collegeName: college.name },
      student_access_token: accessToken,
      student_refresh_token: refreshToken,
      studentId: student._id,
      redirectTo: `/aptitude-test?testId=${testId}&collegeId=${collegeId}`,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}