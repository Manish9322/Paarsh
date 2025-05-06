import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Offer code is required"],
      unique: true,
      trim: true,
    },
    discountPercentage: {
      type: Number,
      required: [true, "Discount percentage is required"],
      min: 1,
      max: 100,
    },
    validFrom: {
      type: Date,
      required: [true, "Valid from date is required"],
    },
    validUntil: {
      type: Date,
      required: [true, "Valid until date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    courses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "At least one course must be selected"],
    }],
  },
  {
    timestamps: true,
  }
);

// Add index for faster queries
offerSchema.index({ code: 1 });
offerSchema.index({ validFrom: 1, validUntil: 1 });
offerSchema.index({ isActive: 1 });

const OfferModel = mongoose.models.Offer || mongoose.model("Offer", offerSchema);

export default OfferModel; 