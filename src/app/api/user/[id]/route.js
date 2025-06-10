import { NextResponse } from "next/server";
import _db from "../../../../../utils/db";
import { authMiddleware } from "../../../../../middlewares/auth";
import UserModel from "models/User.model";

_db();

export const GET = authMiddleware(async (req, { params }) => {
  try {
    const { id } = params; // Destructure ID from route params

    // Fetch only `name` and `mobile` fields
    const user = await UserModel.findById(id).select("name email mobile");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["agent"]); // Only accessible to authenticated agents
