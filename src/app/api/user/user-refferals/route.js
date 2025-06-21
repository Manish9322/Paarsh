import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../../middlewares/auth";
import _db from "../../../../../utils/db";
import UserModel from "models/User.model";


_db();

export const GET = authMiddleware(async (req) => {
  try {
    const { user } = req;
    
    if (!user) {
      return NextResponse.json(
        { error: "User is not authenticated" },
        { status: 401 },
      );
    }

    // Fetch users who were referred by the logged-in user
    const referredUsers = await UserModel.find({ referredBy: user._id }).select(
      "name email createdAt purchasedCourses firstPurchaseRewardGiven firstPurchaseRewardAmount",
    );

    const pendingReferrals = [];
    const completedReferrals = [];

    referredUsers.forEach((referredUser) => {
      if (referredUser.purchasedCourses.length === 0) {
        pendingReferrals.push({
          name: referredUser.name,
          email: referredUser.email,
          joinedAt: referredUser.createdAt,
        });
      } else {
        completedReferrals.push({
          name: referredUser.name,
          email: referredUser.email,
          joinedAt: referredUser.createdAt,
          coursesPurchased: referredUser.purchasedCourses.length,
          rewardGiven: referredUser.firstPurchaseRewardGiven,
          rewardAmount: referredUser.firstPurchaseRewardAmount,
        });
      }
    });

    return NextResponse.json(
      {
        totalReferrals: referredUsers.length,
        pendingCount: pendingReferrals.length,
        completedCount: completedReferrals.length,
        pendingReferrals,
        completedReferrals,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in fetching referral status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, ["user"]);
