import { combineReducers, configureStore } from '@reduxjs/toolkit';
import courseReducer from '../lib/slices/courseSlice';
import { paarshEduApi } from '../services/api';
import authReducer from '../lib/slices/authSlice'


// Combine all reducers
const rootReducer = combineReducers({
  course: courseReducer,
  auth: authReducer,
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


