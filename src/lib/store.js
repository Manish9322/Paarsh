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
import userReducer from "../lib/slices/userSlice";
import withdrawalReducer from "../lib/slices/withdrawalSlice";
import attributionReducer from "./slices/attributionSlice";
import offersReducer from "../lib/slices/offersSlice";
import adReducer from "../lib/slices/adSlice";

// Combine all reducers
const rootReducer = combineReducers({
  course: courseReducer,
  auth: authReducer,
  agent: agentReducer,
  user: userReducer,
  category: categoryReducer,
  subcategory: subCategoryReducer,
  userAuth: userAuthReducer,
  courseVideo: courseVideoReducer,
  payment: paymentReducer,
  withdrawal: withdrawalReducer,
  attribution: attributionReducer,
  offers: offersReducer,
  ad: adReducer,

  [paarshEduApi.reducerPath]: paarshEduApi.reducer, // Include RTK Query API slice
});

// Configure store
export const store = configureStore({
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable for non-serializable values
    }).concat(paarshEduApi.middleware),
});

export const selectRootState = (state) => state;
