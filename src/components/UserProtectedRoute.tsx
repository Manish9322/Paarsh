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
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          localStorage.removeItem("access_token");
          router.push("/signin");
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem("access_token");
        router.push("/signin");
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return null;
  }

  return <>{children}</>;
};

export default UserProtectedRoute; 