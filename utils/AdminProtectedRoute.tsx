"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading state

  useEffect(() => {
    const token = localStorage.getItem("admin_access_token");
    console.log("Retrieved Token:", token);

    if (!token) {
      router.replace("/admin/signin"); // Use replace() to prevent going back
      return;
    }

    setIsAuthenticated(true);
  }, []);



  return <>{children}</>;
}
