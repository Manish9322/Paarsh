import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  adminAccessToken: null,
  adminRefreshToken: null,
  admin: null,
  userRole: null,
  isAdminAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAdminAuthData(state, action) {
      state.adminAccessToken = action.payload.adminAccessToken;
      state.adminRefreshToken = action.payload.adminRefreshToken;
      state.admin = action.payload.admin;
      state.userRole = action.payload.userRole;
      state.isAdminAuthenticated = true;
      state.error = null;

      if (typeof window !== "undefined") {
        localStorage.setItem("admin_access_token", action.payload.adminAccessToken);
        localStorage.setItem("admin_refresh_token", action.payload.adminRefreshToken);
      }
    },
    updateAdminTokens(state, action) {
      state.adminAccessToken = action.payload.adminAccessToken;
      state.adminRefreshToken = action.payload.adminRefreshToken;

      if (typeof window !== "undefined") {
        localStorage.setItem("admin_access_token", action.payload.adminAccessToken);
        localStorage.setItem("admin_refresh_token", action.payload.adminRefreshToken);
      }
    },
    logoutAdmin(state) {
      state.adminAccessToken = null;
      state.adminRefreshToken = null;
      state.admin = null;
      state.userRole = null;
      state.isAdminAuthenticated = false;
      state.loading = false;
      state.error = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_access_token");
        localStorage.removeItem("admin_refresh_token");
      }
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    initializeAdminAuth(state) {
      if (typeof window !== "undefined") {
        const adminAccessToken = localStorage.getItem("admin_access_token");
        const adminRefreshToken = localStorage.getItem("admin_refresh_token");
        if (adminAccessToken && adminRefreshToken) {
          state.adminAccessToken = adminAccessToken;
          state.adminRefreshToken = adminRefreshToken;
          state.isAdminAuthenticated = true;
        }
      }
    },
  },
});

export const {
  setAdminAuthData,
  updateAdminTokens,
  logoutAdmin,
  setLoading,
  setError,
  initializeAdminAuth,
} = authSlice.actions;

export default authSlice.reducer;