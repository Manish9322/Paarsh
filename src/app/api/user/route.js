import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import validator from "validator";
import generateTokens from "../../../../utils/generateTokens";
import _db from "@/utils/db";
import UserModel from "@/models/User.model";
import OnboardingModel from "@/models/UserSetting.model";

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
    } else if (!user?.isVerified){
      return NextResponse.json(
        {
          success: false,
          error: "Email is not verified, please verify your email.",
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

    // Check if onboarding is complete
    const onboarding = await OnboardingModel.findOne({ userId: user._id });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Redirect based on onboarding status
    const redirect = onboarding ? "/dashboard" : "/onboarding";

    return NextResponse.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        redirect,
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
