import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  form: {
    name: "",
    destination: "",
    imageUrl: "",
    title: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    status: "INACTIVE",
    startDate: "",
    endDate: "",
  },
  selectedAd: null,
};

const adSlice = createSlice({
  name: "ad",
  initialState,
  reducers: {
    updateAdField: (state, action) => {
      const { field, value } = action.payload;
      state.form[field] = value;
    },
    setAdForm: (state, action) => {
      state.form = { ...state.form, ...action.payload };
    },
    resetAdForm: (state) => {
      state.form = initialState.form;
    },
    setSelectedAd: (state, action) => {
      state.selectedAd = action.payload;
    },
    clearSelectedAd: (state) => {
      state.selectedAd = null;
    },
  },
});

export const {
  updateAdField,
  setAdForm,
  resetAdForm,
  setSelectedAd,
  clearSelectedAd,
} = adSlice.actions;

export default adSlice.reducer;