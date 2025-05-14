"use client";

import { Button } from "@/components/ui/button";
import { adminLogout } from "@/lib/slices/authSlice";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Moon, Sun, LogOut, Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const Navbar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  // Add after existing useState declarations
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      title: "New Course Added",
      message: "Python Programming Basics course is now available",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      title: "System Update",
      message: "Platform maintenance scheduled for tomorrow",
      time: "5 hours ago",
      unread: true,
    },
    {
      id: 3,
      title: "Welcome!",
      message: "Welcome to PaarshEdu admin dashboard",
      time: "1 day ago",
      unread: false,
    },
  ]);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(adminLogout()); // Redux logout
    router.push("/");
  };

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutConfirmOpen(false);
    handleLogout();
  };

  // Hide on sign-in page
  if (pathname === "/admin/signin") return null;
  if (!mounted) return null;

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 w-full border-b border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:px-6">
      <div className="mx-auto flex max-w-full items-center justify-between">
        <div className="flex items-center">
          {/* Center the title on mobile, left-aligned on desktop */}
          <h1 className="ml-16 text-xl font-semibold text-gray-800 dark:text-white md:ml-0 md:text-2xl">
            PaarshEdu
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          {/* Notification Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotificationOpen(true)}
            aria-label="Notifications"
            className="relative text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <Bell className="h-5 w-5" />
            {notifications.some((n) => n.unread) && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            )}
          </Button>

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
            onClick={handleLogoutClick}
            variant="default"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Confirm Logout
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <LogOut className="mx-auto mb-4 h-12 w-12 text-red-500 dark:text-red-400" />
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to log out of your account?
            </p>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setLogoutConfirmOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogoutConfirm}
              className="w-full sm:w-auto"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <Dialog open={notificationOpen} onOpenChange={setNotificationOpen}>
        <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Notifications
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </p>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 
                ${notification.unread ? "bg-gray-50 dark:bg-gray-700/30" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {notification.title}
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {notification.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {notification.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNotificationOpen(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;
