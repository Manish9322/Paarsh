import { NextResponse } from "next/server";
import Blog from "../../../../models/Blog.model";
import _db from "../../../../utils/db";
//import { authMiddleware } from "../../../../middlewares/auth";
// Initialize database connection
_db();

export async function POST(request) {
  try {
    const body = await request.json();

    if (
      !body.title ||
      !body.paragraph ||
      !body.image ||
      !body.author?.name ||
      !body.author?.designation ||
      !body.author?.image ||
      !Array.isArray(body.tags) ||
      body.tags.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Make sure author.authorimage is set if required by the model
    const blogData = {
      ...body,
      author: {
        ...body.author,
        authorimage: body.author.image, // Set authorimage field using the image field
      },
    };

    const newBlog = new Blog(blogData);
    await newBlog.save();

    return NextResponse.json(
      { success: true, message: "Blog added successfully", blog: newBlog },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to add blog", error: error.message },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const blogs = await Blog.find().lean().exec();
    return NextResponse.json({ success: true, blogs });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch blogs",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Blog ID is required" },
        { status: 400 },
      );
    }

    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Blog deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete blog",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Blog ID is required" },
        { status: 400 },
      );
    }

    // Make sure author.authorimage is set if required by the model
    const blogData = {
      ...updateData,
      author: {
        ...updateData.author,
        authorimage: updateData.author.image,
      },
    };

    const updatedBlog = await Blog.findByIdAndUpdate(id, blogData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBlog) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Blog updated successfully",
        blog: updatedBlog,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update blog",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
