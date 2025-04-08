// app/api/v1/uploads/video/route.js
import { NextResponse } from "next/server";
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import formidable from 'formidable'; // You'll need to install this: npm install formidable
import { Readable } from 'stream';

// Define upload directory
const UPLOAD_DIR = "/root/PaarshEdu/uploads";
const BASE_URL = "https://paarshedu.com/PaarshEdu/uploads/";

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Helper function to convert ReadableStream to Buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req) {
  try {
    // Get the file as a stream
    const contentType = req.headers.get('content-type') || '';
    
    // For handling form data properly
    if (contentType.includes('multipart/form-data')) {
      // Get data as an array buffer
      const buffer = await streamToBuffer(req.body);
      
      // Create a random filename with timestamp
      const timestamp = Date.now();
      const randomName = `video_${timestamp}_${Math.floor(Math.random() * 10000)}.mp4`;
      const filePath = path.join(UPLOAD_DIR, randomName);
      
      // Write the file
      await writeFile(filePath, buffer);
      
      // Return the URL
      const fileUrl = `${BASE_URL}${randomName}`;
      
      return NextResponse.json({
        success: true,
        message: "File uploaded successfully",
        fileUrl
      });
    }
    
    return NextResponse.json(
      { success: false, message: "Invalid content type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}

// Set config for this route
export const config = {
  api: {
    bodyParser: false,
  },
};