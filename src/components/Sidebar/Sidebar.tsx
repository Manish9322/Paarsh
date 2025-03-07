"use client";

import React, { useState } from "react";
import { FaBars, FaChevronDown } from "react-icons/fa";
import sidebarConfig from "../../../config/sidebarconfig";
import { motion, AnimatePresence } from "framer-motion";
import { TbSquareToggle } from "react-icons/tb";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: number]: boolean }>(
    {},
  );

  const router = useRouter();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleSubMenu = (index: number) => {
    setOpenSubmenus((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="fixed flex h-screen">
      <aside
        className={`${
          isOpen ? "w-64" : "w-20"
        } relative flex h-full flex-col overflow-hidden border-r border-gray-300 bg-white text-black shadow-lg transition-all duration-300`}
      >
        {/* Toggle Button - Moves Above Dashboard Icon When Closed */}
        <button
          onClick={toggleSidebar}
          className={`absolute bg-transparent p-2 text-black  transition-all 
          ${isOpen ? "right-[6px] top-2" : "left-[40%] top-6 -translate-x-1/2 transform"}`}
        >
          <TbSquareToggle size={20} />
        </button>

        {/* Sidebar Content */}
        <nav className="mt-6 flex-grow overflow-y-auto">
          <ul className="space-y-2">
            {sidebarConfig.map((item, index) => (
              <li
                key={index}
                className={`w-full ${!isOpen && index === 0 ? "mt-12" : ""}`}
              >
                {item.children ? (
                  <>
                    {/* Parent Menu */}
                    <button
                      onClick={() => toggleSubMenu(index)}
                      className="flex w-full items-center justify-between rounded-lg px-6 py-3 text-sm font-medium transition-all hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon}
                        {isOpen && <span>{item.name}</span>}
                      </div>
                      {isOpen && (
                        <motion.div
                          animate={{ rotate: openSubmenus[index] ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <FaChevronDown size={12} />
                        </motion.div>
                      )}
                    </button>

                    {/* Submenu with Animation */}
                    <AnimatePresence>
                      {openSubmenus[index] && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-2 rounded-lg bg-gray-50 pl-6"
                        >
                          {item.children.map((child, childIndex) => (
                            <li key={childIndex}>
                              <Link
                                href={child.path}
                                className="flex w-full items-center space-x-3 rounded-md px-6 py-2 text-sm transition-all hover:bg-gray-200"
                              >
                                {isOpen && <span>{child.name}</span>}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  /* Normal Menu Item */
                  <Link
                    href={item.path}
                    className="flex w-full items-center space-x-3 rounded-lg px-6 py-3 text-sm font-medium transition-all hover:bg-gray-100"
                  >
                    {item.icon}
                    {isOpen && <span>{item.name}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;
