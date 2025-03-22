import { NextResponse } from "next/server";

// Mock data for UI demonstration - in a real application, this would be replaced with database calls
const mockEnquiries = [
  {
    _id: "1",
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    subject: "Course Inquiry",
    message: "I'm interested in your web development course. Could you provide more details about the curriculum?",
    mobile: "+91 98765 43210",
    status: "pending",
    createdAt: "2023-06-15T10:30:00Z",
  },
  {
    _id: "2",
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    subject: "Fee Structure",
    message: "I would like to know more about the fee structure for your AI and ML courses.",
    mobile: "+91 87654 32109",
    status: "resolved",
    createdAt: "2023-06-14T15:45:00Z",
  },
  {
    _id: "3",
    id: 3,
    name: "Raj Kumar",
    email: "raj.kumar@example.com",
    subject: "Scholarship Options",
    message: "Are there any scholarship options available for your advanced programming courses?",
    mobile: "+91 76543 21098",
    status: "in-progress",
    createdAt: "2023-06-16T09:15:00Z",
  },
  {
    _id: "4",
    id: 4,
    name: "Priya Singh",
    email: "priya.singh@example.com",
    subject: "Certification Process",
    message: "I want to know about the certification process and its validity for international job applications.",
    mobile: "+91 65432 10987",
    status: "pending",
    createdAt: "2023-06-16T14:20:00Z",
  },
  {
    _id: "5",
    id: 5,
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    subject: "Corporate Training",
    message: "Could you provide information about your corporate training programs for our company?",
    mobile: "+91 54321 09876",
    status: "pending",
    createdAt: "2023-06-17T11:10:00Z",
  },
];

export async function GET() {
  try {
    // In a real application, fetch data from a database
    // For now, return mock data
    return NextResponse.json(
      { 
        success: true, 
        data: mockEnquiries,
        message: "Enquiries fetched successfully"
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch enquiries",
        error: error.message
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Enquiry ID is required",
        },
        { status: 400 }
      );
    }

    // In a real application, delete from database using the ID
    // For now, just return success

    return NextResponse.json(
      {
        success: true,
        message: "Enquiry deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete enquiry",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Enquiry ID and status are required",
        },
        { status: 400 }
      );
    }

    // In a real application, update the status in the database
    // For now, just return success

    return NextResponse.json(
      {
        success: true,
        message: "Enquiry status updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating enquiry:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update enquiry",
        error: error.message,
      },
      { status: 500 }
    );
  }
} 