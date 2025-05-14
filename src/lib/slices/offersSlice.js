import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedOffer: null,
  previewOffer: null,
  isPreviewOpen: false,
};

const offersSlice = createSlice({
  name: "offers",
  initialState,
  reducers: {
    setSelectedOffer: (state, action) => {
      state.selectedOffer = action.payload;
    },
    resetSelectedOffer: (state) => {
      state.selectedOffer = null;
    },
    setPreviewOffer: (state, action) => {
      state.previewOffer = action.payload;
      state.isPreviewOpen = true;
    },
    closePreview: (state) => {
      state.previewOffer = null;
      state.isPreviewOpen = false;
    },
    resetState: () => initialState,
  },
});

export const { 
  setSelectedOffer, 
  resetSelectedOffer, 
  setPreviewOffer, 
  closePreview,
  resetState 
} = offersSlice.actions;

export default offersSlice.reducer; 