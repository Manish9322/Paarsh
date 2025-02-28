import { NextResponse } from "next/server";
import _db from "../../../../../utils/db";
import Category from "../../../../../models/Categories/Category.model";
import { authMiddleware } from "../../../../../middlewares/auth";

_db();

// Create Category

export const POST = authMiddleware(async (request) => {
  try {
    const { name, description, keywords } = await request.json();

    if (!name || !description || !keywords) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 },
      );
    }

    const newCategory = new Category({ name, description, keywords });

    await newCategory.save();

    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    console.error("Error while creating category:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, true);

// Get All Categories
export const GET = authMiddleware(async () => {
  try {
    const categories = await Category.find();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, true);

// Update Category

export const PUT = authMiddleware(async (request) => {
  try {
    const { id, name, description, keywords } = await request.json();

    if (!id || !name || !description || !keywords) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 },
      );
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description, keywords },
      { new: true },
    );

    if (!updatedCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error while updating category:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, true);

// Delete Category
export const DELETE = authMiddleware(async (request) => {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 },
      );
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error while deleting category:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, true);
