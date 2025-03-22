const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const meetingLinkSchema = new Schema(
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
  },
  { timestamps: true }
);

// Virtual property to automatically determine if meeting is upcoming or past
meetingLinkSchema.virtual("computedStatus").get(function () {
  const meetingDate = new Date(this.date);
  const today = new Date();
  
  if (this.status === "cancelled") return "cancelled";
  return meetingDate >= today ? "upcoming" : "past";
});

// Set the virtuals on toJSON
meetingLinkSchema.set("toJSON", { virtuals: true });
meetingLinkSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("MeetingLink", meetingLinkSchema); 