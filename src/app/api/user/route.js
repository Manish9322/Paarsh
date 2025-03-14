import { NextResponse } from "next/server";
import _db from "../../../../utils/db";
import { authMiddleware } from "../../../../middlewares/auth";
import UserModel from "../../../../models/User.model";

export const GET = authMiddleware(async (req) => {
  try {
    const { user } = req;

    if (!user) {
      return NextResponse.json(
        { error: "User is not authenticated" },
        { status: 401 },
      );
    }

    const userId = user._id;

    const User = await UserModel.findById(userId).exec();
    return NextResponse.json({ success: true, data: User });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
});
