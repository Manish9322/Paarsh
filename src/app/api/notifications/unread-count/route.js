import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../../middlewares/auth";
import _db from "../../../../../utils/db";
import NotificationModel from "../../../../../models/Notification/Notification.model";

await _db();

export const GET = authMiddleware(async (req) => {
  try {
    const { user } = req;

    const unreadCount = await NotificationModel.countDocuments({
      userId: user._id,
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    console.error("Unread count error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}, ["user"]);
