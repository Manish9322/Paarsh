import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
  email: "",
  mobile: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    resetForm: () => initialState,
  },
});

export const { updateField, resetForm } = userSlice.actions;
export default userSlice.reducer;
