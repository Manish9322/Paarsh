import { NextResponse } from "next/server";
import _db from "../../../../../../utils/db";
import OfferModel from "../../../../../../models/Offers/Offer.model";
import { authMiddleware } from "../../../../../../middlewares/auth";

await _db();

// Get Active Offers for Course and/or User
export const POST = async (request) => {
  try {
    const { courseId, userId } = await request.json();

    if (!courseId && !userId) {
      return NextResponse.json(
        { success: false, error: "Course ID or User ID is required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const query = {
      $and: [
        { validFrom: { $lte: now } },
        { validUntil: { $gte: now } },
        { isActive: true },
      ],
    };

    // Build query based on provided inputs and applicableTo
    if (courseId && userId) {
      query.$and.push({
        $or: [
          { applicableTo: "courses", courses: courseId },
          { applicableTo: "users", users: userId },
          { applicableTo: "both", courses: courseId, users: userId },
        ],
      });
    } else if (courseId) {
      query.$and.push({
        $or: [
          { applicableTo: "courses", courses: courseId },
          { applicableTo: "both", courses: courseId },
        ],
      });
    } else if (userId) {
      query.$and.push({
        $or: [
          { applicableTo: "users", users: userId },
          { applicableTo: "both", users: userId },
        ],
      });
    }

    const activeOffers = await OfferModel.find(query)
      .populate("courses", "id title")
      .populate("users", "id email")
      .sort({ discountPercentage: -1 }); // Get highest discount first

    return NextResponse.json({
      success: true,
      data: activeOffers,
    });
  } catch (error) {
    console.error("Error fetching active offers:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};