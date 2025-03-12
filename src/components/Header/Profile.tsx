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
import Image from "next/image";
import { useRouter } from "next/navigation";
import { logout } from "../../lib/slices/userAuthSlice";
import { useDispatch } from "react-redux";
import { useFetchUserQuery } from "@/services/api";

export default function Profile() {
  const { data: userData, error, isLoading } = useFetchUserQuery(undefined);

  const user = userData?.data;

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref for detecting outside clicks

  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout()); // Redux  logout
    router.push("/"); // Redirect to Sign In page
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Image Trigger */}
      <div className="cursor-pointer p-2" onClick={toggleMenu}>
        <Image
          src="/images/profile/profile.png"
          alt="Profile Picture"
          width={40}
          height={40}
          className="h-10 w-10 rounded-full border-2 border-gray-300 shadow-md transition-transform hover:scale-105"
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-gray-200 bg-white p-4 shadow-lg">
          {/* Loading State */}
          {isLoading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">Failed to load user</p>
          ) : (
            <>
              {/* User Info */}
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
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-white hover:bg-red-700"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
