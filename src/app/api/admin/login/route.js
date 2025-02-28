import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import generateTokens from "../../../../../utils/generateTokens";
import AdminModel from "../../../../../models/Admin.model";
import validator from "validator";
import _db from "../../../../../utils/db";
import { cookies } from "next/headers";

_db();

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (!validator.isEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 },
      );
    }

    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 },
      );
    }

    //  Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Incorrect password" },
        { status: 400 },
      );
    }

    console.log("Admin ID :", admin._id);

    //  Generate tokens
    const { accessToken, refreshToken } = generateTokens(admin._id, true);

    //  Set HTTP-only Secure Cookies

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      redirect: "/admin",
      admin_access_token: accessToken,
    });

    const cookieStore = await cookies(); // ✅ Await cookies()

    cookieStore.set("admin_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 3600,
      sameSite: "Strict",
    });

    cookieStore.set("admin_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 86400,
      sameSite: "Strict",
    });

    return response;
  } catch (error) {
    console.error("Error while processing request:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
