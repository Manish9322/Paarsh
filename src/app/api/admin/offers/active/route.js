import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../../../middlewares/auth";
import _db from "../../../../../../utils/db";
import OfferModel from "../../../../../../models/Offers/Offer.model";

_db();

// Get Active Offers for Course
export const POST = async (request) => {
  try {
    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const activeOffers = await OfferModel.find({
      courses: courseId,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    }).sort({ discountPercentage: -1 }); // Get highest discount first

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