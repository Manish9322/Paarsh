"use client";

import { useEffect, useState } from "react";
import {usePathname, useRouter } from "next/navigation";
import axios from "axios";

export default function AgentProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState<boolean | null>(false); // null = loading state

  useEffect(() => {
  
     if (pathname === "/admin/signin") {
      setAuthenticated(true);
      return;
    }

    const token = localStorage.getItem("admin_access_token");
    if (!token) {
      router.replace("/admin/signin");
      return;
    }

    const verifyRole = async () => {
      try {
        const res = await axios.get("/api/admin/loginuser", {
          headers: {
            "admin-authorization": `Bearer ${token}`,
          },
        });

        const { success, role } = res.data;

        if (success && role === "agent") {
          setAuthenticated(true);
        } else {
          router.replace("/error");
        }
      } catch (err) {
        console.error("Role verification failed:", err);
        router.replace("/admin/signin");
      }
    };
     
    verifyRole();
  }, [pathname]);

  if (!authenticated) return null;

  return <>{children}</>;
}