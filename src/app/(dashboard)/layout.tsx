"use client";
import React, { useState } from "react";
import DashboardSidebar from "@/components/Layout/DashboardSidebar";
import { Provider } from "react-redux";
import { store } from "../../lib/store";
import { Toaster } from "sonner";
import UserProtectedRoute from "utils/UserProtectedRoute";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isCourseLecturePage = pathname?.startsWith("/course-lecture");

  return (
    <UserProtectedRoute>
      <Provider store={store}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-colors duration-300 dark:from-gray-900 dark:to-gray-800">
          <div className="flex min-h-screen">
            {/* Sidebar Component */}
            {!isCourseLecturePage && (
              <DashboardSidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
              />
            )}

            {/* Main Content Area */}
            <div
              className={`flex flex-1 flex-col transition-all duration-300 ${
                !isSidebarOpen || isCourseLecturePage ? "ml-0" : ""
              } ${!isCourseLecturePage ? "p-2 sm:p-4 md:p-6 lg:ml-64" : ""}`}
            >
              <div
                className={`rounded-xl bg-white shadow-sm dark:bg-gray-800 ${
                  !isCourseLecturePage ? "p-3 sm:p-6" : ""
                } flex flex-1 flex-col overflow-hidden transition-all duration-300 dark:border-gray-700`}
              >
                <div className="flex-1 overflow-y-auto">{children}</div>
              </div>
            </div>
          </div>
          <Toaster position="top-right" richColors />
        </div>
      </Provider>
    </UserProtectedRoute>
  );
}
