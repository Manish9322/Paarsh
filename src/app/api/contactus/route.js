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
      data: {
        success: true,
        newContact,
       },
    });
  } catch (error) {
    console.error("Error while creating contact:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, ["user"]);

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
  }, ["admin"]);

// Update Contact Status

  export const PATCH   = authMiddleware(async (request) => {
  try {
    const { id, status } = await request.json();

    const updatedContact = await ContactUs.findByIdAndUpdate(id, { status }, { new: true });

    return NextResponse.json({
      success: true,
      message: "Contact status updated successfully",
    });
  } catch (error) {
    console.error("Error while updating contact status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}, ["admin"]);

// Delete Contact

export const DELETE = authMiddleware(async (request) => {
  try {
    const { id } = await request.json();

    await ContactUs.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Error while deleting contact:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );    
  }
}, ["admin"]);