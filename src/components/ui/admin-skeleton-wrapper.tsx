"use client";

import { SkeletonThemeProvider } from "./skeleton-theme-provider";

interface AdminSkeletonWrapperProps {
  children: React.ReactNode;
}

export function AdminSkeletonWrapper({ children }: AdminSkeletonWrapperProps) {
  return <SkeletonThemeProvider>{children}</SkeletonThemeProvider>;
} 