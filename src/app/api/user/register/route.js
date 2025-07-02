import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import UserModel from "../../../../../models/User.model";
import _db from "../../../../../utils/db";
import validator from "validator";
import generateTokens from "../../../../../utils/generateTokens";
import notificationHelper from '../../../../../utils/notificationHelper';

_db();

// Function to generate a unique referral code
const generateReferralCode = async (name) => {
  const initials = name.slice(0, 3).toUpperCase();
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  let referralCode = `${initials}${randomNumber}`;

  // Ensure the referral code is unique
  while (await UserModel.findOne({ refferalCode: referralCode })) {
    referralCode = `${initials}${Math.floor(1000 + Math.random() * 9000)}`;
  }

  return referralCode;
};

export async function POST(request) {
  try {
    const { name, email, password, mobile, refferalCode, acceptTerms } =
      await request.json();

    // Validate input
    if (!name || !email || !mobile || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "name, Email, Phone and password are required",
        },
        { status: 400 },
      );
    }

    if (!validator.isEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email address",
        },
        { status: 400 },
      );
    }

    // Check for existing users
    const existingUserByEmail = await UserModel.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Email already registered",
          redirect: "/signin",
        },
        { status: 400 },
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate and store referral code (if provided)
    let referredBy = null;
    if (refferalCode) {
      const referringUser = await UserModel.findOne({ refferalCode });
      if (!referringUser) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid referral code.",
          },
          { status: 400 },
        );
      }
      referredBy = referringUser._id; // Store the referring user's ID
    }

    // Generate a unique referral code for the new user
    const newReferralCode = await generateReferralCode(name);

    // Create a new user
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      mobile,
      refferalCode: newReferralCode, // Store the new user's referral code
      referredBy, // Store the ID of the user who referred them (if any)
      acceptTerms,
    });

    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(newUser._id);

      // Trigger admin notification
    await notificationHelper.notifyUserRegistration({
      userId: newUser._id,
      userName: name,
      email
    });

    return NextResponse.json({
      success: true,
      message: "Registered successfully.",
      data: {
        accessToken,
        refreshToken,
        redirect: "/",
      },
    });
  } catch (error) {
    console.error("Error while processing request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Please try again later.",
      },
      { status: 500 },
    );
  }
}
