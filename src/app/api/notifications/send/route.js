import { NextResponse } from "next/server";
import { notificationQueue } from "../../../../lib/queue.js";
import { v4 as uuidv4 } from "uuid";
import { authMiddleware } from "../../../../../middlewares/auth.js";
import NotificationLog from "../../../../../models/Notification/CustomPushNotification.model.js";

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

       // Log the notification
    await NotificationLog.create({
      jobId,
      title,
      message,
      recipientType,
      status: "queued",
      createdBy: request.user._id, // Assuming authMiddleware attaches user to request
    });


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


export const GET = authMiddleware(async function (request) {
  try {
    const logs = await NotificationLog.find()
      .sort({ sentAt: -1 })
      .lean();
    return NextResponse.json({ success: true, logs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching notification logs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notification logs" },
      { status: 500 }
    );
  }
}, ["admin"]);

// API to delete a notification log
export const DELETE = authMiddleware(async function (request) {
  try {
    const { jobId } = await request.json();
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Missing jobId" },
        { status: 400 }
      );
    }

    const deletedLog = await NotificationLog.findOneAndDelete({
      jobId,
      createdBy: request.user._id,
    });

    if (!deletedLog) {
      return NextResponse.json(
        { success: false, error: "Notification log not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Notification log deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting notification log:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete notification log" },
      { status: 500 }
    );
  }
}, ["admin"]);

// API to resend a notification
export const PUT = authMiddleware(async function (request) {
  try {
    const { jobId } = await request.json();
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Missing jobId" },
        { status: 400 }
      );
    }

    const log = await NotificationLog.findOne({ jobId, createdBy: request.user._id });
    if (!log) {
      return NextResponse.json(
        { success: false, error: "Notification log not found" },
        { status: 404 }
      );
    }

    const newJobId = `custom-push-${uuidv4()}`;
    await notificationQueue.add(
      "send_broadcast_notification",
      {
        type: "send_broadcast_notification",
        data: {
          message: log.message,
          type: "custom_push",
          link: "/notifications",
          metadata: { title: log.title },
          recipientType: log.recipientType,
        },
      },
      {
        jobId: newJobId,
        priority: 0,
        delay: 0,
      }
    );

    // Log the resent notification
    await NotificationLog.create({
      jobId: newJobId,
      title: log.title,
      message: log.message,
      recipientType: log.recipientType,
      status: "queued",
      createdBy: request.user._id,
    });

    return NextResponse.json(
      { success: true, jobId: newJobId, message: "Notification re-queued successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error re-queuing notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to re-queue notification" },
      { status: 500 }
    );
  }
}, ["admin"]);