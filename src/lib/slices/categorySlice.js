import { createSlice } from "@reduxjs/toolkit";

// Define initial state
const initialState = {
  name: "",
  description: "",
  keywords: [],
  
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    updateField: (state, action) => {
      state[action.payload.field] = action.payload.value;
    },
    resetForm: () => initialState, // Reset the form to its initial state
  },
});

// Export actions
export const { updateField, resetForm } = categorySlice.actions;

// Export reducer
export default categorySlice.reducer;
