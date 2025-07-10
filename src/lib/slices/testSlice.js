// store/slices/testSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTest: null,
  answers: {},
  timeLeft: 0,
  currentQuestion: 0,
  testStatus: 'not_started', // 'not_started', 'in_progress', 'paused', 'completed'
  violations: [],
  isFullscreen: false,
  tabSwitchCount: 0,
};

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    initializeTest: (state, action) => {
      const { questions, duration, sessionId } = action.payload;
      state.currentTest = {
        questions,
        duration,
        sessionId,
        startTime: Date.now(),
      };
      state.timeLeft = duration * 60; // Convert to seconds
      state.testStatus = 'in_progress';
      state.answers = {};
      state.currentQuestion = 0;
    },
    
    setAnswer: (state, action) => {
      const { questionId, answer } = action.payload;
      state.answers[questionId] = answer;
    },
    
    nextQuestion: (state) => {
      if (state.currentQuestion < state.currentTest.questions.length - 1) {
        state.currentQuestion += 1;
      }
    },
    
    previousQuestion: (state) => {
      if (state.currentQuestion > 0) {
        state.currentQuestion -= 1;
      }
    },
    
    setCurrentQuestion: (state, action) => {
      state.currentQuestion = action.payload;
    },
    
    updateTimeLeft: (state, action) => {
      state.timeLeft = action.payload;
    },
    
    addViolation: (state, action) => {
      state.violations.push({
        type: action.payload.type,
        timestamp: Date.now(),
      });
      
      if (action.payload.type === 'tab_switch') {
        state.tabSwitchCount += 1;
      }
    },
    
    setFullscreen: (state, action) => {
      state.isFullscreen = action.payload;
    },
    
    completeTest: (state) => {
      state.testStatus = 'completed';
    },
    
    resetTest: (state) => {
      return initialState;
    },
  },
});

export const {
  initializeTest,
  setAnswer,
  nextQuestion,
  previousQuestion,
  setCurrentQuestion,
  updateTimeLeft,
  addViolation,
  setFullscreen,
  completeTest,
  resetTest,
} = testSlice.actions;

export default testSlice.reducer;