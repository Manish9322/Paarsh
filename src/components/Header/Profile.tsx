"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  X,
  LayoutDashboard,
  User,
  LogOut,
  BookOpen,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  Camera,
} from "lucide-react";
import { PiUserCircleThin } from "react-icons/pi";
import { useRouter } from "next/navigation";
import { logout } from "../../lib/slices/userAuthSlice";
import { useDispatch } from "react-redux";
import { useFetchUserQuery, useLogoutMutation } from "@/services/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


export default function Profile() {
  const { data: userData, error, isLoading } = useFetchUserQuery(undefined);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const [_LOGOUT] = useLogoutMutation();

  const user = userData?.data;

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref for detecting outside clicks

  const dispatch = useDispatch();
  const router = useRouter();

// Function to get user initials
const getUserInitials = () => {
  if (!user?.name || typeof user.name !== 'string') return "?";

  // Split the name and filter out any empty strings
  const nameParts = user.name.trim().split(" ").filter(part => part);

  console.log("nameParts:", nameParts);

  if (nameParts.length === 0) return "?";

  const firstInitial = nameParts[0]?.[0] || "";
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || "" : "";


  return (firstInitial + lastInitial).toUpperCase();
};



 const handleLogout = async () => {
   try {
     // Call the logout mutation (likely defined in your RTK Query API slice)
     await _LOGOUT({}).unwrap();
 
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
     router.push("/");
   }
 };

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutConfirmOpen(false);
    handleLogout();
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Render profile content based on loading state
  const renderProfileContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-gray-500 shadow-md transition-transform hover:scale-105">
          <PiUserCircleThin className="h-8 w-8" />
        </div>
      );
    }
    
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-transform hover:scale-105">
        {getUserInitials()}
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Initials Trigger */}
      <div className="cursor-pointer p-2" onClick={toggleMenu}>
        {renderProfileContent()}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-gray-200 bg-white p-4 shadow-lg">
          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <PiUserCircleThin className="h-6 w-6 text-blue-600" />
              <p className="ml-2 text-gray-500">Loading user data...</p>
            </div>
          ) : error ? (
            <p className="text-center text-red-500">Failed to load user</p>
          ) : (
            <>
              {/* User sInfo */}
              <div className="mb-4 flex items-center gap-3">
                <User size={24} className="text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogoutClick}
                className="flex w-full items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-white hover:bg-red-700"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          )}
        </div>
      )}

      {/* Logout Confirmation Dialog */}
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
    </div>
  );
}