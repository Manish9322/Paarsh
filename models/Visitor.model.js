import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deviceId: {
      type: String, // Store device identifier
      default: null,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    pageUrl: {
      type: String,
      required: true,
    },  
    visitTime: {
      type: Date,
      default: Date.now,
      index: { expires: "24h" }, // TTL index to expire documents after 24 hours
    },
    duration: {
      type: Number, // Duration in seconds
      default: 0,
    },
    userAgent: {
      type: String,
    },
    referrer: {
      type: String,
    },
  },
  { timestamps: true }
);

// Ensure the TTL index is created
visitorSchema.index({ visitTime: 1 }, { expireAfterSeconds: 86400 });

const VisitorModel =
  mongoose.models.Visitor || mongoose.model("Visitor", visitorSchema);
export default VisitorModel;