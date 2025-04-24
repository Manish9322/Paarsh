import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { authMiddleware } from "../../../../../middlewares/auth";

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

    // Create unique filename
    const fileExt = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;
    
    // Save to VPS server path
    const filePath = path.join(process.cwd(), "public/resources", fileName);
    await writeFile(filePath, buffer);

    // Return the URL that can be used to access the file
    const fileUrl = `/resources/${fileName}`;

    return NextResponse.json({ 
      success: true,
      fileUrl,
      message: "Resource uploaded successfully" 
    });
  } catch (error) {
    console.error("Error uploading resource:", error);
    return NextResponse.json(
      { error: "Error uploading resource" },
      { status: 500 }
    );
  }
}, true);