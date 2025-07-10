// // config/config.js
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Get __dirname in ESM
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Load .env from root directory
// dotenv.config({ path: path.resolve(__dirname, '../.env') });

// const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// __dirname and __filename are available directly in CommonJS



export const ENVIRONMENT = process.env.NODE_ENV;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET_STUDENT = process.env.JWT_SECRET_STUDENT;
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

export const BREVO_API_KEY = process.env.BREVO_API_KEY;

export const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
export const VAPID_SUBJECT = process.env.VAPID_SUBJECT;
export const REDIS_URL = process.env.REDIS_URL;
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const NEXT_PUBLIC_VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
export const NOTIFICATION_SECRET = process.env.NOTIFICATION_SECRET;
export const NEXT_PUBLIC_TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;