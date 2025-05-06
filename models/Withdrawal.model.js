import mongoose from "mongoose";

const WithdrawalRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  amount: Number,
  upiId: String, // ⭐️ Add UPI ID here
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  paymentReferenceId: {
    type: String,
    default: "",
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: {
    type: Date,
  },
});

export default mongoose.models.WithdrawalRequest ||
  mongoose.model("WithdrawalRequest", WithdrawalRequestSchema);
