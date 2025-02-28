import mongoose from "mongoose";

const SubcategorySchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Reference to the Category model
      required: true,
    },
    subcategory: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    keywords: {
      type: [String],
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Subcategory || mongoose.model("Subcategory", SubcategorySchema);
