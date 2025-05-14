import jwt from "jsonwebtoken";

import {
  JWT_ACCESS_TOKEN_EXPIRY,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_TOKEN_EXPIRY,
  JWT_SECRET_ADMIN,
  JWT_SECRET_USER,
  JWT_SECRET_AGENT,
} from "../config/config";


function generateTokens(_id, role = "user") {
  let secretKey;

  switch (role) {
    case "admin":
      secretKey = JWT_SECRET_ADMIN;
      break;
    case "agent":
      secretKey = JWT_SECRET_AGENT;
      break;
    default:
      secretKey = JWT_SECRET_USER;
  }

  if (!secretKey || !JWT_REFRESH_SECRET) {
    throw new Error("JWT secrets are missing");
  }

  const payload = { userId: _id, role };

  const accessToken = jwt.sign(payload, secretKey, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
}

export default generateTokens;
