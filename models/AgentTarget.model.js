import mongoose from "mongoose";

const targetSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    targetCount: {
      type: Number,
      required: true,
      default: 0,
    },
    targetAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    achievedCount: {
      type: Number,
      default: 0,
    },
    achievedAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    targetType: {
      type: String,
      enum: ["monthly", "quarterly", "yearly", "custom"],
      default: "monthly",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for better query performance
targetSchema.index({ agentId: 1, status: 1 });
targetSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.models.Target || mongoose.model("Target", targetSchema);