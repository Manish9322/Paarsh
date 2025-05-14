import { NextResponse } from "next/server";
import _db from "../../../../../utils/db";
import Subcategory from "../../../../../models/Categories/SubCategory.model";
import { authMiddleware } from "../../../../../middlewares/auth";

_db();

export const POST = authMiddleware(async (request) => {
  try {
    const subcategories = await request.json();

    if (!Array.isArray(subcategories) || subcategories.length === 0) {
      return NextResponse.json(
        { success: false, error: "An array of subcategories must be provided" },
        { status: 400 },
      );
    }

    // Validate each subcategory
    for (const subcategory of subcategories) {
      const { categoryName, subcategoryName, description, keywords } =
        subcategory;

      if (!categoryName || !subcategoryName || !description || !keywords) {
        return NextResponse.json(
          {
            success: false,
            error: "All required fields must be provided for each subcategory",
          },
          { status: 400 },
        );
      }
    }

    // Insert all subcategories at once
    const newSubcategories = await Subcategory.insertMany(subcategories);

    return NextResponse.json({
      success: true,
      message: "Subcategories created successfully",
      data: newSubcategories,
    });
  } catch (error) {
    console.error("Error while creating subcategories:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, ["admin"]);
