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

export default function Profile() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout()); // Redux  logout
    router.push("/signin"); // Redirect to Sign In page
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = (e) => {
    if (!e.target.closest("#sidebar") && isOpen) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", closeSidebar);
    } else {
      document.removeEventListener("click", closeSidebar);
    }
    return () => document.removeEventListener("click", closeSidebar);
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Profile Image Trigger */}
      <div className="cursor-pointer p-2" onClick={toggleSidebar}>
        <Image
          src="/images/profile/profile.png"
          alt="Profile Picture"
          width={40}
          height={40}
          className="h-10 w-10 rounded-full border-2 border-gray-300 shadow-md transition-transform hover:scale-105"
        />
      </div>

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed right-0 top-0 h-screen w-72 transform bg-white text-black shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-900 dark:text-white ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-gray-300 p-5 dark:border-gray-700">
          <h2 className="text-lg font-bold">Profile</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-black dark:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Profile Section */}
        <div className="relative flex flex-col items-center border-b border-gray-300 p-6 dark:border-gray-700">
          <div className="relative">
            <Image
              src="/images/profile/profile.png"
              alt="Profile Picture"
              width={80}
              height={80}
              className="rounded-full border-2 border-gray-300 shadow-md"
            />
            <button
              className="absolute bottom-0 right-0 rounded-full bg-gray-200 p-2 transition-colors hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
              onClick={() => setIsModalOpen(true)}
            >
              <Camera size={20} className="text-black dark:text-white" />
            </button>
          </div>
          <h3 className="mt-3 text-lg font-semibold">John Doe</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            john.doe@example.com
          </p>
        </div>

        {/* Sidebar Menu */}
        <div className="space-y-2 p-4">
          {[
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
            { icon: BookOpen, label: "My Course", href: "/my-course" },
            {
              icon: GraduationCap,
              label: "My Certificate",
              href: "/my-certificate",
            },
            {
              icon: User,
              label: "My Question Bank",
              href: "/my-question-bank",
            },
            { icon: MessageSquare, label: "Message Box", href: "/message-box" },
            { icon: HelpCircle, label: "FAQs", href: "/faqs" },
          ].map((item) => (
            <React.Fragment key={item.href}>
              <Link href={item.href} passHref>
                <div
                  className="flex cursor-pointer items-center space-x-3 rounded-md p-3 hover:bg-gray-300 dark:hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </div>
              </Link>
              <hr className="border-gray-300 dark:border-gray-700" />
            </React.Fragment>
          ))}

          {/* Logout Button */}
          <div
            className="flex cursor-pointer items-center space-x-3 rounded-md p-3 text-red-500 hover:bg-red-600 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Modal for Profile Picture Update */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-8 text-center shadow-2xl dark:bg-gray-900 md:w-[35rem]">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Update Profile
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter your full name"
                className="block w-full rounded-lg border p-3 shadow-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              />
              <input
                type="email"
                placeholder="Enter your email"
                className="block w-full rounded-lg border p-3 shadow-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              />
              <input
                type="password"
                placeholder="Enter your password"
                className="block w-full rounded-lg border p-3 shadow-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              />
              <input
                type="tel"
                placeholder="Enter your mobile number"
                className="block w-full rounded-lg border p-3 shadow-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              />
              <input
                type="file"
                className="block w-full rounded-lg border p-3 shadow-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="rounded-lg bg-gray-300 p-3 shadow-md transition-colors hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button className="rounded-lg bg-black p-3 text-white shadow-md transition-colors hover:bg-blue-700 dark:bg-gray-700 dark:hover:bg-blue-600">
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
