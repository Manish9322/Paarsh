import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    agentCode: {
      type: String,
      unique: true,
    },
    totalSale: {
      type: Number,
      default: 0,
    },
    countSale: {
      type: Number,
      default: 0,
    },
    target: {
      count: {
        type: Number,
        default: 0,
      },
      price: {
        type: Number,
        default: 0,
      },
    },
    resetToken: { type: String },
    tokenExpiry: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.models.Agent || mongoose.model("Agent", agentSchema);
