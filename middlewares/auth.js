import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { JWT_SECRET_USER, JWT_SECRET_ADMIN } from "../config/config";
import UserModel from "../models/User.model";
import AdminModel from "../models/Admin.model";
import _db from "../utils/db";

_db();

export function authMiddleware(handler) {
  return async (req, context) => {
    // Extract Authorization header
    let isAdmin = false;
    let token;

    // First, check for the Admin-Authorization header
    token = req.headers.get("admin-authorization")?.replace("Bearer ", "");
    if (token) {
      isAdmin = true;
    } else {
      // User token from Authorization header
      token = req.headers.get("authorization")?.replace("Bearer ", "");
    }

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized Access", success: false },
        { status: 401 }
      );
    }

    try {
      // Select the correct secret key
      const secretKey = isAdmin ? JWT_SECRET_ADMIN : JWT_SECRET_USER;

      const decoded = verify(token, secretKey);

      // Fetch user/admin details from DB
      const model = isAdmin ? AdminModel : UserModel;
      const user = await model.findById(decoded.userId).lean();

      if (!user) {
        return NextResponse.json(
          { error: "User not found", success: false },
          { status: 404 }
        );
      }

      // Remove sensitive data before attaching to request
      const { password, ...sanitizedUser } = user;
      req.user = { ...sanitizedUser, isAdmin };

      // Pass both request and context to the handler
      return handler(req, context);
    } catch (error) {
      const errName = error.name;
      const message =
        errName === "TokenExpiredError"
          ? "Token expired"
          : errName === "JsonWebTokenError"
            ? "Invalid token"
            : "Unauthorized";

      return NextResponse.json(
        { error: message, success: false },
        { status: 401 }
      );
    }
  };
}
