import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  title: "",
  content: "",
  image: "",
  author: {
    name: "",
    designation: "",
    image: "",
  },
  tags: [],
  publishDate: null,
};

const blogSlice = createSlice({
  name: "blogs",
  initialState,
  reducers: {
    updateField: (state, action) => {
      state[action.payload.field] = action.payload.value;
    },
    updateAuthorField: (state, action) => {
      state.author[action.payload.field] = action.payload.value;
    },
    addTag: (state, action) => {
      if (!state.tags.includes(action.payload)) {
        state.tags.push(action.payload);
      }
    },
    removeTag: (state, action) => {
      state.tags = state.tags.filter((tag) => tag !== action.payload);
    },
    setFile: (state, action) => {
      const { field, fileData } = action.payload;
      if (field === "blogImage") {
        state.image = fileData;
      } else if (field === "authorImage") {
        state.author.image = fileData;
      }
    },
    resetForm: () => initialState,
  },
});

export const {
  updateField,
  updateAuthorField,
  addTag,
  removeTag,
  setFile,
  resetForm,
} = blogSlice.actions;

export default blogSlice.reducer;
