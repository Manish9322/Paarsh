import { NextResponse } from "next/server";
import { emailQueue } from "../../../../lib/queue.js";
import { v4 as uuidv4 } from "uuid";
import { authMiddleware } from "../../../../../middlewares/auth.js";
import NotificationLog from "../../../../../models/Notification/CustomPushNotification.model.js";

export const POST = authMiddleware(async function (request) {
  try {
    const { title, message, recipientType, subject } = await request.json();

    if (!title || !message || !recipientType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const jobId = `custom-email-${uuidv4()}`;
    await emailQueue.add(
      "send_broadcast_email",
      {
        type: "send_broadcast_email",
        data: {
          message,
          type: "custom_email",
          recipientType,
          subject: subject || title,
          title,
        },
      },
      {
        jobId,
        priority: 0,
        delay: 0,
      }
    );

    // Log the email notification
    await NotificationLog.create({
      jobId,
      title,
      message,
      recipientType,
      type: "email",
      subject: subject || title,
      status: "queued",
      createdBy: request.user._id,
    });

    return NextResponse.json(
      { success: true, jobId, message: "Email notification queued successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error queuing email notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to queue email notification" },
      { status: 500 }
    );
  }
}, ["admin"]);