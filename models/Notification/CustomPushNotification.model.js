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