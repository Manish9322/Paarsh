import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../../middlewares/auth";
import _db from "../../../../../utils/db";
import OfferModel from "../../../../../models/Offers/Offer.model";
import notificationHelper from "../../../../../utils/notificationHelper";

await _db();

// Add Offer
export const POST = authMiddleware(
  async (request) => {
    try {
      const { user } = request;
      const {
        code,
        discountPercentage,
        validFrom,
        validUntil,
        applicableTo,
        courses,
        users,
      } = await request.json();

      // Validate required fields
      if (
        !code ||
        !discountPercentage ||
        !validFrom ||
        !validUntil ||
        !applicableTo
      ) {
        return NextResponse.json(
          { success: false, error: "All required fields must be provided" },
          { status: 400 },
        );
      }

      // Create new offer
      const newOffer = await OfferModel.create({
        code,
        discountPercentage,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        isActive: true,
        applicableTo,
        courses: courses || [],
        users: users || [],
      });

      await notificationHelper.notifyNewOffer({
        offerTitle: code,
        offerId: newOffer._id,
        createdBy: user._id, // or whoever created the offer
      });

      return NextResponse.json({
        success: true,
        message: "Offer created successfully",
        data: newOffer,
      });
    } catch (error) {
      console.error("Error creating offer:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Internal server error" },
        { status: 500 },
      );
    }
  },
  ["admin"],
);

// Get All Offers
export const GET = authMiddleware(async () => {
  try {
    const offers = await OfferModel.find({})
      .populate("courses", "id title")
      .populate("users", "id email");
    return NextResponse.json({ success: true, data: offers });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, ["admin", "user"]);

// Update Offer
export const PUT = authMiddleware(
  async (request) => {
    try {
      const { id, ...updateData } = await request.json();

      if (!id) {
        return NextResponse.json(
          { success: false, error: "Offer ID is required" },
          { status: 400 },
        );
      }

      const updatedOffer = await OfferModel.findByIdAndUpdate(
        id,
        {
          $set: {
            ...updateData,
            validFrom: new Date(updateData.validFrom),
            validUntil: new Date(updateData.validUntil),
            courses: updateData.courses || [],
            users: updateData.users || [],
          },
        },
        { new: true, runValidators: true },
      )
        .populate("courses", "id title")
        .populate("users", "id email");

      if (!updatedOffer) {
        return NextResponse.json(
          { success: false, error: "Offer not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        message: "Offer updated successfully",
        data: updatedOffer,
      });
    } catch (error) {
      console.error("Error updating offer:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 },
      );
    }
  },
  ["admin"],
);

// Delete Offer
export const DELETE = authMiddleware(
  async (request) => {
    try {
      const { id } = await request.json();

      if (!id) {
        return NextResponse.json(
          { success: false, error: "Offer ID is required" },
          { status: 400 },
        );
      }

      const deletedOffer = await OfferModel.findByIdAndDelete(id).exec();

      if (!deletedOffer) {
        return NextResponse.json(
          { success: false, error: "Offer not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        message: "Offer deleted successfully",
        data: deletedOffer,
      });
    } catch (error) {
      console.error("Error deleting offer:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 },
      );
    }
  },
  ["admin"],
);
