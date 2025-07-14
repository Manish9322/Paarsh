import { NextResponse } from "next/server";
import Blog from "../../../../../models/Blog.model";
import _db from "../../../../../utils/db";

await _db();

export async function GET(req, { params }) {
  try {
    const { blogId } = await params;

    const blog = await Blog.findById(blogId).lean().exec();
    return NextResponse.json({ success: true, blog });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch blog",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
