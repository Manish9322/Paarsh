const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseCategory: {
    type: String,
    required: true,
  },
  courseSubCategory: {
    type: String,
  },
  courseName: {
    type: String,
    required: true,
  },
  courseDuration: {
    type: String,
    required: true,
  },
  courseFees: {
    type: Number,
    required: true,
  },
  languages: {
    type: [String],
    required: true,
  },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    required: true,
  },
  courseType: {
    type: String,
    enum: ["Online", "Offline"],
    required: true,
  },
  instructor: {
    type: String,
    required: true,
  },
  thumbnailImage: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 200,
  },
  longDescription: {
    type: String,
    required: true,
  },
  availability: {
    type: String,
    enum: ["Available", "Unavailable", "Upcoming"],
  },
  keywords: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  feturedCourse: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const CourseModel = mongoose.models.Course || mongoose.model("Course", courseSchema);

module.exports = CourseModel;
