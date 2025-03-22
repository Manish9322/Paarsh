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

export const PUT = authMiddleware(async (req) => {
  try {
    const { user } = req;
    console.log("user is tthe ", user);
    const { id, name, email, mobile } = await req.json();

    // If the request is from a normal user, they can only update their own profile
    if (!user.isAdmin && user._id !== id) {
      return NextResponse.json(
        { error: "Unauthorized to update this user", success: false },
        { status: 403 }
      );
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { name, email, mobile, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
});


export const DELETE = authMiddleware(async (req) => {
  try {
    const { user } = req;
    const { id } = await req.json();

    // If the request is from a normal user, they can only delete their own account
    if (!user.isAdmin && user._id !== id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this user", success: false },
        { status: 403 }
      );
    }

    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json(
        { error: "User not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
});
