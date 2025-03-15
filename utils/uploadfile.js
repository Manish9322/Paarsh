import path from "path";
import fs from "fs";

// Define upload directory
const UPLOAD_DIR = "/root/PaarshEdu/uploads";
const BASE_URL = "https://paarshedu.com/PaarshEdu/uploads/";

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Uploads a file to the VPS and returns its URL.
 * @param {string} base64String - Base64 encoded file data
 * @param {string} fileName - Name for the uploaded file (without extension)
 * @returns {string|null} - Public URL of the uploaded file or null on failure
 */
export async function uploadFileToVPS(base64String, fileName) {
    try {
        // Validate Base64 format
        const match = base64String.match(/^data:(.*?);base64,(.*)$/);
        if (!match) {
            console.error("Invalid Base64 format.");
            return null;
        }

        const fileType = match[1]; // Example: video/mp4, image/png
        const base64Data = match[2];

        // Get file extension
        const extension = fileType.split("/")[1];

        // Generate a unique file name
        const fullFileName = `${Date.now()}-${fileName}.${extension}`;
        const filePath = path.join(UPLOAD_DIR, fullFileName);

        // Convert Base64 to buffer and save the file
        const buffer = Buffer.from(base64Data, "base64");
        fs.writeFileSync(filePath, buffer);

        console.log(`File saved: ${filePath}`);

        // Return the public URL of the uploaded file
        return `${BASE_URL}${fullFileName}`;
    } catch (error) {
        console.error("File upload error:", error);
        return null;
    }
}

