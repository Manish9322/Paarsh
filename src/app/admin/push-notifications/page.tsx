"use client";

import { useState } from "react";
import { Bell, Plus, Trash2, RefreshCw } from "lucide-react";
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
import {
  useSendNotificationMutation,
  useGetNotificationLogsQuery,
  useDeleteNotificationLogMutation,
  useResendNotificationMutation,
} from "@/services/api";
import { format } from "date-fns";

const NotificationsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    recipientType: "all" as "all" | "users" | "agents",
  });
  const [sendNotification, { isLoading: isSending }] = useSendNotificationMutation();
  const { data: logs, isLoading: isLoadingLogs } = useGetNotificationLogsQuery(undefined);
  const [deleteNotificationLog] = useDeleteNotificationLogMutation();
  const [resendNotification] = useResendNotificationMutation();

  console.log("Notification Logs:", logs);
  
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



  const handleDeleteLog = async (jobId: string) => {
    try {
      await deleteNotificationLog(jobId).unwrap();
      toast.success("Notification log deleted", {
        description: "The notification log has been successfully deleted.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting notification log:", error);
      toast.error("Failed to delete notification log", {
        description: "An error occurred while deleting the notification log.",
        duration: 3000,
      });
    }
  };

  const handleResendNotification = async (jobId: string) => {
    try {
      await resendNotification(jobId).unwrap();
      toast.success("Notification re-queued", {
        description: "The notification has been successfully re-queued for sending.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error re-queuing notification:", error);
      toast.error("Failed to re-queue notification", {
        description: "An error occurred while re-queuing the notification.",
        duration: 3000,
      });
    }
  };

  // Group logs by date
  type NotificationLog = {
    jobId: string;
    title: string;
    message: string;
    recipientType: string;
    status: string;
    sentAt: string;
  };

  const groupedLogs = (logs?.logs as NotificationLog[] | undefined)?.reduce((acc, log) => {
    const date = format(new Date(log.sentAt), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, NotificationLog[]>);

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

          {/* Notification Logs Section */}
          <Card className="mb-6 overflow-hidden border-none bg-white shadow-md dark:bg-gray-900">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
              <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                Notification Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isLoadingLogs ? (
                <p>Loading logs...</p>
              ) : !groupedLogs || Object.keys(groupedLogs).length === 0 ? (
                <p>No notification logs found.</p>
              ) : (
                Object.entries(groupedLogs).map(([date, logs]) => (
                  <div key={date} className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {format(new Date(date), "MMMM dd, yyyy")}
                    </h3>
                    <div className="mt-2 space-y-4">
                      {logs.map((log) => (
                        <div
                          key={log.jobId}
                          className="rounded-md border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800"
                        >
                          <div className="flex justify-between">
                            <div>
                              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                                {log.title}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {log.message}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Recipient: {log.recipientType} | Status: {log.status} | Sent:{" "}
                                {format(new Date(log.sentAt), "HH:mm")}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleResendNotification(log.jobId)}
                                variant="outline"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500"
                              >
                                <RefreshCw size={16} className="mr-2" />
                                Resend
                              </Button>
                              <Button
                                onClick={() => handleDeleteLog(log.jobId)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
                              >
                                <Trash2 size={16} className="mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
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