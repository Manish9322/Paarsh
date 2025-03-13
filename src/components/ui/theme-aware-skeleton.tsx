"use client";

import { useTheme } from "next-themes";
import Skeleton from "react-loading-skeleton";
import { useEffect, useState } from "react";

interface ThemeAwareSkeletonProps {
  className?: string;
  count?: number;
  height?: number | string;
  width?: number | string;
  borderRadius?: string;
  circle?: boolean;
  style?: React.CSSProperties;
}

export function ThemeAwareSkeleton({
  className,
  count = 1,
  height,
  width,
  borderRadius,
  circle,
  style,
}: ThemeAwareSkeletonProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = resolvedTheme || theme;
  const isDark = !mounted ? resolvedTheme === 'dark' : currentTheme === 'dark';

  return (
    <Skeleton
      className={className}
      count={count}
      height={height}
      width={width}
      borderRadius={borderRadius}
      circle={circle}
      baseColor={isDark ? '#202020' : '#ebebeb'}
      highlightColor={isDark ? '#444' : '#f5f5f5'}
      style={{
        ...style,
        visibility: mounted ? 'visible' : 'hidden'
      }}
    />
  );
} 