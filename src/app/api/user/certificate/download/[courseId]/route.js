import { NextResponse } from "next/server";
import _db from "../../../../../../../utils/db";
import UserProgress from "../../../../../../../models/Courses/UserProgress.model";
import User from "../../../../../../../models/User.model";
import { authMiddleware } from "../../../../../../../middlewares/auth";
import { generateCertificate } from "../../../../../../../utils/certificateGenerator";

_db();

export const GET = authMiddleware(async (request, { params }) => {
  try {
    const { courseId } = params;
    const { user } = request;
    const userId = user?._id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Fetch user progress for the specific course
    const userProgress = await UserProgress.findOne({ 
      userId,
      courseId,
      courseCompleted: true,
      courseProgress: { $gte: 80 }
    }).populate({
      path: 'courseId',
      select: 'courseName courseDuration courseLevel'
    });

    if (!userProgress) {
      return NextResponse.json(
        { success: false, error: "Certificate not available - course not completed" },
        { status: 404 }
      );
    }

    // Fetch user details
    const userDetails = await User.findById(userId).select('name email');

    // Prepare certificate data
    const userIdString = userId.toString();
    const certificateData = {
      studentName: userDetails.name,
      courseName: userProgress.courseId.courseName,
      completionDate: userProgress.updatedAt.toISOString().split('T')[0],
      certificateId: `CERT-${courseId.slice(-6)}-${userIdString.slice(-6)}`,
      courseLevel: userProgress.courseId.courseLevel,
      duration: userProgress.courseId.courseDuration
    };

    // Generate certificate image
    const certificateBuffer = await generateCertificate(certificateData);

    // Return certificate image
    return new NextResponse(certificateBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="certificate-${courseId}.jpg"`,
      },
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["user"]);
