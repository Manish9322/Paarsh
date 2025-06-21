import { BREVO_API_KEY } from "../../../../config/config";
import { NextResponse } from "next/server";

// POST - Add or update user in Brevo contact list
export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes("@") || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Check if contact already exists
    const checkResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
    });

    // Contact already exists
    if (checkResponse.ok) {
      return NextResponse.json(
        { success: true, message: "Email is already subscribed to the newsletter" },
        { status: 200 }
      );
    }

    // If contact doesn't exist or needs update, proceed with POST
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        listIds: [3], // Replace with your actual Brevo list ID
        updateEnabled: true,
      }),
    });

    // Handle specific Brevo API errors
    if (response.status === 400) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, error: errorData.message || "Invalid email address" },
        { status: 400 }
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Brevo API error");
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to the newsletter",
    }, { status: 201 });

  } catch (error) {
    console.error("Newsletter subscription error:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}