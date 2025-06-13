import { createSlice } from "@reduxjs/toolkit";
import { isNull } from "lodash";

const initialState = {
  courseName: "",
  price: "",
  duration: 0,
  level: "",
  videoLink: null,
  languages: [],
  thumbnail: null,
  summaryText: "",
  tagline_in_the_box: "",
  taglineIncludes: "",
  overviewTagline: "",
  finalText: "",
  editorContent: "",
  courseIncludes: [],
  syllabus: null,
  syllabusOverview: [],
  thoughts: [],
  tags: [],
  category: "", // Added new field
  subcategory: "", // Added new field
  availability: "", // Added new field (assuming it's a boolean)
  certificate: false, // Added new field (assuming it's a boolean)
  instructor: "", // Added new field
  featuredCourse: false, // Added new field (assuming it's a boolean)
  inputValues: {},
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setSelectedCourse: (state, action) => {
      Object.assign(state, action.payload);
    },
    updateField: (state, action) => {
      state[action.payload.field] = action.payload.value;
    },
    setThumbnail: (state, action) => {
      state.thumbnail = action.payload;
    },
    addCourseInclude: (state, action) => {
      state.courseIncludes.push(action.payload);
    },
    removeCourseInclude: (state, action) => {
      state.courseIncludes = state.courseIncludes.filter(
        (_, i) => i !== action.payload,
      );
    },
    addSyllabusOverview: (state, action) => {
      state.syllabusOverview.push(action.payload);
    },
    removeSyllabusOverview: (state, action) => {
      state.syllabusOverview = state.syllabusOverview.filter(
        (_, i) => i !== action.payload,
      );
    },
    addThought: (state, action) => {
      state.thoughts.push(action.payload);
    },
    removeThought: (state, action) => {
      state.thoughts = state.thoughts.filter((_, i) => i !== action.payload);
    },
    addTag: (state, action) => {
      state.tags.push(action.payload);
    },
    removeTag: (state, action) => {
      state.tags = state.tags.filter((_, i) => i !== action.payload);
    },
    resetForm: () => initialState,

    setFile: (state, action) => {
      const { field, fileData } = action.payload;
      if (field === "thumbnail") {
        state.thumbnail = fileData; // Update thumbnail
      } else if (field === "syllabus") {
        state.syllabus = fileData; // Add syllabus file
      } else if (field === "videoLink") {
        state.videoLink = fileData; // Add videoLink file
      }
    },
    removeSyllabusFile: (state, action) => {
      state.syllabusOverview = state.syllabusOverview.filter(
        (_, i) => i !== action.payload,
      );
    },
    updateField: (state, action) => {
      state[action.payload.field] = action.payload.value;
    },
    addItem: (state, action) => {
      const { field, value } = action.payload;
      if (state[field]) {
        state[field].push(value);
      }
    },
    removeItem: (state, action) => {
      const { field, index } = action.payload;
      state[field] = state[field].filter((_, i) => i !== index);
    },
    updateInputValue: (state, action) => {
      const { field, value } = action.payload;
      state.inputValues[field] = value; // 🔹 Keep input values separate
    },
  },
});

export const {
  updateField,
  setThumbnail,
  addCourseInclude,
  removeCourseInclude,
  addSyllabusOverview,
  removeSyllabusOverview,
  addThought,
  removeThought,
  addTag,
  removeTag,
  setFile,
  resetForm,
  updateInputValue,
  setSelectedCourse,
} = courseSlice.actions;

export default courseSlice.reducer;
