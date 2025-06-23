import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import UserModel from "../../../../../models/User.model";
import _db from "../../../../../utils/db";
import validator from "validator";
import generateTokens from "../../../../../utils/generateTokens";


_db();

export async function POST(request) {
  try {
    const { email, password, forceLogin = false } = await request.json();

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

    if (user.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          error: "Your account has been blocked. Please contact admin",
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

     // Check for active session
    if (user.currentSessionId && !forceLogin) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Already logged in on another device",
          needsConfirmation: true,
          message: "This account is already logged in on another device. Do you want to continue and logout the other session?"
        },
        { status: 409 },
      );
    }

    // Generate new session ID
    const sessionId = uuidv4();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, "user" , sessionId);

    // Replace the user.save() section with:
  await UserModel.findByIdAndUpdate(
    user._id,
    {
      currentSessionId: sessionId,
      lastLoginAt: new Date(),
      sessionCreatedAt: new Date()
    },
    { runValidators: false }
  );

     // Get user data without sensitive fields
    const { password: _, ...userData } = user.toObject();

    return NextResponse.json({
      success: true,
      message: forceLogin ? "Previous session logged out. Login successful" : "Login successful",
      data: {
        accessToken,
        refreshToken,
        userId: user._id.toString(), // Include userId
        name: user.name,
         sessionId,
        user: userData,
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
