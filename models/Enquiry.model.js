import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const EnquiryModel = mongoose.models.Enquiry || mongoose.model("Enquiry", enquirySchema);
export default EnquiryModel;