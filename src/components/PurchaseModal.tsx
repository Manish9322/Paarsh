"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const PurchaseModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const pathname = usePathname();

  const isCourseDetailsPage = pathname === "/coursedetails";

  useEffect(() => {
    if (!isCourseDetailsPage || hasTriggered) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollY + windowHeight >= documentHeight - 5) {
        setIsOpen(true);
        setHasTriggered(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isCourseDetailsPage, hasTriggered]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-2xl w-[90%] max-w-md relative flex flex-col items-center border border-gray-200 dark:border-gray-800"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-4 text-2xl text-gray-600 dark:text-gray-400 hover:text-red-500 transition"
            >
              ✖
            </button>

            {/* Icon */}
            <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full shadow-lg mb-4">
              🎓
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold text-center dark:text-white">
              Unlock Full Course 🚀
            </h1>
            <p className="mt-2 text-center text-gray-700 dark:text-gray-300">
              Get lifetime access to all lessons, projects, and mentorship.
            </p>

            {/* CTA Button */}
            <button
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 text-white font-semibold text-lg shadow-lg hover:scale-105 transition-transform"
              onClick={() => alert("Redirect to payment page")}
            >
              Buy Now 💳
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PurchaseModal;
