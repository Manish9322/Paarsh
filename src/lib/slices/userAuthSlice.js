import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  accessToken: null,
  refreshToken:  null,
  sessionId: null,
  user: null, // Don't store in localStorage
  isAuthenticated: false, // Set to true if token exists
  loading: false,
  error: null,
  tokenRefreshing: false,
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
      state.sessionId = action.payload.sessionId;
      state.user = action.payload.user; // User is stored only in Redux state
      state.isAuthenticated = true;
      state.error = null;

      // ✅ Store only tokens in localStorage
      if (typeof window !== 'undefined') {
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
       if (action.payload.sessionId) {
          localStorage.setItem("sessionId", action.payload.sessionId);
        }
      }
    },

      updateTokens(state, action) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;

      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      }
    },
    setTokenRefreshing(state, action) {
      state.tokenRefreshing = action.payload;
    },

    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.sessionId = null;
      state.user = null;
      state.isAuthenticated = false;
       state.tokenRefreshing = false;
      state.forms = initialState.forms;

      // ✅ Remove only tokens from localStorage
      if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("sessionId");
      localStorage.removeItem("userId");
      }
    },

        setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    setLoading(state, action) {
      state.loading = action.payload;
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
      initializeAuth(state) {
      if (typeof window !== "undefined") {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        const sessionId = localStorage.getItem("sessionId");

        if (accessToken && refreshToken) {
          state.accessToken = accessToken;
          state.refreshToken = refreshToken;
          state.sessionId = sessionId;
          state.isAuthenticated = true;
        }
      }
    },
  },
});

// Export actions
export const { setAuthData, updateTokens, setTokenRefreshing, setError,
  setLoading, logout, resetForm, setSignupFormData, setLoginFormData, initializeAuth, } =
  userAuthSlice.actions;

// Export reducer
export default userAuthSlice.reducer;
