import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import UserModel from "../../../../../models/User.model";
import _db from "../../../../../utils/db";
import validator from "validator";
import generateTokens from "../../../../../utils/generateTokens";


_db();

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 }
      );
    }

    if (!validator.isEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email address",
        },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Email not registered",
          redirect: "/signup",
        },
        { status: 400 }
      );
    }

    if (user.password === "000000") {
      return NextResponse.json(
        {
          success: false,
          error: "Please use Google signin",
        },
        { status: 400 }
      );
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Incorrect password",
        },
        { status: 400 }
      );
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, false);

    return NextResponse.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        redirect: "/userdashboard",
      },
    });
  } catch (error) {
    console.error("Error while processing request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
