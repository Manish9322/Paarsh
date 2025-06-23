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
    applicableTo: {
      type: String,
      enum: ["courses", "users", "both"],
      required: [true, "Applicable target is required"],
      default: "courses",
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Validation to ensure at least one course or user is provided based on applicableTo
offerSchema.pre("validate", function (next) {
  if (this.applicableTo === "courses" && (!this.courses || this.courses.length === 0)) {
    next(new Error("At least one course must be selected for course-based offers"));
  } else if (this.applicableTo === "users" && (!this.users || this.users.length === 0)) {
    next(new Error("At least one user must be selected for user-based offers"));
  } else if (
    this.applicableTo === "both" &&
    (!this.courses || this.courses.length === 0) &&
    (!this.users || this.users.length === 0)
  ) {
    next(new Error("At least one course or user must be selected for combined offers"));
  }
  next();
});

// Add indexes for faster queries
offerSchema.index({ code: 1 });
offerSchema.index({ validFrom: 1, validUntil: 1 });
offerSchema.index({ isActive: 1 });
offerSchema.index({ applicableTo: 1 });

const OfferModel = mongoose.models.Offer || mongoose.model("Offer", offerSchema);

export default OfferModel;