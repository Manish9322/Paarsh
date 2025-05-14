import { NextResponse } from "next/server";
import _db from "../../../../../utils/db";
import Subcategory from "../../../../../models/Categories/SubCategory.model";
import { authMiddleware } from "../../../../../middlewares/auth";

_db();

// Create Subcategory
export const POST = authMiddleware(async (request) => {
  try {
    const { categoryName, subcategoryName, description, keywords } =
      await request.json();

      console.log("cateedgoryNAme ", categoryName);
      console.log("subcategoryName",subcategoryName);

    if (!categoryName || !subcategoryName || !description || !keywords) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 },
      );
    }

    const newSubcategory = new Subcategory({
      categoryName,
      subcategoryName,
      description,
      keywords,
    });

    await newSubcategory.save();

    return NextResponse.json({
      success: true,
      message: "Subcategory created successfully",
      data: newSubcategory,
    });
  } catch (error) {
    console.error("Error while creating subcategory:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, ["admin"]);

// Get All Subcategories
export const GET = authMiddleware(async () => {
  try {
    const subcategories = await Subcategory.find();
    return NextResponse.json({ success: true, data: subcategories });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, ["admin" , "user"]);

// Update Subcategory

export const PUT = authMiddleware(async (request) => {
  try {
    const { formData } = await request.json();
    const id = formData?._id; // ✅ Extract ID from formData

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Subcategory ID is required" },
        { status: 400 },
      );
    }

    // Define required fields for validation
    const requiredFields = [
      "categoryName",
      "subcategoryName",
      "description",
      "keywords",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 },
        );
      }
    }

    // Update subcategory
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      id,
      { $set: formData },
      { new: true, runValidators: true },
    );

    if (!updatedSubcategory) {
      return NextResponse.json(
        { success: false, error: "Subcategory not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subcategory updated successfully",
      data: updatedSubcategory,
    });
  } catch (error) {
    console.error("Error while updating subcategory:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, ["admin"]);

// Delete Subcategory
export const DELETE = authMiddleware(async (request) => {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Subcategory ID is required" },
        { status: 400 },
      );
    }

    const deletedSubcategory = await Subcategory.findByIdAndDelete(id);

    if (!deletedSubcategory) {
      return NextResponse.json(
        { success: false, error: "Subcategory not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    console.error("Error while deleting subcategory:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, ["admin"]);
