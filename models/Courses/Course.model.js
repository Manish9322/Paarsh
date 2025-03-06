const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    languages: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    }, // Optional base64 image
    syllabus: {
      type: String,
    }, // Optional base64 PDF/Doc
    summaryText: {
      type: String,
    },
    taglineIncludes: {
      type: String,
    },
    overviewTagline: {
      type: String,
    },
    finalText: {
      type: String,
    },
    tagline_in_the_box: {
      type: String,
    },
    tagline: {
      type: String,
      required: true,
    },
    videoLink: {
      type: String,
    }, // Optional URL
    courseIncludes: {
      type: [String],
    },
    syllabusOverview: {
      type: [String],
    },
    thoughts: {
      type: [String],
    },
    tags: {
      type: [String],
    },
    category: {
      type: String,
    },
    subcategory: {
      type: String,
    },
    availability: {
      type: Boolean,
      default: false,
    },
    certificate: {
      type: Boolean,
      default: false,
    },
    instructor: {
      type: String,
    },
    featuredCourse: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const CourseModel =
  mongoose.models.Course || mongoose.model("Course", courseSchema);

module.exports = CourseModel;
