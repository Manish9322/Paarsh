"use client";

import React, { useState, useEffect } from "react";
import { redirect, usePathname, useRouter } from "next/navigation";

export default function UserProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = 
      localStorage.getItem("accessToken") || 
      sessionStorage.getItem("accessToken");
    
    if (!token) {
      redirect("/signin");
    } else {
      setAuthenticated(true);
    }
  }, [path, router]);

  if (!authenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
