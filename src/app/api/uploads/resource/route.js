import { NextResponse } from "next/server";
import path from "path";
import { authMiddleware } from "../../../../../middlewares/auth";
import { uploadFileToVPS } from "../../../../../utils/uploadfile"; // Adjust the import path to where your uploadFileToVPS function is defined

export const POST = authMiddleware(async (req) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename (without extension)
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Get MIME type from the file
    const mimeType = file.type || "application/octet-stream"; // Fallback MIME type if none provided

    // Upload file to VPS using the provided function
    const fileUrl = await uploadFileToVPS(buffer, fileName, mimeType);

    if (!fileUrl) {
      return NextResponse.json(
        { error: "Failed to upload file to VPS" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      fileUrl,
      message: "Resource uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading resource:", error);
    return NextResponse.json(
      { error: "Error uploading resource" },
      { status: 500 }
    );
  }
}, ["admin"]);