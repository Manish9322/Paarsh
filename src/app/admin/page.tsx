"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Navbar from "@/components/Navbar/Navbar";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Settings,
  DollarSign,
  CheckSquare,
  BarChart3,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFetchUserQuery } from "@/services/api";

export default function AdminPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();

  const {
      data: userData,
      isLoading,
      error,
    } = useFetchUserQuery(undefined);

    console.log("User Data logged inside AdminPage:", userData);


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <div className="z-10 w-full">
        <Navbar />
      </div>

      {/* Mobile Sidebar Toggle - Fixed position with better visibility */}
      <div className="fixed left-0 top-0 z-[100] flex h-16 w-16 items-center justify-center md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full p-2 transition-all duration-200 ${
            isSidebarOpen 
              ? "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30" 
              : "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
          }`}
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed on mobile, static on desktop */}
        <div
          className={`${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed md:static md:translate-x-0 z-20 h-[calc(100vh-64px)] transition-transform duration-300 ease-in-out`}
        >
          <Sidebar userRole="admin" />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white pl-16 md:pl-0">
              Admin Dashboard
            </h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-t-4 border-t-blue-500 dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg font-medium">
                  <span>Total Users</span>
                  <Users className="h-5 w-5 text-blue-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">1,250</p>
                <p className="mt-1 text-sm text-blue-500 flex items-center">
                  <TrendingUp className="mr-1 inline h-4 w-4" />
                  <span>12% increase</span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-500 dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg font-medium">
                  <span>Orders</span>
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">320</p>
                <p className="mt-1 text-sm text-blue-500 flex items-center">
                  <TrendingUp className="mr-1 inline h-4 w-4" />
                  <span>8% increase</span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-500 dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg font-medium">
                  <span>Revenue</span>
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">$45,000</p>
                <p className="mt-1 text-sm text-blue-500 flex items-center">
                  <TrendingUp className="mr-1 inline h-4 w-4" />
                  <span>15% increase</span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-500 dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg font-medium">
                  <span>Pending Tasks</span>
                  <CheckSquare className="h-5 w-5 text-blue-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">12</p>
                <p className="mt-1 text-sm text-blue-500 flex items-center">
                  <TrendingUp className="mr-1 inline h-4 w-4 rotate-180 transform" />
                  <span>3 new tasks</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Chart Section */}
          <div className="mt-8">
            <Card className="dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold">
                  <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                  Activity Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 rounded-md bg-gray-200 dark:bg-gray-700">
                  <div className="flex h-full items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Chart placeholder</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
