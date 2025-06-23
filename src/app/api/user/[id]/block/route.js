import { NextResponse } from "next/server";
import UserModel from "models/User.model"; 
import _db from "../../../../../../utils/db"; 

_db(); 

export async function PATCH(request, { params }) {
  try {
    const { id } = params; 
    const { isBlocked } = await request.json(); 

    if (typeof isBlocked !== "boolean") {
      return NextResponse.json(
        { success: false, error: "isBlocked must be a boolean value" },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    user.isBlocked = isBlocked;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling block status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to toggle block status. Please try again later.",
      },
      { status: 500 }
    );
  }
}