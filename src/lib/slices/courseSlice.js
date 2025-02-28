import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  courseCategory: "",
  courseSubCategory: "",
  courseName: "",
  instructor: "",
  courseDuration: "",
  courseFees: "",
  courseType: "",
  level: "",
  availability: "",
  languages: [],
  thumbnailImage: null,
  shortDescription: "",
  longDescription: "",
  feturedCourse: false,
  keywords: "",
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    updateField: (state, action) => {
      state[action.payload.field] = action.payload.value;
    },
    setThumbnail: (state, action) => {
      state.thumbnail = action.payload;
    },
    resetForm: () => initialState,
  },
});

export const { updateField, setThumbnail, resetForm } = courseSlice.actions;
export default courseSlice.reducer;
