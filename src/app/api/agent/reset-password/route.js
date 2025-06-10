import { NextResponse } from "next/server";
import _db from "../../../../../utils/db";
import bcrypt from "bcryptjs";
import AgentModel from "../../../../../models/Agent.model";

_db();

export const POST = async (request) => {
  try {
    const { email, resetToken, newPassword } = await request.json();

    if (!email || !resetToken || !newPassword) {
      return NextResponse.json(
        { success: false,  message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    const agent = await AgentModel.findOne({ email });

    if (!agent || agent.resetToken !== resetToken) {
      return NextResponse.json(
        { success: false, message: "Linked has expired" },
        { status: 400 }
      );
    }

    const isTokenExpired = new Date(agent.resetTokenExpiry) < new Date();
    if (isTokenExpired) {
      return NextResponse.json(
        { success: false, message: "Linked has expired" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    agent.password = hashedPassword;
    agent.resetToken = undefined;
    agent.resetTokenExpiry = undefined;

    await agent.save();

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error while resetting password:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
};
