// /app/api/me/route.ts

import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../middlewares/auth";
import UserModel from "../../../../models/User.model";
import AdminModel from "../../../../models/Admin.model";
import AgentModel from "../../../../models/Agent.model";

const ROLE_MODEL_MAP = {
  user: UserModel,
  admin: AdminModel,
  agent: AgentModel,
};

export const GET = authMiddleware(async (req) => {
  try {
    const { user } = req;

    console.log("user for the me:", user);
    console.log("user.role:", user.role);

    if (!user || !user._id || !user.role) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const Model = ROLE_MODEL_MAP[user.role];
    if (!Model) {
      return NextResponse.json(
        { success: false, error: "Invalid role" },
        { status: 400 }
      );
    }

    const foundUser = await Model.findById(user._id)
      .select("name email mobile role profileImage createdAt") // ✅ only public fields
      .lean();

    if (!foundUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
         success: true,   
        data: {
        ...foundUser,
        role: user.role,
      },
     });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["user"]);
