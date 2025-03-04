import { createSlice } from "@reduxjs/toolkit";

// Define initial state
const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  gender: "",
  state: "",
  city: "",
};

const agentSlice = createSlice({
  name: "agent",
  initialState,
  reducers: {
    updateField: (state, action) => {
      state[action.payload.field] = action.payload.value;
    },
    resetForm: () => initialState, // Reset the form to its initial state
  },
});

// Export actions
export const { updateField, resetForm } = agentSlice.actions;

// Export reducer
export default agentSlice.reducer;
