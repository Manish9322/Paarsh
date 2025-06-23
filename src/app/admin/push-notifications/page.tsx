"use client";

import { useState, useEffect } from "react";
import { Menu, ChevronLeft, ChevronRight, Eye, Trash2, Send, Bell, Plus } from "lucide-react";
import { RxCross2 } from "react-icons/rx";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import Sidebar from "@/components/Sidebar/Sidebar";
import { useFetchNotificationsQuery, useSendNotificationMutation, useDeleteNotificationMutation, useFetchUsersQuery, useFetchAgentsQuery } from "@/services/api";
import { toast } from "sonner";

// Define TypeScript interfaces
interface Notification {
  _id: string;
  title: string;
  message: string;
  recipientType: "agent" | "student" | "user" | "all";
  recipientIds: string[];
  sentTime: string; // ISO date string
  status: "sent" | "failed";
}

interface NotificationsResponse {
  success: boolean;
  data: Notification[];
}

const NotificationsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage, setNotificationsPerPage] = useState<number | "all">(10);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    recipientType: "all_users" as "all_users" | "all_agents" | "user" | "agent",
    recipientId: "", // Changed to single ID for single selection
  });
  const [recipientSearch, setRecipientSearch] = useState(""); // For filtering dropdown options

  const { data: notificationsData, isLoading, isFetching, error: fetchError, refetch } = useFetchNotificationsQuery(undefined, {
    pollingInterval: 30000,
  }) as { data?: NotificationsResponse; isLoading: boolean; isFetching: boolean; error?: unknown; refetch: () => void };
  const [sendNotification, { isLoading: isSending }] = useSendNotificationMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();

  const { data: usersData } = useFetchUsersQuery(undefined) as { data?: { success: boolean; data: { _id: string; name: string }[] } };
  const users = usersData?.data || [];
  const userOptions = users.map(user => ({
    id: user._id,
    name: user.name,
  }));
  console.log("User Options:", userOptions);

  const { data: agentsData } = useFetchAgentsQuery(undefined) as { data?: { success: boolean; data: { _id: string; firstName: string, lastName: string }[] } };
  const agents = agentsData?.data || [];
  const agentOptions = agents.map(agent => ({
    id: agent._id,
    name: `${agent.firstName} ${agent.lastName}`,
  }));
  console.log("Agent Options:", agentOptions);
  console.log("Agents details : ", agentsData)

  const notifications: Notification[] = notificationsData?.data || [];

  const filteredNotifications = notifications.filter((notification: Notification) => {
    const searchFields = [
      notification.title,
      notification.message,
      notification.recipientType,
      notification.status,
    ];
    return searchFields.some((field) =>
      field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = notificationsPerPage === "all" ? 1 : Math.ceil(filteredNotifications.length / notificationsPerPage);
  const startIndex = notificationsPerPage === "all" ? 0 : (currentPage - 1) * notificationsPerPage;
  const displayedNotifications = notificationsPerPage === "all"
    ? filteredNotifications
    : filteredNotifications.slice(
      startIndex,
      startIndex + notificationsPerPage
    );

  useEffect(() => {
    const handleFocus = () => refetch();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetch]);

  // Filter recipient options based on search and recipientType
  const getFilteredOptions = () => {
    const options = formData.recipientType === "user" ? userOptions : agentOptions;
    if (!recipientSearch) return options;
    return options.filter(option =>
      option.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
      option.id.toLowerCase().includes(recipientSearch.toLowerCase())
    );
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const recipientIds = formData.recipientType === "all_users" || formData.recipientType === "all_agents"
        ? []
        : formData.recipientId ? [formData.recipientId] : [];
      const payload = {
        title: formData.title,
        message: formData.message,
        recipientType: formData.recipientType === "all_users" ? "all" :
          formData.recipientType === "all_agents" ? "agent" :
            formData.recipientType,
        recipientIds,
      };
      await sendNotification(payload).unwrap();
      toast.success("Notification sent", {
        description: "The notification has been successfully sent to the recipients.",
        duration: 3000,
      });
      setFormData({ title: "", message: "", recipientType: "all_users", recipientId: "" });
      setRecipientSearch("");
      setSendModalOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to send notification", {
        description: "An error occurred while sending the notification.",
        duration: 3000,
      });
    }
  };

  const handleDeleteNotification = async () => {
    if (!selectedNotification) return;
    try {
      await deleteNotification(selectedNotification._id).unwrap();
      toast.success("Notification deleted", {
        description: "The notification has been successfully deleted.",
        duration: 3000,
      });
      setDeleteOpen(false);
      setSelectedNotification(null);
      refetch();
    } catch (error) {
      toast.error("Failed to delete notification", {
        description: "An error occurred while deleting the notification.",
        duration: 3000,
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const generatePaginationNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
      }
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - maxPagesToShow + 2);
      }

      if (startPage > 2) pageNumbers.push("...");
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      if (endPage < totalPages - 1) pageNumbers.push("...");
      if (totalPages > 1) pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (fetchError) {
    return <div>Error: {(fetchError as Error).toString()}</div>;
  }

  return (
    <div className="flex min-h-screen">
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Notifications</h1>
        <div className="w-10"></div>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
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
                  Send Notifications
                </CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                  <Button
                    onClick={() => setSendModalOpen(true)}
                    className="h-10 w-10 rounded-full bg-white/90 p-0 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-600"
                    aria-label="Create new notification"
                  >
                    <Plus size={20} />
                  </Button>
                  <Button
                    onClick={refetch}
                    disabled={isFetching}
                    className="h-10 w-10 rounded-full bg-white/90 p-0 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-600"
                    aria-label="Refresh notifications"
                  >
                    <Bell size={20} className={isFetching ? "animate-spin" : ""} />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <div className="overflow-hidden rounded-md bg-white shadow transition-all hover:shadow-md dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-700" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Notifications
                        </h3>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          {notifications.length.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-md bg-white shadow transition-all hover:shadow-md dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <Send className="h-5 w-5 text-blue-600 dark:text-blue-700" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Successful Notifications
                        </h3>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          {notifications.filter(n => n.status === "sent").length.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <Input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="no-scrollbar overflow-x-auto">
                <Table className="w-full text-black dark:text-white">
                  <TableHeader>
                    <TableRow className="border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                      <TableHead className="hidden py-3 text-center sm:table-cell">#</TableHead>
                      <TableHead className="py-3">Title</TableHead>
                      <TableHead className="hidden py-3 md:table-cell">Message</TableHead>
                      <TableHead className="py-3">Recipient Type</TableHead>
                      <TableHead className="hidden py-3 sm:table-cell">Sent Time</TableHead>
                      <TableHead className="py-3">Status</TableHead>
                      <TableHead className="py-3 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedNotifications.length > 0 ? (
                      displayedNotifications.map((notification: Notification, index: number) => (
                        <TableRow
                          key={notification._id}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <TableCell className="hidden text-center font-medium sm:table-cell">
                            {startIndex + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="sm:block">
                              <p className="font-medium">{notification.title}</p>
                              <p className="mt-1 text-xs text-gray-500 md:hidden">
                                {notification.message.substring(0, 30)}...
                              </p>
                              <p className="mt-1 text-xs text-gray-500 sm:hidden">
                                {notification.recipientType}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {notification.message.substring(0, 50)}...
                          </TableCell>
                          <TableCell>{notification.recipientType}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {formatDate(notification.sentTime)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${notification.status === "sent"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                            >
                              {notification.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                onClick={() => {
                                  setSelectedNotification(notification);
                                  setPreviewOpen(true);
                                }}
                                aria-label="View notification details"
                              >
                                <Eye
                                  size={16}
                                  className="transition-transform group-hover:scale-110"
                                />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  View details
                                </span>
                              </button>
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                onClick={() => {
                                  setSelectedNotification(notification);
                                  setDeleteOpen(true);
                                }}
                                aria-label="Delete notification"
                              >
                                <Trash2
                                  size={16}
                                  className="transition-transform group-hover:scale-110"
                                />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  Delete notification
                                </span>
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="text-gray-400 dark:text-gray-500">
                              <svg
                                className="mx-auto h-12 w-12"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              <p className="text-base font-medium">No notifications found</p>
                              <p className="text-sm">
                                {searchTerm ? "Try adjusting your search criteria" : "No notifications available"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
            <DialogContent className="max-w-md rounded-md bg-white p-6 shadow-lg dark:bg-gray-800 dark:text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                  Send New Notification
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
                <Select
                  value={formData.recipientType}
                  onValueChange={(value: "all_users" | "all_agents" | "user" | "agent") =>
                    setFormData({ ...formData, recipientType: value, recipientId: "" })
                  }
                >
                  <SelectTrigger className="w-full dark:bg-gray-800 dark:text-white">
                    <SelectValue placeholder="Select Recipient Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_users">All Users</SelectItem>
                    <SelectItem value="all_agents">All Agents</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
                {(formData.recipientType === "user" || formData.recipientType === "agent") && (
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder={`Search ${formData.recipientType === "user" ? "Users" : "Agents"} by name or ID`}
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                      className="w-full dark:bg-gray-800 dark:text-white"
                    />
                    <Select
                      value={formData.recipientId}
                      onValueChange={(value) => setFormData({ ...formData, recipientId: value })}
                    >
                      <SelectTrigger className="w-full dark:bg-gray-800 dark:text-white mt-2">
                        <SelectValue placeholder={`Select ${formData.recipientType === "user" ? "User" : "Agent"}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {getFilteredOptions().length > 0 ? (
                          getFilteredOptions().map(option => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name} (ID: {option.id})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            No {formData.recipientType === "user" ? "users" : "agents"} available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={isSending}
                  className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  {isSending ? "Sending..." : "Send Notification"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="no-scrollbar max-h-[90vh] max-w-2xl overflow-y-auto rounded-md bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
              <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                    Notification Details
                  </DialogTitle>
                  <RxCross2
                    className="text-gray-800 dark:text-white"
                    size={20}
                    onClick={() => setPreviewOpen(false)}
                  />
                </div>
              </DialogHeader>
              {selectedNotification ? (
                <div className="space-y-6 p-6">
                  <div className="overflow-hidden rounded-md border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                      <h3 className="font-medium text-blue-800 dark:text-blue-300">
                        Notification Information
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Title
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                          {selectedNotification.title}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Message
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200 break-all">
                          {selectedNotification.message}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Recipient Type
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                          {selectedNotification.recipientType}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Recipient IDs
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200 break-all">
                          {selectedNotification.recipientIds.length > 0
                            ? selectedNotification.recipientIds.join(", ")
                            : "All"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Sent Time
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                          {formatDate(selectedNotification.sentTime)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 walking-dead:text-gray-400">
                          Status
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                          {selectedNotification.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    No notification selected.
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent className="max-w-md rounded-md bg-white p-6 shadow-lg dark:bg-gray-800 dark:text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                  Delete Notification
                </DialogTitle>
              </DialogHeader>
              <div className="my-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete the notification titled {selectedNotification?.title}?
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                  className="dark:border-gray-700 dark:text-white"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteNotification}
                  disabled={isDeleting}
                  className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="mt-6 rounded-md bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {notificationsPerPage === "all" ? 1 : startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {notificationsPerPage === "all" ? filteredNotifications.length : Math.min(startIndex + notificationsPerPage, filteredNotifications.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {filteredNotifications.length}
                </span>{" "}
                notifications
              
              <div className="flex items-center space-x-2 pt-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                <Select
                  value={notificationsPerPage.toString()}
                  onValueChange={(value) => {
                    setNotificationsPerPage(value === "all" ? "all" : parseInt(value));
                    setCurrentPage(1); // Reset to first page when changing entries per page
                  }}
                >
                  <SelectTrigger className="h-8 w-24 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800">
                    <SelectValue placeholder="Entries" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 rounded-md bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="hidden sm:flex sm:items-center sm:space-x-1">
                  {generatePaginationNumbers().map((page, index) =>
                    page === "..." ? (
                      <span key={`ellipsis-${index}`} className="px-1 text-gray-400">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={`page-${page}`}
                        onClick={() => setCurrentPage(Number(page))}
                        className={`h-8 w-8 rounded-md p-0 text-sm font-medium ${currentPage === page
                            ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                          }`}
                        aria-label={`Page ${page}`}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:hidden">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="h-8 w-8 rounded-md bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="hidden items-center space-x-2 lg:flex">
                <span className="text-sm text-gray-500 dark:text-gray-400">Go to page :</span>
                <Input
                  type="number"
                  min={1}
                  max={totalPages || 1}
                  value={currentPage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 1 && value <= totalPages) {
                      setCurrentPage(value);
                    }
                  }}
                  className="h-8 w-16 rounded-md dark:text-white border-gray-300 text-center text-sm dark:border-gray-700 dark:bg-gray-800"
                  aria-label="Go to page"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
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