const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course", // Reference to a Course model
    required: true,
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent", // Reference to an Agent model
    required: true,
  },
  reason: {
    type: String,
    required: true,
    enum: [
      "inquiry",
      "demo",
      "referral",
      "marketing",
      "other",
    ], // Matches the options in the frontend
  },
  notes: {
    type: String,
    trim: true,
    default: "",
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "in-progress", "converted", "lost"], // Possible lead statuses
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const LeadModel = mongoose.models.Lead || mongoose.model("Lead", leadSchema);

module.exports = LeadModel;