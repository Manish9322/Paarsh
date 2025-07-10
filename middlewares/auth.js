import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import {
  JWT_SECRET_USER,
  JWT_SECRET_ADMIN,
  JWT_SECRET_AGENT,
  JWT_SECRET_STUDENT,
} from "../config/config";
import UserModel from "../models/User.model";
import AdminModel from "../models/Admin.model";
import AgentModel from "../models/Agent.model";
import StudentModel from "../models/AptitudeTest/Student.model";
import _db from "../utils/db";

_db();

const ROLE_SECRET_MAP = {
  user: JWT_SECRET_USER,
  admin: JWT_SECRET_ADMIN,
  agent: JWT_SECRET_AGENT,
  student: JWT_SECRET_STUDENT
};

const ROLE_MODEL_MAP = {
  user: UserModel,
  admin: AdminModel,
  agent: AgentModel,
  student: StudentModel
};

export function authMiddleware(handler, allowedRoles = ["user"]) {
  return async (req, context) => {
    try {
      let token;

      // Check all possible headers for the allowed roles
      let foundRole = null;
      for (const r of allowedRoles) {
        const headerName = getHeaderName(r);
        const raw = req.headers.get(headerName);
        if (raw) {
          token = raw?.replace("Bearer ", "");
          foundRole = r; // Store which role's header contained the token
          break;
        }
      }

      console.log("foundRole:", foundRole);
      if (!token) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Token missing"  },
          { status: 401 },
        );
      }

      console.log("token:", token);

      // Try to verify token with the role that provided it first, then try others
      let decoded, role;
      
      // First try the role whose header contained the token
      if (foundRole) {
        try {
          decoded = verify(token, ROLE_SECRET_MAP[foundRole]);
          role = foundRole;
        } catch (jwtError) {
          // If verification fails, try other allowed roles
          for (const r of allowedRoles) {
            if (r !== foundRole) { // Skip the one we already tried
              try {
                decoded = verify(token, ROLE_SECRET_MAP[r]);
                role = r;
                break;
              } catch (jwtError) {}
            }
          }
        }
      } else {
        // Fallback: try all roles (shouldn't happen if token was found)
        for (const r of allowedRoles) {
          try {
            decoded = verify(token, ROLE_SECRET_MAP[r]);
            role = r;
            break;
          } catch (jwtError) {}
        }
      }        

      if (!decoded || !role) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Invalid token", forceLogout: true },
          { status: 401 },
        );
      }

      const Model = ROLE_MODEL_MAP[role];
      const user = await Model.findById(decoded.userId).lean();

      if (!user) {
        return NextResponse.json(
          { success: false, error: `${role} not found`, forceLogout: true },
          { status: 404 },
        );
      }

          // 🔥 KEY CHANGE: Check session validity for users
      if (role === "user") {
        // Get sessionId from token (you need to include this when generating tokens)
        const tokenSessionId = decoded.sessionId;
        
        // Check if current session matches the one in database
        if (!user.currentSessionId || user.currentSessionId !== tokenSessionId) {
          return NextResponse.json(
            { 
              success: false, 
              error: "Session expired. Logged in from another device", 
              forceLogout: true,
              sessionInvalid: true 
            },
            { status: 401 },
          );
        }

        // Optional: Check session age
        if (user.sessionCreatedAt) {
          const sessionAge = Date.now() - new Date(user.sessionCreatedAt).getTime();
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (sessionAge > maxAge) {
            // Clear expired session
            await Model.findByIdAndUpdate(decoded.userId, {
              $set: {
                currentSessionId: null,
                sessionCreatedAt: null
              }
            });
            
            return NextResponse.json(
              { 
                success: false, 
                error: "Session expired due to inactivity", 
                forceLogout: true,
                sessionExpired: true 
              },
              { status: 401 },
            );
          }
        }
      }

      // Remove sensitive fields
      const { password, ...safeUser } = user;

      // Attach user to request
      req.user = { ...safeUser, role };

      return handler(req, context);
    } catch (err) {
      console.error("Auth Middleware Error:", err);
      return NextResponse.json(
        { success: false, error: "Unauthorized request", forceLogout: true  },
        { status: 401 },
      );
    }
  };
}

// Helper function to determine header name based on role
function getHeaderName(role) {
  switch (role) {
    case "admin":
    case "agent":
      return "admin-authorization";
    case "student":
      return "student-authorization";
    case "user":
    default:
      return "authorization";
  }
}