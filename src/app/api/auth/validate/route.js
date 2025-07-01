// /api/auth/validate/route.js
import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../../middlewares/auth";



async function validateHandler(req) {
  // If we reach here, token is valid (middleware passed)
  return NextResponse.json({
    success: true,
    message: "Token is valid",
    user: req.user
  });
}

// Export with auth middleware
export const GET = authMiddleware(validateHandler, ["user"]);