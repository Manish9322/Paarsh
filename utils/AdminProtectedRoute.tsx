"use client";

import { useEffect, useState } from "react";
import {useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AdminProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(false); // null = loading state

  useEffect(() => {
    const token = localStorage.getItem("admin_access_token");

    if (!token) {
      router.replace("/admin/signin"); // Use replace() to prevent going backk
    }

    setAuthenticated(true);
  }, []);

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
