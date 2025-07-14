import { NextResponse } from "next/server";
import UserModel from "models/User.model";
import bcrypt from "bcryptjs";
import validator from "validator";
import _db from "../../../../../utils/db";
import { authMiddleware } from "../../../../../middlewares/auth";

await _db();

export const PUT = authMiddleware(async (request) => {
  try {
    const { user } = request;

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized Access",
        },
        { status: 401 },
      );
    }

    const { email , previousPassword, newPassword } = await request.json();

    // Validate input
    if (!email || !previousPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, current password, and new password are required.",
        },
        { status: 400 },
      );
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email address",
        },
        { status: 400 },
      );
    }

    // Validate new password strength (optional - customize as needed)
    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "New password must be at least 6 characters long",
        },
        { status: 400 },
      );
    }

    // Check if user exists
    const fetchedUser = await UserModel.findOne({ email });

    if (!fetchedUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          redirect: "/signup",
        },
        { status: 404 },
      );
    }

    // Verify current password
    const ispreviousPasswordValid = await bcrypt.compare(
      previousPassword,
      fetchedUser.password,
    );

    if (!ispreviousPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Current password is incorrect",
        },
        { status: 400 },
      );
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(
      newPassword,
      fetchedUser.password,
    );

    if (isSamePassword) {
      return NextResponse.json(
        {
          success: false,
          error: "New password must be different from current password",
        },
        { status: 400 },
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password in database
    fetchedUser.password = hashedNewPassword;
    await fetchedUser.save();

    return NextResponse.json(
      {
        success: true,
        message: "Password changed successfully.",
        redirect: "/profile", // or wherever you want to redirect
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Password change failed. Please try again later.",
      },
      { status: 500 },
    );
  }
},["user"]);
