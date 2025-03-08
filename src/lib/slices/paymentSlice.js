import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setLoading } = paymentSlice.actions;
export default paymentSlice.reducer;
