"use client";

import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import sidebarConfig from "../../../config/sidebarConfig";
import agentSidebarConfig from "../../../config/agentSidebarConfig";

import { motion, AnimatePresence } from "framer-motion";
import { TbSquareToggle } from "react-icons/tb";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";

interface SidebarProps {
  userRole: "admin" | "agent";
}

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: number]: boolean }>(
    {},
  );
  const [mounted, setMounted] = useState(false);
  const [activeItem, setActiveItem] = useState<number | null>(0); // Default to first item
  const { theme } = useTheme();

  const router = useRouter();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);

    // Set sidebar state based on screen size
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleSubMenu = (index: number) => {
    setOpenSubmenus((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleItemClick = (index: number) => {
    setActiveItem(index);
  };

  if (!mounted) return null;

  const mainSidebarConfig =
    userRole === "agent" ? agentSidebarConfig : sidebarConfig;

  return (
    <div className="relative h-full w-full">
      <aside
        className={`${
          isOpen ? "w-64" : "w-16"
        } relative flex h-full flex-col overflow-hidden border-r border-gray-200 bg-white text-black shadow-lg transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white`}
      >
        {/* Sidebar Header */}
        {/* <div
          className={`flex items-center px-4 py-4 ${isOpen ? "justify-start" : "justify-center"}`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
            <span className="text-lg font-bold text-white">A</span>
          </div>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ml-3 text-lg font-bold tracking-tight"
            >
              Dashboard
            </motion.span>
          )}
        </div> */}

        {/* Sidebar Content */}
        <nav
          className={`scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 flex-grow overflow-y-auto ${isOpen ? "pt-2" : "pt-2"}`}
        >
          <div className="px-3 pb-2">
            <div
              className={`mb-3 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600 ${!isOpen && "mx-auto w-8"}`}
            ></div>
          </div>
          <ul className="space-y-1.5 px-2 pb-20">
            {mainSidebarConfig.map((item, index) => (
              <li key={index} className="w-full">
                {item.children ? (
                  <>
                    {/* Parent Menu */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleSubMenu(index)}
                      className={`flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        activeItem === index
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`flex-shrink-0 ${activeItem === index ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                        >
                          {item.icon}
                        </span>
                        {isOpen && (
                          <span className="truncate tracking-wide">
                            {item.name}
                          </span>
                        )}
                      </div>
                      {isOpen && (
                        <motion.div
                          animate={{ rotate: openSubmenus[index] ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex-shrink-0 ${activeItem === index ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                        >
                          <FaChevronDown size={12} />
                        </motion.div>
                      )}
                    </motion.button>

                    {/* Submenu with Animation */}
                    <AnimatePresence>
                      {openSubmenus[index] && isOpen && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mx-2 my-1.5 space-y-1 overflow-hidden rounded-lg bg-gray-50 pl-4 pr-2 dark:bg-gray-700/50"
                        >
                          {item.children.map((child, childIndex) => (
                            <motion.li
                              key={childIndex}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: childIndex * 0.05 }}
                            >
                              <Link
                                href={child.path}
                                className="flex w-full items-center space-x-3 rounded-md px-4 py-2.5 text-sm transition-all hover:bg-gray-200 dark:hover:bg-gray-600"
                                onClick={() => handleItemClick(index)}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500"></span>
                                <span className="truncate tracking-wide">
                                  {child.name}
                                </span>
                              </Link>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  /* Normal Menu Item */
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Link
                      href={item.path}
                      className={`flex w-full items-center ${!isOpen ? "justify-center" : "space-x-3"} rounded-lg px-4 py-2.5 text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        activeItem === index
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : ""
                      }`}
                      onClick={() => handleItemClick(index)}
                    >
                      <span
                        className={`flex-shrink-0 ${activeItem === index ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        {item.icon}
                      </span>
                      {isOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="truncate tracking-wide"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </Link>
                  </motion.div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer with Toggle Button */}
        <div
          className={`border-t border-gray-200 dark:border-gray-700 ${isOpen ? "p-4" : "py-4"}`}
        >
          {isOpen ? (
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-3 shadow-sm dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                    {userRole === "admin"
                      ? "Admin Portal v1.0"
                      : "Agent Portal v1.0"}
                  </p>
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    © {new Date().getFullYear()} All Rights Reserved
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleSidebar}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-md hover:text-blue-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-blue-400"
                  aria-label="Collapse sidebar"
                >
                  <TbSquareToggle size={18} />
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleSidebar}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-md hover:text-blue-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-blue-400"
                aria-label="Expand sidebar"
              >
                <TbSquareToggle size={18} className="rotate-180" />
              </motion.button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
