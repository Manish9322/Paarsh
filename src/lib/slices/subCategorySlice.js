import { createSlice } from "@reduxjs/toolkit";

// Define initial state
const initialState = {
  categoryName: "",
  subcategoryName:"",
  description: "",
  keywords: [],
  
};

const subCategorySlice = createSlice({
  name: "subcategory",
  initialState,
  reducers: {
    updateField: (state, action) => {
      state[action.payload.field] = action.payload.value;
    },
    resetForm: () => initialState, // Reset the form to its initial state
  },
});

// Export actions
export const { updateField, resetForm } = subCategorySlice.actions;

// Export reducer
export default subCategorySlice.reducer;
