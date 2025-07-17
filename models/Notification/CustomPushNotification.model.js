import mongoose from "mongoose";

const CustomPushNotificationSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  recipientType: {
    type: String,
    enum: ["all", "users", "agents"],
    required: true,
  },
    type: {
    type: String,
    enum: ["push", "email"],
    default: "push",
  },
  subject: {
    type: String, // For email notifications
    default: null,
  },
  status: {
    type: String,
    enum: ["queued", "sent", "failed"],
    default: "queued",
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
});

export default mongoose.models.CustomPushNotification || mongoose.model("CustomPushNotification", CustomPushNotificationSchema);