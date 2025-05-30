import { createSlice } from "@reduxjs/toolkit";

let adminAccessToken = null;
let adminRefreshToken = null;

// Retrieve tokens from localStorage
if (typeof window !== 'undefined') {
 adminAccessToken = localStorage.getItem("admin_access_token");
 adminRefreshToken = localStorage.getItem("admin_refresh_token");
}

const initialState = {
  admin_access_token: adminAccessToken || null, // ✅ Use "admin_access_token"
  admin_refresh_token: adminRefreshToken || null,
  admin: null, // Don't store admin details in localStorage
  userRole: null,
  isAuthenticated: !!adminAccessToken, // Set to true if token exists
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAdminAuth(state, action) {
      state.admin_access_token = action.payload.admin_access_token;
      state.admin_refresh_token = action.payload.admin_refresh_token;
      state.admin = action.payload.admin; // Store admin details in Redux state
      state.userRole = action.payload.userRole;
      state.isAuthenticated = true;
      state.error = null;

      // ✅ Store only tokens in localStorage
      if (typeof window !== 'undefined') {
      localStorage.setItem("admin_access_token", action.payload.admin_access_token);
      localStorage.setItem("admin_refresh_token", action.payload.admin_refresh_token);
      }
    },
    adminLogout(state) {
      state.admin_access_token = null;
      state.admin_refresh_token = null;
      state.admin = null;
      state.userRole = null;
      state.isAuthenticated = false;
      

      // ✅ Remove only tokens from localStorage
      if (typeof window !== 'undefined') {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      }
    },
  },
});

// Export actions
export const { setAdminAuth, adminLogout } = authSlice.actions;

// Export reducer
export default authSlice.reducer;
