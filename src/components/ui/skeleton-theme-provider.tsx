"use client";

import { useTheme } from "next-themes";
import { SkeletonTheme } from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import { useEffect, useState } from 'react';
import { ReactNode } from 'react';

interface SkeletonThemeProviderProps {
  children: ReactNode;
}

export function SkeletonThemeProvider({ children }: SkeletonThemeProviderProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the current theme, preferring resolvedTheme for SSR
  const currentTheme = resolvedTheme || theme;
  
  // During SSR or before mounting, assume dark mode if system preference is dark
  const isDark = !mounted ? resolvedTheme === 'dark' : currentTheme === 'dark';

  const skeletonThemeProps = {
    baseColor: isDark ? '#202020' : '#ebebeb',
    highlightColor: isDark ? '#444' : '#f5f5f5',
    borderRadius: "0.5rem",
    duration: 1.5,
  };

  // Don't render skeleton theme until we know what theme we're using
  if (!mounted) {
    return (
      <SkeletonTheme {...skeletonThemeProps}>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </SkeletonTheme>
    );
  }

  return (
    <SkeletonTheme {...skeletonThemeProps}>
      <>{children}</>
    </SkeletonTheme>
  );
} 