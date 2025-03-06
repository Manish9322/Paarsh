import { NextResponse } from "next/server";
import _db from "../../../../utils/db";
import { authMiddleware } from "../../../../middlewares/auth";
import UserModel from "../../../../models/User.model";

export const GET = authMiddleware(async () => {
  try {
    const Users = await UserModel.find();
    return NextResponse.json({ success: true, data: Users });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, true);