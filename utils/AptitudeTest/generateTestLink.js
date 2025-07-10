// lib/utils.js
import { BASE_URL } from "config/config";
import { customAlphabet } from "nanoid";
import test from "node:test";

export const generateTestLink = () => {
  const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10);
  const testId = nanoid();
  return testId;
};

export const getBrowserInfo = () => {
  if (typeof window === "undefined") return null;

  const ua = navigator.userAgent;
  let browserName = "Unknown";
  let browserVersion = "Unknown";

  if (ua.includes("Chrome")) {
    browserName = "Chrome";
    browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1] || "Unknown";
  } else if (ua.includes("Firefox")) {
    browserName = "Firefox";
    browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1] || "Unknown";
  } else if (ua.includes("Safari")) {
    browserName = "Safari";
    browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1] || "Unknown";
  } else if (ua.includes("Edge")) {
    browserName = "Edge";
    browserVersion = ua.match(/Edge\/([0-9.]+)/)?.[1] || "Unknown";
  }

  return {
    name: browserName,
    version: browserVersion,
    platform: navigator.platform,
  };
};