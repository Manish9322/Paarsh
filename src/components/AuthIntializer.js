"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initializeAuth, logout } from "../lib/slices/userAuthSlice";
import { initializeAdminAuth, logoutAdmin } from "../lib/slices/authSlice";
import { useValidateTokenQuery } from "../services/api";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
    const [initialized, setInitialized] = useState(false); // ✅ Track local init


  const { isAuthenticated, accessToken, tokenRefreshing } = useSelector(
    (state) => state.userAuth
  );
  const { isAdminAuthenticated } = useSelector((state) => state.auth);
  
  const { error, isLoading } = useValidateTokenQuery(undefined, {
    skip: !initialized || !accessToken,
  });

  useEffect(() => {
    dispatch(initializeAuth());
    dispatch(initializeAdminAuth());
     setInitialized(true);
  }, [dispatch]);

  useEffect(() => {
    if (error && (error.data?.forceLogout || error.data?.sessionInvalid || error.data?.tokenExpired)) {
      dispatch(logout());
      if (isAdminAuthenticated) dispatch(logoutAdmin());
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }, [error, isAdminAuthenticated, dispatch]);

  if (!initialized || tokenRefreshing || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return children;
};

export default AuthInitializer;