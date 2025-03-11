"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Settings,
  Menu,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex flex-1 pt-16">
        <div
          className={`${isSidebarOpen ? "w-64" : "w-0"} transition-all md:w-64`}
        >
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Content */}
          <main className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Cards */}
              <div className="rounded-lg bg-white p-4 shadow-md">
                <h3 className="text-lg font-semibold">Total Users</h3>
                <p className="mt-2 text-2xl font-bold">1,250</p>
              </div>

              <div className="rounded-lg bg-white p-4 shadow-md">
                <h3 className="text-lg font-semibold">Orders</h3>
                <p className="mt-2 text-2xl font-bold">320</p>
              </div>

              <div className="rounded-lg bg-white p-4 shadow-md">
                <h3 className="text-lg font-semibold">Revenue</h3>
                <p className="mt-2 text-2xl font-bold">$45,000</p>
              </div>

              <div className="rounded-lg bg-white p-4 shadow-md">
                <h3 className="text-lg font-semibold">Pending Tasks</h3>
                <p className="mt-2 text-2xl font-bold">12</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
