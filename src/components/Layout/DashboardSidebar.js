"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "../../lib/slices/userAuthSlice";
import ThemeToggler from "@/components/Header/ThemeToggler";
import {
  X,
  LayoutDashboard,
  Home,
  User,
  Video,
  Gift,
  Bell,
  HelpCircle,
  LogOut,
  Menu,
} from "lucide-react";

const DashboardSidebar = ({ isSidebarOpen, setIsSidebarOpen, setSelectedCategory }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout()); // Redux logout
    router.push("/"); // Redirect to home
  };

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, onClick: () => setSelectedCategory(null) },
    { name: "Home", icon: <Home size={20} />, onClick: () => router.push("/") },
    { name: "User Profile", icon: <User size={20} />, onClick: () => setSelectedCategory("userprofile") },
    { name: "Meeting Links", icon: <Video size={20} />, link: "#" },
    { name: "Refer & Earn", icon: <Gift size={20} />, onClick: () => setSelectedCategory("referEarn") },
    { name: "Notifications", icon: <Bell size={20} />, link: "#" },
    { name: "FAQ", icon: <HelpCircle size={20} />, link: "#" },
    { name: "Log Out", icon: <LogOut size={20} />, onClick: handleLogout },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 left-4 z-50 sm:hidden bg-gray-200 p-2 rounded-md"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 bg-gray-50 dark:bg-gray-800 transition-transform shadow-lg border-r border-gray-200 dark:border-gray-700 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
      >
        <div className="relative h-full overflow-y-auto p-5">
          {/* Sidebar Header with Close Button */}
          <div className="flex justify-between items-center mb-6">
            <img src="/images/logo/PAARSHEDU_LOGO.PNG" className="h-8" alt="Logo" />
            <ThemeToggler />
            <button
              className="sm:hidden text-gray-900 dark:text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          {/* Sidebar Menu Items */}
          <ul className="space-y-4">
            {menuItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.link || "#"}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.onClick) item.onClick(); // Execute onClick function if present
                    setIsSidebarOpen(false); // Close sidebar on mobile
                  }}
                  className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.name}</span>
                </a>
                {index !== menuItems.length - 1 && <hr className="border-gray-200 dark:border-gray-700" />}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 sm:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};

export default DashboardSidebar;
