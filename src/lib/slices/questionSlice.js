import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedQuestion: null,
  previewQuestion: null,
};

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    setSelectedQuestion(state, action) {
      state.selectedQuestion = action.payload;
    },
    resetSelectedQuestion(state) {
      state.selectedQuestion = null;
    },
    setPreviewQuestion(state, action) {
      state.previewQuestion = action.payload;
    },
    resetPreviewQuestion(state) {
      state.previewQuestion = null;
    },
  },
});

export const { 
  setSelectedQuestion, 
  selectedQuestion,
  resetSelectedQuestion, 
  setPreviewQuestion, 
  resetPreviewQuestion 
} = questionsSlice.actions;

export default questionsSlice.reducer;