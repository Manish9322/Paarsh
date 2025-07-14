import { NextResponse } from "next/server";
import  {BASE_URL}  from "../../../../../config/config";
import { authMiddleware } from "../../../../../middlewares/auth";
import AgentModel from "models/Agent.model";
import CourseModel from "models/Courses/Course.model";
import _db from "../../../../../utils/db";

await _db();

export const GET = authMiddleware(async (request) => {
  try {
     const user =  request.user; // Assuming user is passed in the request object
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }
    
    console.log("User in referral link generation:", user);
    const agent = await AgentModel.findOne(user._id)

    if (!agent || !agent.agentCode) {
      return NextResponse.json(
        { success: false, error: "Agent not found or agent code missing" },
        { status: 404 }
      );
    }

    const courses = await CourseModel.find();

    const courseLinks = courses.map(course => {
      const slug = course.slug || course._id;
      return {
        courseId: course._id,
        courseName: course.courseName,
        referralLink: `${BASE_URL}/course?courseId=${slug}&ref=${agent.agentCode}`,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Referral links generated successfully",
      data: courseLinks,
    });
  } catch (error) {
    console.error("Error generating all referral links:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
},["agent"]);
