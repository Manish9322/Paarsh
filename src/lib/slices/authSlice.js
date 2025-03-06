import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    isAuthenticated: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken"); // Clear token from localStorage
      sessionStorage.clear(); // Clear session storage
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, logout, setError } = authSlice.actions;
export default authSlice.reducer;
