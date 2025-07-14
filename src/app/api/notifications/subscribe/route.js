import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../../middlewares/auth";
import _db from "../../../../../utils/db";
import PushSubscription from "../../../../../models/Notification/PushScubscription.model";

await _db();

export const POST = authMiddleware(async (req) => {
  try {
    const { user } = req;
    const body = await req.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({
        success: false,
        error: "Invalid subscription object",
      }, { status: 400 });
    }

    await PushSubscription.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        subscription,
        isActive: true,
        userAgent: req.headers.get("user-agent") || "",
        lastUsed: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Push subscription saved successfully",
    });
  } catch (error) {
    console.error("Subscription POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ["user"]);

export const DELETE = authMiddleware(async (req) => {
  try {
    const { user } = req;

    await PushSubscription.findOneAndUpdate(
      { userId: user._id },
      { isActive: false }
    );

    return NextResponse.json({
      success: true,
      message: "Push subscription removed successfully",
    });
  } catch (error) {
    console.error("Subscription DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ["user"]);

export const GET = authMiddleware(async (req) => {
  try {
    const { user } = req;

    const subscription = await PushSubscription.findOne({
      userId: user._id,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        isSubscribed: !!subscription,
        subscription: subscription?.subscription || null,
      },
    });
  } catch (error) {
    console.error("Subscription GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ["user"]);
