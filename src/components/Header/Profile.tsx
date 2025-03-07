'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { X, LayoutDashboard, User, LogOut, BookOpen, GraduationCap, HelpCircle, MessageSquare, Camera } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { logout } from "../../lib/slices/authSlice";
import { useDispatch } from "react-redux";
import { useFetchUsersQuery } from "@/services/api";

interface Users {
  id: number;
  fullName: string;
  email: string;
  contact: string;
  createdAt: string;
}

export default function Profile() {

  const { data : usersData, error, isLoading } = useFetchUserQuery(undefined);

  console.log("Data",data);

  const users: Users[] = data?.data || [];
  console.log("Users data",users);
useEffect(() => {
  if (data) {
    console.log("User Data:", data);
  }
  if (error) {
    console.error("Error fetching user data:", error);
  }
}, [data, error]);


  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Access token remove kar
 
    dispatch(logout());  // Redux  logout
    router.push("/signin"); // Redirect to Sign In page
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = (e) => {
    if (!e.target.closest('#sidebar') && isOpen) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', closeSidebar);
    } else {
      document.removeEventListener('click', closeSidebar);
    }
    return () => document.removeEventListener('click', closeSidebar);
  }, [isOpen]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";  // Disable scrolling
    } else {
      document.body.style.overflow = "auto";  // Enable scrolling
    }
  }, [isModalOpen]);

  const userName = data?.name || "User Name";
  const userEmail = data?.email || "user@example.com";

  
  return (
    <div className="relative">
      {/* Profile Image Trigger */}
      <div className="cursor-pointer p-2" onClick={toggleSidebar}>
        <Image
          src="/images/profile/profile.png"
          alt="Profile Picture"
          width={40}
          height={40}
          className="rounded-full h-10 w-10 border-2 border-gray-300 shadow-md hover:scale-105 transition-transform"
        />
      </div>

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed top-0 right-0 h-screen w-72 bg-white dark:bg-gray-900 text-black dark:text-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-5 flex justify-between items-center border-b border-gray-300 dark:border-gray-700">
          <h2 className="text-lg font-bold">Profile</h2>
          <button onClick={() => setIsOpen(false)} className="text-black dark:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Profile Section */}
        <div className="relative flex flex-col items-center p-6 border-b border-gray-300 dark:border-gray-700">
          <div className="relative">
            <Image
              src="/images/profile/profile.png"
              alt="Profile Picture"
              width={80}
              height={80}
              className="rounded-full border-2 border-gray-300 shadow-md"
            />
            <button
              className="absolute bottom-0 right-0 bg-gray-200 dark:bg-gray-800 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              <Camera size={20} className="text-black dark:text-white" />
            </button>
          </div>
          <h3 className="mt-3 text-lg font-semibold">{userName}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{userEmail}</p>
        </div>

        {/* Sidebar Menu */}
        <div className="p-4 space-y-2">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
            { icon: BookOpen, label: 'My Course', href: '/my-course' },
            { icon: GraduationCap, label: 'My Certificate', href: '/my-certificate' },
            { icon: User, label: 'My Question Bank', href: '/my-question-bank' },
            { icon: MessageSquare, label: 'Message Box', href: '/message-box' },
            { icon: HelpCircle, label: 'FAQs', href: '/faqs' },
          ].map((item) => (
            <React.Fragment key={item.href}>
              <Link href={item.href} passHref>
                <div
                  className="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md"
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
          <div className="flex items-center space-x-3 cursor-pointer p-3 hover:bg-red-600 rounded-md text-red-500 hover:text-white" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </div>
        </div>

      </div>

      {/* Modal for Profile Picture Update */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-2xl w-96 md:w-[35rem] text-center">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Update Profile</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter your full name"
                className="block w-full border p-3 rounded-lg dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Enter your email"
                className="block w-full border p-3 rounded-lg dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Enter your password"
                className="block w-full border p-3 rounded-lg dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Enter your mobile number"
                className="block w-full border p-3 rounded-lg dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="file"
                className="block w-full border p-3 rounded-lg dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="bg-gray-300 dark:bg-gray-700 p-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 shadow-md transition-colors"
                onClick={() => setIsModalOpen(false)}
              >Cancel</button>
              <button
                className="bg-black dark:bg-gray-700 hover:bg-blue-700 text-white p-3 rounded-lg dark:hover:bg-blue-600 shadow-md transition-colors"
              >Update</button>
            </div>
          </div>
        </div>
      )

      }
    </div>
  );
}
