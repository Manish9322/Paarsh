import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../../middlewares/auth";
import _db from "../../../../../utils/db";
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
});

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
});

export const PATCH = authMiddleware(async (req) => {
  try {
    const { user } = req;

    if (!user?.isAdmin) {
      return createResponse(false, "Unauthorized access", null, 403);
    }

    const body = await req.json();
    const { requestId, status, paymentReferenceId } = body;

    if (!requestId) {
      return createResponse(false, "Withdrawal request ID is required", null, 400);
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return createResponse(false, "Invalid status provided", null, 400);
    }

    const withdrawal = await WithdrawalRequestModel.findById(requestId);
    if (!withdrawal) {
      return createResponse(false, "Withdrawal request not found", null, 404);
    }

    if (withdrawal.status !== "Pending") {
      return createResponse(false, "Withdrawal request already processed", null, 400);
    }

    withdrawal.status = status;
    withdrawal.paymentReferenceId = paymentReferenceId || "";
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    if (status === "Rejected") {
      const user = await UserModel.findById(withdrawal.userId);
      if (user) {
        user.walletBalance += withdrawal.amount;
        await user.save();
      }
    }

    return createResponse(
      true,
      
      "Withdrawal request updated successfully",
      { withdrawal }
    );
  } catch (error) {
    console.error("Error updating withdrawal request:", error);
    return createResponse(
      false,
      "An error occurred while updating the withdrawal request",
      null,
      500
    );
  }
});
