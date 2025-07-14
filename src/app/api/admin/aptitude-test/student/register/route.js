import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import validator from "validator";
import generateTokens from "../../../../../../../utils/generateTokens";
import StudentModel from "../../../../../../../models/AptitudeTest/Student.model";
import CollegeModel from "../../../../../../../models/AptitudeTest/College.model";
import TestModel from "../../../../../../../models/AptitudeTest/Test.model";
import _db from "../../../../../../../utils/db";

await _db();

export async function POST(request) {
  try {
    const { name, email, phone, degree, university, testId, collegeId, password } = await request.json();

    if (!name || !email || !phone || !degree || !university || !testId || !collegeId || !password) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!validator.isEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!validator.isMobilePhone(phone)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long" },
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

    const existingStudent = await StudentModel.findOne({ email, college: collegeId });
    if (existingStudent) {
      return NextResponse.json(
        { success: false, error: "Student already registered for this college" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const student = new StudentModel({
      name: name.trim(),
      email: email.toLowerCase(),
      phone,
      degree,
      university,
      college: collegeId,
      password: hashedPassword,
    });
    await student.save();

    const { accessToken, refreshToken } = generateTokens(student._id, "student");
    const { password: _, ...safeUser } = student.toObject();

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      user: { ...safeUser, role: "student", collegeName: college.name },
      student_access_token: accessToken,
      student_refresh_token: refreshToken,
      redirectTo: `/test?testId=${testId}&collegeId=${collegeId}`,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}