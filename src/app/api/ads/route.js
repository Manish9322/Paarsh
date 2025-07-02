import { NextResponse } from "next/server";
import AdModel from "../../../../models/Ad.model";

// GET endpoint to fetch ads (supports filtering by destination)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get("destination");

    const query = destination ? { destination } : {};

    const ads = await AdModel.find(query).sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: ads,
    });
  } catch (error) {
    console.error("GET error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new ad
export async function POST(request) {
  try {
    const { name, destination, imageUrl, title, description, buttonText, buttonLink, status, startDate, endDate } = await request.json();
    
    // Validate required fields
    if (!name || !destination || !imageUrl || !title || !description || !buttonText || !buttonLink || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "All required fields must be provided",
        },
        { status: 400 }
      );
    }

    const ad = new AdModel({
      name,
      destination,
      imageUrl,
      title,
      description,
      buttonText,
      buttonLink,
      status,
      startDate,
      endDate,
    });

    await ad.save();
    console.log("Ad created successfully : ", ad);

    return NextResponse.json({
      success: true,
      data: ad,
      message: "Ad created successfully",
    });
  } catch (error) {
    console.error("POST error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to delete an ad by ID
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Ad ID is required",
        },
        { status: 400 }
      );
    }

    const ad = await AdModel.findByIdAndDelete(id);

    if (!ad) {
      return NextResponse.json(
        {
          success: false,
          message: "Ad not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ad deleted successfully",
    });
  } catch (error) {
    console.error("DELETE error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT endpoint to update an ad by ID
export async function PUT(request) {
  try {
    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Ad ID is required",
        },
        { status: 400 }
      );
    }

    const ad = await AdModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!ad) {
      return NextResponse.json(
        {
          success: false,
          message: "Ad not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ad,
      message: "Ad updated successfully",
    });
  } catch (error) {
    console.error("PUT error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}