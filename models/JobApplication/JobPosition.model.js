import mongoose from "mongoose";

const JobPositionSchema = new mongoose.Schema({
  position: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  workType: {
    type: String,
    required: true,
    enum: ["Full-time", "Part-time", "Contract", "Internship"],
  },
  description: {
    type: String,
    required: true,
  },
  skillsRequired: {
    type: [String],
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  salaryRange: {
    min: { type: Number },
    max: { type: Number },
  },
  experienceLevel: {
    type: String,
    enum: ["Entry", "Mid", "Senior"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

JobPositionSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 }); // TTL index to auto-remove expired posts

export default mongoose.models.JobPosition || mongoose.model("JobPosition", JobPositionSchema);