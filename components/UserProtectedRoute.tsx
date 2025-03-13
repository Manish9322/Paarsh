"use client";

import { useEffect, useState } from "react";
import {useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function UserProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(false); // null = loading state

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/signin"); // Use replace() to prevent going backk
    }

    setAuthenticated(true);
  }, []);

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
