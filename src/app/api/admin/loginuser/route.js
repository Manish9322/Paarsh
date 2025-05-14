import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../../middlewares/auth";

// Allow all roles to check their role
export const GET = authMiddleware(async (req) => {
  try {
    const { user } = req;

    if (!user || !user.role) {
      return NextResponse.json(
        { success: false, error: "Role not found" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      role: user.role,
    });
  } catch (err) {
    console.error("Error in /api/auth/role:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}, ["admin", "user", "agent"]);
