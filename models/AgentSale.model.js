import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Target",
    },
    amount: {
      type: Number,
      required: true,
    },
    saleDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for better query performance
saleSchema.index({ agentId: 1, saleDate: -1 });
saleSchema.index({ targetId: 1 });

export default mongoose.models.Sale || mongoose.model("Sale", saleSchema);
