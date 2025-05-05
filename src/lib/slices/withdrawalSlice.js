import { createSlice } from "@reduxjs/toolkit";

const withdrawalSlice = createSlice({
  name: "withdrawal",
  initialState: {
    hasAccountDetails: false,
    storedUpiId: "",
    upiId: "",
    amount: "",
    isSubmitting: false,
  },
  reducers: {
    setUpiId: (state, action) => {
      state.upiId = action.payload;
    },
    saveUpiId: (state, action) => {
      state.storedUpiId = action.payload;
      state.hasAccountDetails = true;
      state.upiId = "";
    },
    setAmount: (state, action) => {
      state.amount = action.payload;
    },
    setIsSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },
    resetUpiId: (state) => {
      state.hasAccountDetails = false;
      state.storedUpiId = "";
    },
  },
});

export const { setUpiId, saveUpiId, setAmount, setIsSubmitting, resetUpiId } =
  withdrawalSlice.actions;
export default withdrawalSlice.reducer;