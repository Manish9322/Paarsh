import { NextResponse } from "next/server";
import _db from "../../../../../utils/db";
import Course from "../../../../../models/Courses/Course.model";
import UserProgress from "../../../../../models/Courses/UserProgress.model";
import User from "../../../../../models/User.model";
import { authMiddleware } from "../../../../../middlewares/auth";
import { generateCertificate } from "../../../../../utils/certificateGenerator";

_db();

// Get User Certificates (derived from Course model)
export const GET = authMiddleware(async (request) => {
  try {
    const { user } = request;
    const userId = user?._id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Fetch user progress for all completed courses
    const userProgressList = await UserProgress.find({ 
      userId,
      courseCompleted: true,
      courseProgress: { $gte: 80 }
    }).populate({
      path: 'courseId',
      select: 'courseName courseDuration courseLevel'
    });

    if (!userProgressList || userProgressList.length === 0) {
      return NextResponse.json(
        { success: false, error: "No certificates available - no completed courses found" },
        { status: 404 }
      );
    }

    // Fetch user details
    const userDetails = await User.findById(userId).select('name email');

    // Generate certificates for all completed courses
    const certificates = await Promise.all(
      userProgressList.map(async (progress) => {
        const courseId = progress.courseId._id.toString();
        const userIdString = userId.toString();
        // Prepare certificate data
        const certificateData = {
          studentName: userDetails.name,
          courseName: progress.courseId.courseName,
          completionDate: progress.updatedAt.toISOString().split('T')[0],
          certificateId: `CERT-${courseId.slice(-6)}-${userIdString.slice(-6)}`,
          courseLevel: progress.courseId.courseLevel,
          duration: progress.courseId.courseDuration
        };

        // Generate certificate image
        const certificateBuffer = await generateCertificate(certificateData);
        return {
          courseId,
          certificateId: certificateData.certificateId,
          courseName: progress.courseId.courseName,
          completionDate: certificateData.completionDate,
          imageBuffer: certificateBuffer
        };
      })
    );

    // Return all certificates data
    return NextResponse.json({
      success: true,
      data: certificates.map(cert => ({
        courseId: cert.courseId,
        certificateId: cert.certificateId,
        courseName: cert.courseName,
        completionDate: cert.completionDate,
        certificateUrl: `/api/user/certificate/download/${cert.courseId}`, // URL to download individual certificate
        imageData: `data:image/jpeg;base64,${cert.imageBuffer.toString('base64')}` // Base64 image data
      }))
    });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["user", "admin"]);