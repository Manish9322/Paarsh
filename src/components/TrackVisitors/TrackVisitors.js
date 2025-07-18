"use client";

import { useEffect, useRef } from "react";
import { useTrackVisitorMutation } from "@/services/api";
import { v4 as uuidv4 } from "uuid";
import { usePathname, useRouter } from "next/navigation";

const TrackVisitor = () => {
  const [trackVisitor] = useTrackVisitorMutation();
  const pathname = usePathname();
  const router = useRouter();
  const sessionIdRef = useRef(null);
  const visitorDataRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      return;
    }

    const trackPageVisit = async () => {
      try {
        sessionIdRef.current = uuidv4();
        startTimeRef.current = Date.now();

        // Generate or retrieve deviceId
        let deviceId = localStorage.getItem("deviceId");
        if (!deviceId) {
          deviceId = uuidv4();
          localStorage.setItem("deviceId", deviceId);
        }

        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const { ip } = await ipResponse.json();
        const userId = localStorage.getItem("userId");

        visitorDataRef.current = {
          sessionId: sessionIdRef.current,
          userId: userId || null,
          deviceId, // Add deviceId
          ipAddress: ip,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          referrer: document.referrer || "Direct",
        };

        const sendDuration = () => {
          if (!startTimeRef.current) return;
          const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
          trackVisitor({ ...visitorDataRef.current, duration });
        };

        // Initial update after 1s
        const initialTimeout = setTimeout(sendDuration, 1000);

        // Periodic updates every 30s
        const intervalId = setInterval(sendDuration, 30000);

        // Handle tab close/hide
        const handleVisibilityChange = () => {
          if (document.visibilityState === "hidden") {
            sendDuration();
          }
        };

        // Handle navigation
        const handleRouteChange = () => {
          sendDuration();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        router.events?.on("routeChangeStart", handleRouteChange);

        return () => {
          clearTimeout(initialTimeout);
          clearInterval(intervalId);
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          router.events?.off("routeChangeStart", handleRouteChange);
          sendDuration(); // Final update120
          startTimeRef.current = null;
        };
      } catch (error) {
        console.error("Error tracking visitor:", error);
      }
    };

    trackPageVisit();
  }, [pathname, trackVisitor]);

  return null;
};

export default TrackVisitor;