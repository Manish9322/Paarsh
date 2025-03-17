"use client";
import React, { useState } from "react";
import DashboardSidebar from "@/components/Layout/DashboardSidebar";
import { Provider } from "react-redux";
import { store } from "../../lib/store";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="flex min-h-screen">
          {/* Sidebar Component */}
          <DashboardSidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />

          {/* Main Content Area */}
          <div className="flex-1 p-2 sm:p-4 md:p-6 sm:ml-64 transition-all duration-300 flex flex-col">
            <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm p-3 sm:p-6 dark:border-gray-700 transition-all duration-300 flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </div>
          </div>
        </div>
        <Toaster position="top-right" richColors />
      </div>
    </Provider>
  );
} 