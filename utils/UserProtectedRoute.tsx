"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../src/lib/slices/userAuthSlice";
import { useValidateTokenQuery } from "../src/services/api";
import { selectRootState } from "@/lib/store";

export default function UserProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { isAuthenticated , accessToken, tokenRefreshing } = useSelector((state: any) => state.userAuth);
  console.log("isAuthenticated:from UserProtectedRoute", isAuthenticated);
  console.log("accessToken:from UserProtectedRoute", accessToken);
  console.log("tokenRefreshing:from UserProtectedRoute", tokenRefreshing);

  const [isValidating, setIsValidating] = useState(true);

  const { error, isLoading } = useValidateTokenQuery(undefined, {
    skip: !isAuthenticated || !accessToken,
  });

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setIsValidating(false);
      router.push(`/signin?redirect=${encodeURIComponent(pathname ?? "")}`);
    } else if (
      error &&
      (error.data?.forceLogout || error.data?.sessionInvalid || error.data?.tokenExpired)
    ) {
      dispatch(logout());
      router.push(`/signin?redirect=${encodeURIComponent(pathname ?? "")}`);
      setIsValidating(false);
    } else if (!isLoading) {
      setIsValidating(false);
    }
  }, [isAuthenticated, accessToken, error, isLoading, pathname, router, dispatch]);

  if (isValidating || tokenRefreshing || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
