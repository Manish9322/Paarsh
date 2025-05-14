import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import {
  JWT_SECRET_USER,
  JWT_SECRET_ADMIN,
  JWT_SECRET_AGENT,
} from "../config/config";
import UserModel from "../models/User.model";
import AdminModel from "../models/Admin.model";
import AgentModel from "../models/Agent.model";
import _db from "../utils/db";

_db();

const ROLE_SECRET_MAP = {
  user: JWT_SECRET_USER,
  admin: JWT_SECRET_ADMIN,
  agent: JWT_SECRET_AGENT,
};

const ROLE_MODEL_MAP = {
  user: UserModel,
  admin: AdminModel,
  agent: AgentModel,
};

export function authMiddleware(handler, allowedRoles = ["user"]) {
  return async (req, context) => {
    try {
      let token;

      for (const r of allowedRoles) {
        const headerName =
          r === "admin" || r === "agent"
            ? "admin-authorization"
            : "authorization";
        const raw = req.headers.get(headerName);
        if (raw) {
          token = raw?.replace("Bearer ", "");
          break;
        }
      }

      if (!token) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Token missing" },
          { status: 401 },
        );
      }

      // Try all allowed roles until one verifies
      let decoded, role;
      for (const r of allowedRoles) {
        try {
          decoded = verify(token, ROLE_SECRET_MAP[r]);
          role = r;
          break;
        } catch (_) {}
      }

      if (!decoded || !role) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Invalid token" },
          { status: 401 },
        );
      }

      const Model = ROLE_MODEL_MAP[role];
      const user = await Model.findById(decoded.userId).lean();

      if (!user) {
        return NextResponse.json(
          { success: false, error: `${role} not found` },
          { status: 404 },
        );
      }

      // Remove sensitive fields
      const { password, ...safeUser } = user;

      // Attach user to request
      req.user = { ...safeUser, role };

      return handler(req, context);
    } catch (err) {
      console.error("Auth Middleware Error:", err);
      return NextResponse.json(
        { success: false, error: "Unauthorized request" },
        { status: 401 },
      );
    }
  };
}
