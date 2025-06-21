import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../../middlewares/auth";
import _db from "../../../../../utils/db";
import UserModel from "models/User.model";

_db();

export const GET = authMiddleware(async (req) => {
  try {
    // Use MongoDB aggregation to find users who have referred others
    const usersWithReferrals = await UserModel.aggregate([
      {
        // Stage 1: Lookup to find users who have been referred by each user
        $lookup: {
          from: "users", // MongoDB collection name (usually lowercase plural)
          localField: "_id",
          foreignField: "referredBy",
          as: "referredUsers",
        },
      },
      {
        // Stage 2: Filter users who have at least one referral
        $match: {
          "referredUsers.0": { $exists: true }, // Only users with at least 1 referral
        },
      },
      {
        // Stage 3: Add calculated fields
        $addFields: {
          totalReferrals: { $size: "$referredUsers" },
          completedReferrals: {
            $size: {
              $filter: {
                input: "$referredUsers",
                cond: { $gt: [{ $size: "$$this.purchasedCourses" }, 0] },
              },
            },
          },
          pendingReferrals: {
            $size: {
              $filter: {
                input: "$referredUsers",
                cond: { $eq: [{ $size: "$$this.purchasedCourses" }, 0] },
              },
            },
          },
          totalReferralAmount: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$referredUsers",
                    cond: {
                      $and: [
                        { $gt: [{ $size: "$$this.purchasedCourses" }, 0] },
                        { $eq: ["$$this.firstPurchaseRewardGiven", true] },
                      ],
                    },
                  },
                },
                as: "user",
                in: "$$user.firstPurchaseRewardAmount",
              },
            },
          },
        },
      },
      {
        // Stage 4: Project only required fields
        $project: {
          name: 1,
          email: 1,
          mobile: 1,
          refferalCode: 1,
          walletBalance: 1,
          createdAt: 1,
          totalReferrals: 1,
          completedReferrals: 1,
          pendingReferrals: 1,
          totalReferralAmount: 1, // Fix: Include totalReferralAmount instead of excluding it
          referredUsers: 1, // Include all referred users (no filtering)
        },
      },
      {
        // Stage 5: Project to shape referredUsers
        $project: {
          name: 1,
          email: 1,
          mobile: 1,
          refferalCode: 1,
          walletBalance: 1,
          createdAt: 1,
          totalReferrals: 1,
          completedReferrals: 1,
          pendingReferrals: 1,
          totalReferralAmount: 1,
          referredUsers: {
            $map: {
              input: "$referredUsers",
              as: "user",
              in: {
                _id: "$$user._id",
                name: "$$user.name",
                email: "$$user.email",
                createdAt: "$$user.createdAt",
                purchasedCoursesCount: { $size: "$$user.purchasedCourses" },
                firstPurchaseRewardGiven: "$$user.firstPurchaseRewardGiven",
                firstPurchaseRewardAmount: "$$user.firstPurchaseRewardAmount",
              },
            },
          },
        },
      },
      {
        // Stage 6: Sort by total referrals (descending)
        $sort: { totalReferrals: -1 },
      },
    ]);

    // Calculate summary statistics
    const totalUsersWithReferrals = usersWithReferrals.length;
    const totalReferralsMade = usersWithReferrals.reduce(
      (sum, user) => sum + user.totalReferrals,
      0
    );
    const totalCompletedReferrals = usersWithReferrals.reduce(
      (sum, user) => sum + user.completedReferrals,
      0
    );
    const totalPendingReferrals = usersWithReferrals.reduce(
      (sum, user) => sum + user.pendingReferrals,
      0
    );
    const totalReferralAmount = usersWithReferrals.reduce(
      (sum, user) => sum + (user.totalReferralAmount || 0),
      0
    );

    return NextResponse.json(
      {
        success: true,
        summary: {
          totalUsersWithReferrals,
          totalReferralsMade,
          totalCompletedReferrals,
          totalPendingReferrals,
          totalReferralAmount,
        },
        usersWithReferrals,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in fetching users with referrals:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}, ["admin"]);