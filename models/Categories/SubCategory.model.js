import mongoose from "mongoose";

const SubcategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
    },
    subcategoryName: {
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
