"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

interface UserProtectedRouteProps {
  children: React.ReactNode;
}

const UserProtectedRoute = ({ children }: UserProtectedRouteProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Get access token from localStorage
        const accessToken = localStorage.getItem("access_token");

        // If no access token, redirect to login
        if (!accessToken) {
          localStorage.removeItem("access_token");
          router.push("/signin");
          return;
        }

        // If we have access token, we're authenticated
        setLoading(false);
      } catch (error) {
        console.error("Auth error:", error);
        // On error, clear token and redirect to login
        localStorage.removeItem("access_token");
        router.push("/signin");
      }
    };

    checkAuth();
  }, [router]);

  // Show nothing while checking authentication
  if (loading) {
    return null; // Or return a loading spinner component
  }

  // If we reach here, we have valid access token
  return <>{children}</>;
};

export default UserProtectedRoute; 