import { combineReducers, configureStore } from "@reduxjs/toolkit";
import courseReducer from "../lib/slices/courseSlice";
import { paarshEduApi } from "../services/api";
import authReducer from "../lib/slices/authSlice";
import agentReducer from "../lib/slices/agentSlice";
import categoryReducer from "../lib/slices/categorySlice";
import subCategoryReducer from "../lib/slices/subCategorySlice";
import userAuthReducer from "../lib/slices/userAuthSlice";
import courseVideoReducer from "../lib/slices/courseVideoSlice";
import paymentReducer from "../lib/slices/paymentSlice";

// Retrieve tokens from localStorage
const accessToken = localStorage.getItem("accessToken");
const refreshToken = localStorage.getItem("refreshToken");
const adminAccessToken = localStorage.getItem("admin_access_token"); // ✅ Use "admin_access_token"
const adminRefreshToken = localStorage.getItem("admin_refresh_token");

// Combine all reducers
const rootReducer = combineReducers({
  course: courseReducer,
  auth: authReducer,
  agent: agentReducer,
  category: categoryReducer,
  subcategory: subCategoryReducer,
  userAuth: userAuthReducer,
  coursevideo: courseVideoReducer,
  payment: paymentReducer,

  [paarshEduApi.reducerPath]: paarshEduApi.reducer, // Include RTK Query API slice
});

// Configure store
export const makeStore = configureStore({
  reducer: rootReducer,

  preloadedState: {
    userAuth: {
      accessToken: accessToken || null,
      refreshToken: refreshToken || null,
      user: null, // Don't store user in localStorage
      isAuthenticated: !!accessToken, // True if token exists
    },
    auth: {
      admin_access_token: adminAccessToken || null, // ✅ Use "admin_access_token"
      admin_refresh_token: adminRefreshToken || null,
      admin: null, // Don't store admin in localStorage
      isAuthenticated: !!adminAccessToken, // True if token exists
      loading: false,
      error: null,
    },
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable for non-serializable values
    }).concat(paarshEduApi.middleware),
});

export const selectRootState = (state) => state;
