"use client";

import { ReactNode } from 'react';
import { SkeletonThemeProvider } from "./skeleton-theme-provider";

interface AdminSkeletonWrapperProps {
  children: ReactNode;
}

export function AdminSkeletonWrapper({ children }: AdminSkeletonWrapperProps) {
  return (
    <SkeletonThemeProvider>
      <>{children}</>
    </SkeletonThemeProvider>
  );
} 