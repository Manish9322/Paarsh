import { NextResponse } from "next/server";
import UserModel from "models/User.model";
import bcrypt from "bcryptjs";
import validator from "validator";
import generateTokens from "../../../../../utils/generateTokens";
import _db from "../../../../../utils/db";
import { resetPassword } from "../../../../../utils/MailTemplates/forgotPasswordMailTemplate";
import emailSender from "../../../../../utils/mailSender";

await _db();

export async function PUT(request) {
  try {
    const { email, password, otp } = await request.json();

    if (!email || !password || !otp) {
      return NextResponse.json(
        { success: false, error: "Email , Password and OTP are required." },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Email not registered", redirect: "/signup" },
        { status: 400 }
      );
    }

    if (
      user.otpToken?.toString() !== otp.toString() ||
      Date.now() > user.otpTokenExpiry
    ) {
      console.error("Invalid or expired OTP.");
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.otpToken = null;
    user.otpTokenExpiry = null;
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Password updated successfully.",
        redirect: "/login",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing password update:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Password update failed. Please try again later.",
      },
      { status: 500 }
    );
  }
}

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email is required",
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

    // Check for existing users
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

    const otp = generateOtp();
    const expiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    // Create a new user
    user.otpToken = otp;
    user.otpTokenExpiry = expiry;
    await user.save();


    const message = resetPassword(otp, user.name);
    const emailOptions = {
      email: email, 
      subject: "Email verification for password reset",
      message: message,
    };

    await emailSender(emailOptions);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully.",
        data: {
          accessToken,
          refreshToken,
          redirect: `/reset-password?email=${email}`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while processing request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Please try again later.",
      },
      { status: 500 }
    );
  }
}
