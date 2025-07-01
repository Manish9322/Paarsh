import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../middlewares/auth";
import _db from "../../../../utils/db";
import NotificationModel from "../../../../models/Notification/Notification.model";

_db();

export const GET = authMiddleware(async (req) => {
  try {
    const { user } = req;

    console.log("Fetching notifications for user:", user._id);

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const type = searchParams.get("type");
    const isRead = searchParams.get("isRead");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const filter = { userId: user._id };
    if (type) filter.type = type;
    if (isRead !== null) filter.isRead = isRead === "true";

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder };

    const [notifications, totalCount, unreadCount] = await Promise.all([
      NotificationModel.find(filter).sort(sortOptions).skip(skip).limit(limit).select("-__v"),
      NotificationModel.countDocuments(filter),
      NotificationModel.countDocuments({ userId: user._id, isRead: false }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1,
        },
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ["user", "admin"]);
