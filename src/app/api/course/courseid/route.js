import { NextResponse } from "next/server";
import _db from "../../../../../utils/db";
import CourseModel from "../../../../../models/Courses/Course.model";
import OfferModel from "../../../../../models/Offers/Offer.model";

await _db();

export const GET = async (req) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    console.log("Course ID:", id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Fetch the course
    const course = await CourseModel.findById(id).lean().exec();

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Fetch active offers for this course
    const now = new Date();
    const activeOffers = await OfferModel.find({
      courses: id,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      isActive: true
    }).sort({ discountPercentage: -1 }); // Get highest discount first

    // Attach the best offer (highest discount) to the course if any exists
    if (activeOffers.length > 0) {
      course.activeOffer = {
        code: activeOffers[0].code,
        discountPercentage: activeOffers[0].discountPercentage,
        validUntil: activeOffers[0].validUntil
      };
    }

    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    console.error("Error fetching course:", error.message);

    if (error.name === "CastError") {
      return NextResponse.json(
        { success: false, error: "Invalid Course ID" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};
