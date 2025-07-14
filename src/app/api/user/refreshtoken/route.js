// /api/auth/refresh/route.js
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { JWT_SECRET_USER } from "../../../../../config/config";
import UserModel from "../../../../../models/User.model";
import generateTokens from "../../../../../utils/generateTokens";
import _db from "../../../../../utils/db";

await _db();

export async function POST(request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: "Refresh token required", forceLogout: true },
        { status: 401 }
      );
    }

    try {
      // Verify refresh token
      const decoded = verify(refreshToken, JWT_SECRET_USER);
      
      // if (decoded.type !== "refresh") {
      //   return NextResponse.json(
      //     { success: false, error: "Invalid refresh token", forceLogout: true },
      //     { status: 401 }
      //   );
      // }

      // Find user
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        return NextResponse.json(
          { success: false, error: "User not found", forceLogout: true },
          { status: 404 }
        );
      }

      // Check if user still has active session
      if (!user.currentSessionId) {
        return NextResponse.json(
          { success: false, error: "No active session", forceLogout: true },
          { status: 401 }
        );
      }

      // Generate new tokens with existing session ID
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(
        user._id, 
        false, 
        "user", 
        user.currentSessionId
      );

      return NextResponse.json({
        success: true,
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      });

    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return NextResponse.json(
          { success: false, error: "Refresh token expired", forceLogout: true },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: "Invalid refresh token", forceLogout: true },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error("Error refreshing token:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", forceLogout: true },
      { status: 500 }
    );
  }
}