import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  degree: string;
  university: string;
  college?: {
    name: string;
  };
  createdAt: string;
}

interface StudentsState {
  previewStudent: Student | null;
}

const initialState: StudentsState = {
  previewStudent: null,
};

const studentsSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    setPreviewStudent: (state, action: PayloadAction<Student>) => {
      state.previewStudent = action.payload;
    },
    resetPreviewStudent: (state) => {
      state.previewStudent = null;
    },
  },
});

export const { setPreviewStudent, resetPreviewStudent } = studentsSlice.actions;

export default studentsSlice.reducer; 