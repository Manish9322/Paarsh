"use client";

import { ThemeProvider } from "next-themes";
import { SocketProvider } from "../context/ScoketContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" enableSystem={false} defaultTheme="dark">
          <SocketProvider>
      {children}
      </SocketProvider>
    </ThemeProvider>
  );
}
