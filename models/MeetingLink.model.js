const mongoose = require("mongoose");

const meetingLinkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ["Google Meet", "Zoom", "Microsoft Teams", "Other"],
      default: "Zoom",
    },
    instructor: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "past", "cancelled"],
      default: "upcoming",
    },
    recording: {
      type: String,
      trim: true,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    meetingId: {
      type: String,
      trim: true,
    },
    passcode: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    hostUrl: {
      type: String,
      trim: true,
    },
    participantUrl: {
      type: String,
      trim: true,
    },
    startUrl: {
      type: String,
      trim: true,
    },
    joinUrl: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

meetingLinkSchema.virtual("computedStatus").get(function () {
  const meetingDate = new Date(this.date);
  meetingDate.setHours(
    parseInt(this.time.split(":"[0])),
    parseInt(this.time.split(":"[1] || 0))
  );
  
  const today = new Date();
  
  if (this.status === "cancelled") return "cancelled";
  
  const meetingEndTime = new Date(meetingDate);
  meetingEndTime.setMinutes(meetingEndTime.getMinutes() + (this.duration || 60));
  
  return meetingEndTime < today ? "past" : "upcoming";
});

meetingLinkSchema.pre("save", function (next) {
  if (this.status !== "cancelled") {
    const meetingDate = new Date(this.date);
    const today = new Date();
    
    if (meetingDate < today) {
      this.status = "past";
    } else {
      this.status = "upcoming";
    }
  }
  next();
});

const MeetingLinkModel = mongoose.models.MeetingLink || mongoose.model("MeetingLink", meetingLinkSchema);

export default MeetingLinkModel;
