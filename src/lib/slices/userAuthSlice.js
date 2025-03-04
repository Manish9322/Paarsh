import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
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
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.forms = initialState.forms;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.clear();
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
      // ✅ NEW REDUCER ADDED
      const { field, value } = action.payload;
      state.forms.loginForm[field] = value;
    },
  },
});

// Export actions
export const { setAuthData, logout, resetForm, setSignupFormData , setLoginFormData } =
  userAuthSlice.actions;

// Export reducer
export default userAuthSlice.reducer;
