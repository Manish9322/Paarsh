import { NextResponse } from "next/server";
import NotificationModel from "../../../../models/Notification.model";

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, message, recipientType, recipientIds } = body;

    const notification = await NotificationModel.create({
      title,
      message,
      recipientType,
      recipientIds: recipientIds || [],
      sentTime: new Date(),
      status: "sent",
    });

    return NextResponse.json({
      success: true,
      data: notification,
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
    const notifications = await NotificationModel.find()
      .sort({ sentTime: -1 });

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Notification ID is required",
      }, { status: 400 });
    }

    const notification = await NotificationModel.findByIdAndDelete(id);

    if (!notification) {
      return NextResponse.json({
        success: false,
        message: "Notification not found",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}