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
import { useFetchUserQuery, useDeleteUserMutation } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


export default function Profile() {
  const { data: userData, error, isLoading } = useFetchUserQuery(undefined);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [deleteUserConfirmOpen, setDeleteUserConfirmOpen] = useState(false);
  const [deleteFormOpen, setDeleteFormOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const user = userData?.data;

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref for detecting outside clicks

  const dispatch = useDispatch();
  const router = useRouter();

  const [deleteUser] = useDeleteUserMutation();

  // Function to get user initials
  const getUserInitials = () => {
    if (!user?.name) return "?";

    const nameParts = user.name.split(" ");
    // Get first letter of first name
    const firstInitial = nameParts[0][0];
    // Get first letter of last name if it exists
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : "";

    return (firstInitial + lastInitial).toUpperCase();
  };

  const handleLogout = () => {
    dispatch(logout()); // Redux logout
    router.push("/"); // Redirect to Sign In page
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

  const handleDeleteUser = async () => {
    if (!user?._id) return;
    
    try {
      const response = await deleteUser({ id: user._id, email: userEmail, password: userPassword }).unwrap();
      if (response.success) {
        setDeleteUserConfirmOpen(false);
        handleLogout();
      }
    } catch (error) {
      setDeleteError("Failed to delete user. Please check your credentials.");
      setDeleteUserConfirmOpen(false);
    }
  };

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

              <button
                onClick={() => setDeleteFormOpen(true)}
                className="flex w-full items-center gap-2 rounded-md bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200 mt-2"
              >
                <User size={18} />
                Delete Account
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

      {/* Delete User Form Dialog */}
      <Dialog open={deleteFormOpen} onOpenChange={setDeleteFormOpen}>
        <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Delete Account
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {deleteError && (
              <p className="mb-4 text-sm text-red-500">{deleteError}</p>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteFormOpen(false);
                setDeleteError("");
                setUserEmail("");
                setUserPassword("");
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (userEmail && userPassword) {
                  setDeleteFormOpen(false);
                  setDeleteUserConfirmOpen(true);
                } else {
                  setDeleteError("Please fill in all fields");
                }
              }}
              className="w-full sm:w-auto"
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteUserConfirmOpen} onOpenChange={setDeleteUserConfirmOpen}>
        <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Confirm Account Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <User className="mx-auto mb-4 h-12 w-12 text-red-500 dark:text-red-400" />
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteUserConfirmOpen(false);
                setDeleteError("");
                setUserEmail("");
                setUserPassword("");
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              className="w-full sm:w-auto"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}