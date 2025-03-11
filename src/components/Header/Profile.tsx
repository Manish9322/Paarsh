"use client";

import React, { useState, useEffect } from "react";
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
import { logout } from "../../lib/slices/userAuthSlice"
import { useDispatch } from "react-redux";
import { useFetchUserQuery } from "@/services/api";


export default function Profile() {

const { data : userData, error, isLoading } = useFetchUserQuery(undefined);
console.log("Data",userData?.data);
const [isOpen, setIsOpen] = useState(false);
 
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout()); // Redux  logout
    router.push("/"); // Redirect to Sign In page
  };

 const toggleMenu = () => {
  setIsOpen(!isOpen);
};
return (
    <div className="relative">
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

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border border-gray-200 z-50">
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
