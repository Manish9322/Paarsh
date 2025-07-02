import { NextResponse } from "next/server";
import { notificationQueue } from "../../../../lib/queue.js";
import { v4 as uuidv4 } from "uuid";
import { authMiddleware } from "../../../../../middlewares/auth.js";

export const POST = authMiddleware(async function (request) {
  try {
    const { title, message, recipientType } = await request.json();

    if (!title || !message || !recipientType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const jobId = `custom-push-${uuidv4()}`;
    await notificationQueue.add(
      "send_broadcast_notification",
      {
        type: "send_broadcast_notification",
        data: {
          message,
          type: "custom_push",
          link: "/notifications",
          metadata: { title },
          recipientType,
        },
      },
      {
        jobId,
        priority: 0,
        delay: 0,
      }
    );

    return NextResponse.json(
      { success: true, jobId, message: "Notification queued successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error queuing notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to queue notification" },
      { status: 500 }
    );
  }
}, ["admin"]);
