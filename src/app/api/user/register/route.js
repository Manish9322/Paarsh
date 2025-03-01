import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import UserModel from "../../../../../../Paarsh/models/User.model";
import _db from "../../../../../utils/db";
import validator from "validator";
import generateTokens from "../../../../../utils/generateTokens";



_db();

export async function POST(request) {
  try {
    const { fullName, email, password , phoneNumber , refferalCode } = await request.json();

    // Validate input
    if (!fullName || !email || !phoneNumber || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "FullName, Email, Phone and password are required",
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
    const existingUserByEmail = await UserModel.findOne({ email });
    if (existingUserByEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "Email already registered",
            redirect: "/login",
          },
          { status: 400 }
        );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new UserModel({
      fullName,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(newUser._id);

  

    return NextResponse.json({
      success: true,
      message: "Registered successfully.",
      data: {
        accessToken,
        refreshToken,
        redirect:"/dashboard"
      },
    });
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
