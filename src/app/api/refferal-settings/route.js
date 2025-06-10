import { NextResponse } from "next/server";
import ReferralSettings from "models/RefferalSetting.model";
import _db from "../../../../utils/db";
import { authMiddleware } from "../../../../middlewares/auth";

_db();

// GET Referral Settings
export const GET = async () => {
  try {
    const settings = await ReferralSettings.findOne().sort({ updatedAt: -1 });
    if (!settings) {
      return NextResponse.json(
        { success: false, error: "Referral settings not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching referral settings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
};

// PUT Referral Settings (Admin only)
export const PUT = authMiddleware(async (request) => {
  try {
    const {
      discountPercentage,
      cashbackAmount,
      maxReferrals,
      rewardCreditDays,
    } = await request.json();

    // Validate input
    if (
      typeof discountPercentage !== "number" ||
      typeof cashbackAmount !== "number" ||
      typeof maxReferrals !== "number" ||
      typeof rewardCreditDays !== "number"
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid input types" },
        { status: 400 }
      );
    }

    const updatedSettings = await ReferralSettings.findOneAndUpdate(
      {},
      {
        discountPercentage,
        cashbackAmount,
        maxReferrals,
        rewardCreditDays,
        updatedAt: Date.now(),
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Referral settings updated successfully",
      data: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating referral settings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}, ["admin"]);
