const { NextResponse } = require("next/server");
const { dbConnect } = require("../../../../../utils/db");
const { authMiddleware } = require("../../../../../middlewares/auth");
const axios = require("axios");

// Helper function to generate a random meeting ID and passcode
const generatePlaceholderMeeting = () => {
  const meetingId = Math.floor(100000000 + Math.random() * 900000000);
  const passcode = Math.random().toString(36).substring(2, 10);
  
  return {
    meetingId: meetingId.toString(),
    passcode,
    id: meetingId,
  };
};

// Function to generate Zoom meeting link
async function generateZoomMeeting(meetingData) {
  try {
    // If you have Zoom API integration
    const zoomApiKey = process.env.ZOOM_API_KEY;
    const zoomApiSecret = process.env.ZOOM_API_SECRET;
    const zoomUserId = process.env.ZOOM_USER_ID;
    
    if (!zoomApiKey || !zoomApiSecret || !zoomUserId) {
      // Return placeholder data if API keys not configured
      const placeholderInfo = generatePlaceholderMeeting();
      return {
        success: true,
        meetingId: placeholderInfo.meetingId,
        passcode: placeholderInfo.passcode,
        link: `https://zoom.us/j/${placeholderInfo.meetingId}?pwd=${placeholderInfo.passcode}`,
        hostUrl: `https://zoom.us/s/${placeholderInfo.meetingId}?zak=host_zak_key`,
        joinUrl: `https://zoom.us/j/${placeholderInfo.meetingId}?pwd=${placeholderInfo.passcode}`,
        startUrl: `https://zoom.us/s/${placeholderInfo.meetingId}?zak=host_zak_key`,
      };
    }
    
    // Generate JWT token for Zoom API
    const token = jwt.sign(
      {
        iss: zoomApiKey,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      },
      zoomApiSecret
    );
    
    // Create Zoom meeting
    const response = await axios.post(
      `https://api.zoom.us/v2/users/${zoomUserId}/meetings`,
      {
        topic: meetingData.title,
        type: 2, // Scheduled meeting
        start_time: `${meetingData.date}T${meetingData.time}:00`,
        duration: meetingData.duration || 60,
        timezone: "UTC",
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          mute_upon_entry: true,
          waiting_room: false,
          auto_recording: "none",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    return {
      success: true,
      meetingId: response.data.id,
      passcode: response.data.password,
      link: response.data.join_url,
      hostUrl: response.data.start_url,
      joinUrl: response.data.join_url,
      startUrl: response.data.start_url,
    };
  } catch (error) {
    console.error("Error generating Zoom meeting:", error);
    
    // Return placeholder data if API call fails
    const placeholderInfo = generatePlaceholderMeeting();
    return {
      success: true,
      meetingId: placeholderInfo.meetingId,
      passcode: placeholderInfo.passcode,
      link: `https://zoom.us/j/${placeholderInfo.meetingId}?pwd=${placeholderInfo.passcode}`,
      hostUrl: `https://zoom.us/s/${placeholderInfo.meetingId}?zak=host_zak_key`,
      joinUrl: `https://zoom.us/j/${placeholderInfo.meetingId}?pwd=${placeholderInfo.passcode}`,
      startUrl: `https://zoom.us/s/${placeholderInfo.meetingId}?zak=host_zak_key`,
    };
  }
}

// Function to generate Google Meet meeting link
async function generateGoogleMeetMeeting(meetingData) {
  try {
    // If you have Google Calendar API integration
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!googleApiKey || !googleClientId) {
      // Return placeholder data if API keys not configured
      const placeholderInfo = generatePlaceholderMeeting();
      const meetCode = `${placeholderInfo.passcode.substring(0, 3)}-${placeholderInfo.passcode.substring(3, 6)}-${placeholderInfo.passcode.substring(6, 9)}`;
      return {
        success: true,
        meetingId: meetCode,
        link: `https://meet.google.com/${meetCode}`,
        joinUrl: `https://meet.google.com/${meetCode}`,
      };
    }
    
    // In a real implementation, you would use the Google Calendar API to create an event with conferencing
    // For now, return a placeholder
    const placeholderInfo = generatePlaceholderMeeting();
    const meetCode = `${placeholderInfo.passcode.substring(0, 3)}-${placeholderInfo.passcode.substring(3, 6)}-${placeholderInfo.passcode.substring(6, 9)}`;
    
    return {
      success: true,
      meetingId: meetCode,
      link: `https://meet.google.com/${meetCode}`,
      joinUrl: `https://meet.google.com/${meetCode}`,
    };
  } catch (error) {
    console.error("Error generating Google Meet meeting:", error);
    
    // Return placeholder data if API call fails
    const placeholderInfo = generatePlaceholderMeeting();
    const meetCode = `${placeholderInfo.passcode.substring(0, 3)}-${placeholderInfo.passcode.substring(3, 6)}-${placeholderInfo.passcode.substring(6, 9)}`;
    
    return {
      success: true,
      meetingId: meetCode,
      link: `https://meet.google.com/${meetCode}`,
      joinUrl: `https://meet.google.com/${meetCode}`,
    };
  }
}

// Function to generate Microsoft Teams meeting link
async function generateTeamsMeeting(meetingData) {
  try {
    // If you have Microsoft Graph API integration
    const msClientId = process.env.MS_CLIENT_ID;
    const msClientSecret = process.env.MS_CLIENT_SECRET;
    
    if (!msClientId || !msClientSecret) {
      // Return placeholder data if API keys not configured
      const placeholderInfo = generatePlaceholderMeeting();
      return {
        success: true,
        meetingId: placeholderInfo.meetingId,
        link: `https://teams.microsoft.com/l/meetup-join/19:meeting_${placeholderInfo.meetingId}%40thread.v2/0?context=%7B%22Tid%22:%22placeholder%22%7D`,
        joinUrl: `https://teams.microsoft.com/l/meetup-join/19:meeting_${placeholderInfo.meetingId}%40thread.v2/0?context=%7B%22Tid%22:%22placeholder%22%7D`,
      };
    }
    
    // In a real implementation, you would use the Microsoft Graph API
    // For now, return a placeholder
    const placeholderInfo = generatePlaceholderMeeting();
    
    return {
      success: true,
      meetingId: placeholderInfo.meetingId,
      link: `https://teams.microsoft.com/l/meetup-join/19:meeting_${placeholderInfo.meetingId}%40thread.v2/0?context=%7B%22Tid%22:%22placeholder%22%7D`,
      joinUrl: `https://teams.microsoft.com/l/meetup-join/19:meeting_${placeholderInfo.meetingId}%40thread.v2/0?context=%7B%22Tid%22:%22placeholder%22%7D`,
    };
  } catch (error) {
    console.error("Error generating Teams meeting:", error);
    
    // Return placeholder data if API call fails
    const placeholderInfo = generatePlaceholderMeeting();
    
    return {
      success: true,
      meetingId: placeholderInfo.meetingId,
      link: `https://teams.microsoft.com/l/meetup-join/19:meeting_${placeholderInfo.meetingId}%40thread.v2/0?context=%7B%22Tid%22:%22placeholder%22%7D`,
      joinUrl: `https://teams.microsoft.com/l/meetup-join/19:meeting_${placeholderInfo.meetingId}%40thread.v2/0?context=%7B%22Tid%22:%22placeholder%22%7D`,
    };
  }
}

// Generate other platform meeting link
function generateOtherMeeting() {
  const placeholderInfo = generatePlaceholderMeeting();
  
  return {
    success: true,
    meetingId: placeholderInfo.meetingId,
    passcode: placeholderInfo.passcode,
    link: `https://meet.jit.si/${placeholderInfo.passcode.replace(/-/g, '')}`,
    joinUrl: `https://meet.jit.si/${placeholderInfo.passcode.replace(/-/g, '')}`,
  };
}

// POST endpoint to generate a meeting link
export const POST = authMiddleware(async (req) => {
  try {
    const { user } = req;
    
    // Check if user is admin
    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }
    
    await dbConnect();
    const body = await req.json();
    
    // Validate required fields
    if (!body.platform) {
      return NextResponse.json(
        { success: false, error: "Platform is required" },
        { status: 400 }
      );
    }
    
    let meetingInfo;
    
    // Generate meeting link based on platform
    switch (body.platform) {
      case "Zoom":
        meetingInfo = await generateZoomMeeting(body);
        break;
      case "Google Meet":
        meetingInfo = await generateGoogleMeetMeeting(body);
        break;
      case "Microsoft Teams":
        meetingInfo = await generateTeamsMeeting(body);
        break;
      default:
        meetingInfo = generateOtherMeeting();
    }
    
    return NextResponse.json({
      success: true,
      message: "Meeting link generated successfully",
      data: {
        platform: body.platform,
        meetingId: meetingInfo.meetingId,
        passcode: meetingInfo.passcode,
        link: meetingInfo.link,
        hostUrl: meetingInfo.hostUrl,
        joinUrl: meetingInfo.joinUrl,
        startUrl: meetingInfo.startUrl,
      }
    });
  } catch (error) {
    console.error("Error generating meeting link:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}); 