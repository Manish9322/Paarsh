
"use client";

import { useState } from "react";
import { Bell, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar/Sidebar";
import { useSendNotificationMutation } from "@/services/api";

const NotificationsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    recipientType: "all" as "all" | "users" | "agents",
  });
  const [sendNotification, { isLoading: isSending }] = useSendNotificationMutation();

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendNotification({
        title: formData.title,
        message: formData.message,
        recipientType: formData.recipientType,
      }).unwrap();

      toast.success("Notification queued", {
        description: "The custom push notification has been successfully queued for sending.",
        duration: 3000,
      });
      setFormData({ title: "", message: "", recipientType: "all" });
      setSendModalOpen(false);
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to queue notification", {
        description: "An error occurred while queuing the notification.",
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Bell size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Send Push Notifications</h1>
        <div className="w-10"></div>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 md:justify-end">
            <h1 className="text-xl font-bold md:hidden">Dashboard</h1>
          </div>
          <div className="custom-scrollbar flex-1 overflow-y-auto">
            <Sidebar userRole="admin" />
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <main className="flex-1 overflow-y-auto pt-16 md:ml-64">
        <div className="container mx-auto px-4 py-6">
          <Card className="mb-6 overflow-hidden border-none bg-white shadow-md dark:bg-gray-900">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Send Custom Push Notification
                </CardTitle>
                <Button
                  onClick={() => setSendModalOpen(true)}
                  className="h-10 w-10 rounded-full bg-white/90 p-0 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-600"
                  aria-label="Create new notification"
                >
                  <Plus size={20} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <div className="flex items-center justify-center rounded-md bg-white p-6 shadow-md dark:bg-gray-800">
                <div className="text-center">
                  <Bell className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-700" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                    Create a Custom Push Notification
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Send a broadcast notification to all users, all agents, or both.
                  </p>
                  <Button
                    onClick={() => setSendModalOpen(true)}
                    className="mt-4 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    Create Notification
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
            <DialogContent className="max-w-md rounded-md bg-white p-6 shadow-lg dark:bg-gray-800 dark:text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                  Create Custom Push Notification
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSendNotification} className="grid gap-4">
                <Input
                  type="text"
                  placeholder="Notification Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full dark:bg-gray-800 dark:text-white"
                  required
                />
                <Textarea
                  placeholder="Notification Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full dark:bg-gray-800 dark:text-white"
                  rows={4}
                  required
                />
                <select
                  value={formData.recipientType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recipientType: e.target.value as "all" | "users" | "agents",
                    })
                  }
                  className="w-full rounded-md border border-gray-300 bg-white p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="all">All (Users & Agents)</option>
                  <option value="users">All Users</option>
                  <option value="agents">All Agents</option>
                </select>
                <Button
                  type="submit"
                  disabled={isSending}
                  className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  {isSending ? "Queuing..." : "Send Notification"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: #f9fafb;
        }

        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #4b5563;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background-color: #1f2937;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationsPage;
