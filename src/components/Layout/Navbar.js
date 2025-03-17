"use client"

import { Button } from "@/components/ui/button";
import { adminLogout } from "@/lib/slices/authSlice";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Moon, Sun, LogOut } from "lucide-react";

const Navbar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(adminLogout()); // Redux logout
    router.push("/");
  };

  // Hide on sign-in page
  if (pathname === "/admin/signin") return null;
  if (!mounted) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:px-6">
      <div className="mx-auto flex max-w-full items-center justify-between">
        <div className="flex items-center">
          {/* Center the title on mobile, left-aligned on desktop */}
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white md:text-2xl ml-16 md:ml-0">
            PaarshEdu
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="default"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
