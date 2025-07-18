import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  previewStudent: null,
};

const studentsSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    setPreviewStudent: (state, action) => {
      state.previewStudent = action.payload;
    },
    resetPreviewStudent: (state) => {
      state.previewStudent = null;
    },
  },
});

export const { setPreviewStudent, resetPreviewStudent } = studentsSlice.actions;

export default studentsSlice.reducer; 