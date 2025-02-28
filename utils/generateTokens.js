import jwt from "jsonwebtoken";

import {
  JWT_ACCESS_TOKEN_EXPIRY,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_TOKEN_EXPIRY,
  JWT_SECRET_ADMIN,
  JWT_SECRET_USER,
} from "../config/config";

function generateTokens(_id, isAdmin = false) {
  // Select the correct secret key based on user type
  const secretKey = isAdmin ? JWT_SECRET_ADMIN : JWT_SECRET_USER;
  const refreshSecretKey = JWT_REFRESH_SECRET; // Same refresh secret for both

  if (!secretKey || !refreshSecretKey) {
    throw new Error("JWT secrets are not provided");
  }

  // Generate access token
  const accessToken = jwt.sign({ userId: _id }, secretKey, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRY,
  });

  // Generate refresh token
  const refreshToken = jwt.sign({ userId: _id }, refreshSecretKey, {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
}


// Function to generate a secure token for invitations
export default generateTokens;

