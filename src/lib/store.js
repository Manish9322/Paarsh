import { combineReducers, configureStore } from '@reduxjs/toolkit';
import courseReducer from '../lib/slices/courseSlice';
import { paarshEduApi } from '../services/api';
import authReducer from '../lib/slices/authSlice'
import agentReducer from '../lib/slices/agentSlice'
import categoryReducer from '../lib/slices/categorySlice'
import subCategoryReducer from '../lib/slices/subCategorySlice'
import userAuthReducer from '../lib/slices/userAuthSlice'

// Combine all reducers
const rootReducer = combineReducers({
  course: courseReducer,
  auth: authReducer,
  agent: agentReducer,
  category:categoryReducer,
  subcategory:subCategoryReducer,
  userAuth : userAuthReducer,
  [paarshEduApi.reducerPath]: paarshEduApi.reducer, // Include RTK Query API slice
});


// Configure store
export const makeStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable for non-serializable values
    }).concat(paarshEduApi.middleware),
});

export const selectRootState = (state) => state;

