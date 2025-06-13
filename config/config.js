// config/config.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });



export const ENVIRONMENT = process.env.NODE_ENV;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET_USER = process.env.JWT_SECRET_USER;
export const JWT_SECRET_ADMIN = process.env.JWT_SECRET_ADMIN;
export const JWT_SECRET_AGENT = process.env.JWT_SECRET_AGENT;
export const JWT_ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const JWT_REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY;
export const BASE_URL = process.env.BASE_URL;
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
export const VPS_HOST = process.env.VPS_HOST;
export const VPS_PORT = process.env.VPS_PORT;
export const VPS_USERNAME = process.env.VPS_USERNAME;
export const VPS_PASSWORD = process.env.VPS_PASSWORD;
export const VPS_UPLOAD_DIR = process.env.VPS_UPLOAD_DIR;
export const VPS_BASE_URL = process.env.VPS_BASE_URL;

export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = process.env.SMTP_PORT;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const EMAIL_FROM = process.env.EMAIL_FROM;
