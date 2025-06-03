import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../../middlewares/auth"; // Middleware that attaches user info
import UserModel from "models/User.model";
import _db from "../../../../../utils/db";

_db();

export const POST = authMiddleware(async (req) => {
  try {

    const { user } = req;

   const userId = user._id;

    const dbUser = await UserModel.findById(userId);
    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    dbUser.currentSessionId = null;
    dbUser.sessionCreatedAt = null;
    await dbUser.save();

    return NextResponse.json({ success: true, message: "Logged out successfully" }, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}, ["user"]); // ✅ Only for logged-in users
