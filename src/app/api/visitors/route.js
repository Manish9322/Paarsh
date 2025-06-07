import { NextResponse } from "next/server";
import VisitorModel from "../../../../models/Visitor.model";

export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, userId, deviceId, ipAddress, pageUrl, duration, userAgent, referrer } = body;

    const visitor = await VisitorModel.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          userId: userId || null,
          deviceId: deviceId || null,
          ipAddress,
          pageUrl,
          duration: duration || 0,
          userAgent,
          referrer,
          visitTime: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log("Upserted visitor:", visitor);

    return NextResponse.json({
      success: true,
      data: visitor,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const visitors = await VisitorModel.find()
      .populate("userId", "name email")
      .sort({ visitTime: -1 });

    return NextResponse.json({
      success: true,
      data: visitors,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}