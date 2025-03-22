import { NextResponse } from "next/server";
import _db from "../../../../utils/db";
import ContactUs from "../../../../models/ContactUs.model";
import { authMiddleware } from "../../../../middlewares/auth";

_db();

// Create Contact

export const POST = authMiddleware(async (request) => {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 },
      );
    }

    const newContact = new ContactUs({ name, email, message });

    await newContact.save();

    return NextResponse.json({
      success: true,
      message: "Contact created successfully",
      data: newContact,
    });
  } catch (error) {
    console.error("Error while creating contact:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, true);

// Get All Contacts

export const GET = authMiddleware(async (request) => {
  try {
    const contacts = await ContactUs.find();
    return NextResponse.json({
      success: true,
      message: "Contacts fetched successfully",
      data: contacts,
    });
  } catch (error) {
    console.error("Error while fetching contacts:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, true);
