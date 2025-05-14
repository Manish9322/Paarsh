import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import generateTokens from "../../../../../utils/generateTokens";
import AdminModel from "../../../../../models/Admin.model";
import AgentModel from "../../../../../models/Agent.model";
import validator from "validator";
import _db from "../../../../../utils/db";

_db();

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!validator.isEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 },
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      );
    }

    // First try to find Admin
    let user = await AdminModel.findOne({ email });
    let role = "admin";
    let redirectTo = "/admin";

    if (!user) {
      // Try to find Agent
      user = await AgentModel.findOne({ email });
      role = "agent";
      redirectTo = "/agent";
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({
        success: false,
        error: "Incorrect password",
      },
      { status: 401 },
    );
    }

    const { accessToken, refreshToken } = generateTokens(user._id, role);

    const { password: _, ...safeUser } = user.toObject();

    return NextResponse.json({
      success: true,
      message: "Login Successful",
      user: { ...safeUser, role },
      admin_access_token: accessToken,
      admin_refresh_token: refreshToken,
      role,
      redirectTo,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 },
    );
  }
}
