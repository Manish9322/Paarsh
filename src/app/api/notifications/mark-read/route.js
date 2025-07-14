import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../../middlewares/auth";
import _db from "../../../../../utils/db";
import NotificationModel from "../../../../../models/Notification/Notification.model";

await _db();

export const POST = authMiddleware(async (req) => {
  try {
    const { user } = req;
    const body = await req.json();
    const { notificationIds, markAll = false } = body;

    let result;

    if (markAll) {
      result = await NotificationModel.updateMany(
        { userId: user._id, isRead: false },
        { isRead: true, readAt: new Date() }
      );
    } else if (Array.isArray(notificationIds)) {
      result = await NotificationModel.updateMany(
        {
          _id: { $in: notificationIds },
          userId: user._id,
          isRead: false,
        },
        { isRead: true, readAt: new Date() }
      );
    } else {
      return NextResponse.json({
        success: false,
        error: "Either provide `notificationIds` array or set `markAll` to true",
      }, { status: 400 });
    }

    const unreadCount = await NotificationModel.countDocuments({
      userId: user._id,
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Error marking notifications:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ["user"]);
