import mongoose from "mongoose";

const JobApplicationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  desiredRole: {
    type: String,
    required: true,
  },
  portfolioUrl: {
    type: String,
    required: true,
  },
  resume: {
    type: String,
    required: true,
  },
  coverLetter: {
    type: String,
    required: true,
  },
});

export default mongoose.models.JobApplication || mongoose.model("JobApplication", JobApplicationSchema);
