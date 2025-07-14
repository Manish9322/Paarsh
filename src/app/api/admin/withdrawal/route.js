import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../../middlewares/auth";
import _db from "../../../../../utils/db";
import UserModel from "models/User.model";
import WithdrawalRequestModel from "models/Withdrawal.model";

await _db();

export const GET = authMiddleware(
  async (req) => {
    try {
      const withdrawals = await WithdrawalRequestModel.find()
        .sort({ requestedAt: -1 }) // newest first
        .lean();

      return NextResponse.json(
        {
          message: "Withdrawal history fetched successfully",
          data: withdrawals,
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
      return NextResponse.json({ message: "Server Error" }, { status: 500 });
    }
  },
  ["admin"],
);

export const PATCH = authMiddleware(
  async (req) => {
    try {
      const body = await req.json();
      const { id, status, paymentReferenceId } = body;

      //  Validate input
      if (!id || !["Approved", "Rejected"].includes(status)) {
        return NextResponse.json({ message: "Invalid input" }, { status: 400 });
      }

      //  Find the withdrawal request
      const withdrawal = await WithdrawalRequestModel.findById(id);
      if (!withdrawal) {
        return NextResponse.json(
          { message: "Request not found", success: false },
          { status: 404 },
        );
      }

      if (withdrawal.status !== "Pending") {
        return NextResponse.json(
          { message: "Request already processed", success: false },
          { status: 400 },
        );
      }

      // Update withdrawal
      withdrawal.status = status;
      withdrawal.paymentReferenceId = paymentReferenceId || "";
      withdrawal.processedAt = new Date();
      await withdrawal.save();

      // If rejected, refund user
      if (status === "Rejected") {
        const user = await UserModel.findById(withdrawal.userId);
        if (user) {
          user.walletBalance += withdrawal.amount;
          await user.save();
        }
      }

      return NextResponse.json(
        { message: "Withdrawal request updated", success: true },
        { status: 200 },
      );
    } catch (err) {
      console.error("PATCH /withdrawal error:", err);
      return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
  },
  ["admin"],
);
