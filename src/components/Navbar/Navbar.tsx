"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { FiSun, FiMoon, FiBell, FiUser, FiSearch, FiSettings, FiHelpCircle } from "react-icons/fi";
import { motion } from "framer-motion";

const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [notificationCount, setNotificationCount] = useState(3);
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-md dark:border-gray-700 dark:bg-gray-800/95 md:px-6 backdrop-blur-sm">
      {/* Logo/Brand */}
      <div className="flex items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <div className="mr-3 h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
            <span className="text-lg font-bold text-white">A</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-800 dark:text-white">
            Admin<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">Portal</span>
          </h1>
        </motion.div>
      </div>

      {/* Search Bar - Hidden on mobile */}
      <div className="hidden md:block relative mx-4 flex-1 max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-full border border-gray-300 bg-gray-50 py-1.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-1 md:space-x-3">
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? 
            <FiSun size={20} className="text-amber-400" /> : 
            <FiMoon size={20} className="text-blue-600" />
          }
        </motion.button>

        {/* Help */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="hidden rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 sm:flex"
          aria-label="Help"
        >
          <FiHelpCircle size={20} />
        </motion.button>

        {/* Notifications */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <button
            className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Notifications"
          >
            <FiBell size={20} />
          </button>
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm">
              {notificationCount}
            </span>
          )}
        </motion.div>

        {/* Settings */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="hidden rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 sm:flex"
          aria-label="Settings"
        >
          <FiSettings size={20} />
        </motion.button>

        {/* User Profile */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center ml-2"
        >
          <button
            className="flex items-center space-x-2 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 shadow-sm"
            aria-label="User profile"
          >
            <div className="h-7 w-7 overflow-hidden rounded-full bg-gradient-to-r from-blue-400 to-purple-500 shadow-sm">
              <FiUser className="h-full w-full p-1 text-white" />
            </div>
            <span className="hidden text-sm font-medium md:block">Admin</span>
          </button>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar; 