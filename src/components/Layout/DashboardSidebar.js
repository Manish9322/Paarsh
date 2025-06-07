"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "../../lib/slices/userAuthSlice";
import ThemeToggler from "@/components/Header/ThemeToggler";
import Link from "next/link";
import {
  X,
  LayoutDashboard,
  Home,
  User,
  Video,
  Gift,
  HelpCircle,
  LogOut,
  Menu,
  Wallet,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useFetchUserQuery, useLogoutMutation } from "@/services/api";
import { toast } from "sonner";

const DashboardSidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const { data: userData, isLoading, error } = useFetchUserQuery(undefined);
  const user = userData?.data;
  console.log("User: ", user);
 
  const [_LOGOUT] = useLogoutMutation();

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

const handleLogout = async () => {
  try {
    // Call the logout mutation (likely defined in your RTK Query API slice)
    await _LOGOUT().unwrap();

    // Optionally: You could show a toast here if needed
    toast.success("Logged out successfully");

  } catch (err) {
    console.error("Logout request failed:", err);
    // Optionally: show error toast or message
    // toast.error("Logout failed. Please try again.");
  } finally {
    // Clear tokens & session from Redux and localStorage
    dispatch(logout());

    // Redirect user to signin page
    router.push("/signin");
  }
};


  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutConfirmOpen(false);
    handleLogout();
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/userdashboard",
      description: "Overview of your courses and progress"
    },
    {
      name: "Home",
      icon: <Home size={20} />,
      path: "/",
      description: "Return to main website"
    },
    {
      name: "Meeting Links",
      icon: <Video size={20} />,
      path: "/view-links",
      description: "Access your class meeting links"
    },
    {
      name: "Refer & Earn",
      icon: <Gift size={20} />,
      path: "/refer-earn",
      description: "Invite friends and earn rewards"
    },
    {
      name: "Wallet",
      icon: <Wallet size={20} />,
      path: "/user-wallet",
      description: "Invite friends and earn rewards"
    },
    {
      name: "FAQ",
      icon: <HelpCircle size={20} />,
      path: "/faq",
      description: "Get answers to common questions"
    },
    {
      name: "Log Out",
      icon: <LogOut size={20} />,
      onClick: handleLogoutClick, // Changed from handleLogout to handleLogoutClick
      description: "Sign out of your account"
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={`fixed z-40 top-4 right-4 p-2 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-all duration-300 lg:hidden flex items-center justify-center ${isSidebarOpen ? 'hidden' : ''}`}
        aria-label="Toggle Sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo/PAARSHEDU_LOGO.png"
                alt="logo"
                width={120}
                height={30}
                className="w-32 dark:hidden"
              />
              <Image
                src="/images/logo/PAARSHEDU.png"
                alt="logo"
                width={120}
                height={30}
                className="hidden w-32 dark:block"
              />
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggler />
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
                aria-label="Close Sidebar"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Sidebar content with footer */}
          <div className="flex flex-col h-full">
            <div className="flex-grow">
              {/* Existing sidebar menu items */}
              {menuItems.map((item, index) => {
                const isActive = pathname === item.path;
                return (
                  <div key={index} className="mb-1">
                    {item.path ? (
                      <Link
                        href={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`relative flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all ${isActive
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                            : "text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.name}</span>
                        {item.description && (
                          <div className="absolute left-0 top-full mt-1 w-full max-w-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs p-2 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 border border-gray-200 dark:border-gray-700">
                            {item.description}
                          </div>
                        )}
                      </Link>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          item.onClick?.();
                          setIsSidebarOpen(false);
                        }}
                        className={`relative w-full flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-300`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.name}</span>
                        {item.description && (
                          <div className="absolute left-0 top-full mt-1 w-full max-w-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs p-2 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 border border-gray-200 dark:border-gray-700">
                            {item.description}
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sidebar Footer */}
            <div className="mt-auto pt-4">
              <Link
                href="/profile"
                onClick={() => setIsSidebarOpen(false)}
                className="block"
              >
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl overflow-hidden shadow-sm border border-blue-100 dark:border-blue-800/30 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-md">
                        {user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <div className="font-medium truncate text-gray-900 dark:text-white">{user?.name || "Guest User"}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || "Not signed in"}</div>
                      </div>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}


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


    </>
  );
};

export default DashboardSidebar;