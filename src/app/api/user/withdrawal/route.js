import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../../middlewares/auth";
import _db from "../../../../../utils/db";
import UserModel from "models/User.model";
import WithdrawalRequestModel from "models/Withdrawal.model";

_db();

export const POST = authMiddleware(async (req) => {
  try {
    const { user } = req;

    if (!user) {
      return NextResponse.json(
        { message: "User is not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount, upiId } = body;

    if (!amount || !upiId) {
      return NextResponse.json(
        { message: "Amount and UPI ID are required" },
        { status: 400 }
      );
    }

    const dbUser = await UserModel.findById(user._id);
    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (dbUser.walletBalance < amount) {
      return NextResponse.json(
        { message: "Insufficient balance" },
        { status: 400 }
      );
    }

    await WithdrawalRequestModel.create({
      userId: user._id,
      amount,
      upiId,
    });

    dbUser.walletBalance -= amount;
    await dbUser.save();

    return NextResponse.json(
      { message: "Withdrawal request submitted!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Withdrawal request error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}, ["user"]);

export const GET = authMiddleware(async (req) => {
  try {
    const { user } = req;

    if (!user) {
      return NextResponse.json(
        { message: "User is not authenticated" },
        { status: 401 }
      );
    }

    const withdrawals = await WithdrawalRequestModel.find({ userId: user._id })
      .sort({ requestedAt: -1 }) // newest first
      .lean();

    return NextResponse.json(
      {
        message: "Withdrawal history fetched successfully",
        data: withdrawals,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching withdrawal history:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}, ["user"]);

export const PATCH = authMiddleware(async (req) => {
  try {
    const { user } = req;

    // ✅ Optional admin check
    if (!user?.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { requestId, status, paymentReferenceId } = body;

    // ✅ Validate input
    if (!requestId || !["Approved", "Rejected"].includes(status)) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    // ✅ Find the withdrawal request
    const withdrawal = await WithdrawalRequestModel.findById(requestId);
    if (!withdrawal) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    if (withdrawal.status !== "Pending") {
      return NextResponse.json({ message: "Request already processed" }, { status: 400 });
    }

    // ✅ Update withdrawal
    withdrawal.status = status;
    withdrawal.paymentReferenceId = paymentReferenceId || "";
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    // ✅ If rejected, refund user
    if (status === "Rejected") {
      const user = await UserModel.findById(withdrawal.userId);
      if (user) {
        user.walletBalance += withdrawal.amount;
        await user.save();
      }
    }

    return NextResponse.json({ message: "Withdrawal request updated" }, { status: 200 });

  } catch (err) {
    console.error("PATCH /withdrawal error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}, ["admin"]);
