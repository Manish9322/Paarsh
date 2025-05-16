import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../../middlewares/auth";
import _db from "../../../../../utils/db";
import mongoose from "mongoose";
import UserModel from "models/User.model";
import WithdrawalRequestModel from "models/Withdrawal.model";


_db();

function createResponse(success, message, data = null, status = 200) {
  return NextResponse.json({
    success,
    message,
    ...(data && { data }),
    toast: {
      type: success ? 'success' : 'error',
      message
    },
    timestamp: new Date().toISOString()
  }, { status });
}

export const POST = authMiddleware(async (req) => {
  try {
    const { user } = req;

    if (!user) {
      return createResponse(false, "User is not authenticated", null, 401);
    }

    const body = await req.json();
    const { amount, upiId } = body;

    // Validate input
    if (!amount || typeof amount !== 'number') {
      return createResponse(false, "Invalid amount provided", null, 400);
    }

    if (!upiId || typeof upiId !== 'string') {
      return createResponse(false, "Invalid UPI ID provided", null, 400);
    }

    if (amount <= 0) {
      return createResponse(false, "Amount must be greater than 0", null, 400);
    }

    const dbUser = await UserModel.findById(user._id);
    if (!dbUser) {
      return createResponse(false, "User not found", null, 404);
    }

    if (dbUser.walletBalance < amount) {
      return createResponse(false, "Insufficient balance", null, 400);
    }

    const withdrawal = await WithdrawalRequestModel.create({
      userId: user._id,
      amount,
      upiId,
      status: "Pending",
      requestedAt: new Date()
    });

    dbUser.walletBalance -= amount;
    await dbUser.save();

    return createResponse(
      true,
      "Withdrawal request submitted successfully!",
      { withdrawalId: withdrawal._id }
    );
  } catch (error) {
    console.error("Withdrawal request error:", error);
    return createResponse(
      false,
      "An error occurred while processing your request",
      null,
      500
    );
  }
}, ["user"]);

export const GET = authMiddleware(async (req) => {
  try {
    const { user } = req;

    if (!user) {
      return createResponse(false, "User is not authenticated", null, 401);
    }

    const withdrawals = await WithdrawalRequestModel.find({ userId: user._id })
      .sort({ requestedAt: -1 })
      .lean();

    return createResponse(
      true,
      "Withdrawal history fetched successfully",
      { withdrawals }
    );
  } catch (error) {
    console.error("Error fetching withdrawal history:", error);
    return createResponse(
      false,
      "An error occurred while fetching withdrawal history",
      null,
      500
    );
  }
}, ["user"]);


export const DELETE = authMiddleware(
  async (req) => {
    const session = await mongoose.startSession();

    try {
      const body = await req.json();
      const { id } = body;

      if (!id) {
        return NextResponse.json(
          { success: false, message: "Invalid input" },
          { status: 400 },
        );
      }

      session.startTransaction();

      const withdrawal = await WithdrawalRequestModel.findById(id).session(session);
      if (!withdrawal) {
        await session.abortTransaction();
        return NextResponse.json(
          { success: false, message: "Withdrawal request not found" },
          { status: 404 },
        );
      }

      if (withdrawal.status !== "Pending") {
        await session.abortTransaction();
        return NextResponse.json(
          { success: false, message: "Cannot delete processed request" },
          { status: 400 },
        );
      }

      const user = await UserModel.findById(withdrawal.userId).session(session);
      if (!user) {
        await session.abortTransaction();
        return NextResponse.json(
          { success: false, message: "User not found for withdrawal request" },
          { status: 404 },
        );
      }

      // Refund the amount
      user.walletBalance += withdrawal.amount;
      await user.save({ session });

      // Delete the withdrawal request
      await WithdrawalRequestModel.findByIdAndDelete(id).session(session);

      await session.commitTransaction();
      return NextResponse.json(
        { success: true, message: "Withdrawal request cancelled and amount refunded" },
        { status: 200 },
      );
    } catch (err) {
      console.error("DELETE /withdrawal error:", err);
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Server error" },
        { status: 500 },
      );
    } finally {
      session.endSession();
    }
  },
  ["user"],
);

