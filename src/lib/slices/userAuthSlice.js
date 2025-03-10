import { createSlice } from "@reduxjs/toolkit";

// Retrieve tokens from localStorage
const accessToken = localStorage.getItem("accessToken");
const refreshToken = localStorage.getItem("refreshToken");

const initialState = {
  accessToken: accessToken || null,
  refreshToken: refreshToken || null,
  user: null, // Don't store in localStorage
  isAuthenticated: !!accessToken, // Set to true if token exists
  loading: false,
  error: null,
  forms: {
    loginForm: {
      email: "",
      password: "",
      rememberMe: true,
    },
    signupForm: {
      name: "",
      email: "",
      mobile: "",
      refferalCode: "",
      password: "",
      confirmPassword: "",
      acceptTerms: true,
    },
  },
};

const userAuthSlice = createSlice({
  name: "userAuth",
  initialState,
  reducers: {
    setAuthData(state, action) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user; // User is stored only in Redux state
      state.isAuthenticated = true;
      state.error = null;

      // ✅ Store only tokens in localStorage
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
    },
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.forms = initialState.forms;

      // ✅ Remove only tokens from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
    resetForm(state, action) {
      const { formName } = action.payload;
      state.forms[formName] = initialState.forms[formName];
    },
    setSignupFormData(state, action) {
      const { field, value } = action.payload;
      state.forms.signupForm[field] = value;
    },
    setLoginFormData(state, action) {
      const { field, value } = action.payload;
      state.forms.loginForm[field] = value;
    },
  },
});

// Export actions
export const { setAuthData, logout, resetForm, setSignupFormData, setLoginFormData } =
  userAuthSlice.actions;

// Export reducer
export default userAuthSlice.reducer;
