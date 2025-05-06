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
      min: [1, "Minimum discount is 1%"],
      max: [100, "Maximum discount is 100%"],
    },
    validFrom: {
      type: Date,
      required: [true, "Valid from date is required"],
    },
    validUntil: {
      type: Date,
      required: [true, "Valid until date is required"],
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

// Add virtual for checking if offer is active
offerSchema.virtual("isActive").get(function() {
  const now = new Date();
  return now >= this.validFrom && now <= this.validUntil;
});

// Ensure virtuals are included in JSON
offerSchema.set("toJSON", { virtuals: true });
offerSchema.set("toObject", { virtuals: true });

// Create model
const Offer = mongoose.models.Offer || mongoose.model("Offer", offerSchema);

export default Offer; 