"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Menu, ChevronLeft, ChevronRight, Eye, Pencil } from "lucide-react";
import { RxCross2 } from "react-icons/rx";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  useFetchReferralSettingsQuery,
  useUpdateReferralSettingsMutation,
  useFetchUserRefferalAdminQuery,
} from "@/services/api";

const ReferralSettingsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editSettingsOpen, setEditSettingsOpen] = useState(false);
  const [viewReferralsOpen, setViewReferralsOpen] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState(null);
  const [selectedReferredUsers, setSelectedReferredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const referrersPerPage = 10;

  // Fetch referral settings
  const { data: settingsData, isLoading: settingsLoading, error: settingsError } =
    useFetchReferralSettingsQuery(undefined);
  const [updateReferralSettings] = useUpdateReferralSettingsMutation();

  // Fetch referral data
  const {
    data: referralsData,
    isLoading: referralsLoading,
    error: referralsError,
  } = useFetchUserRefferalAdminQuery(undefined);

  console.log("Referral Data :::", referralsData);

  const referralSettings = settingsData?.data || {
    discountPercentage: 20,
    cashbackAmount: 20,
    maxReferrals: 0,
    rewardCreditDays: 2,
  };

  // Form setup
  const form = useForm({
    defaultValues: {
      discountPercentage: referralSettings.discountPercentage.toString(),
      cashbackAmount: referralSettings.cashbackAmount.toString(),
      maxReferrals: referralSettings.maxReferrals.toString(),
      rewardCreditDays: referralSettings.rewardCreditDays.toString(),
    },
  });

  // Update form defaults when settings data changes
  useEffect(() => {
    if (settingsData?.data) {
      form.reset({
        discountPercentage: settingsData.data.discountPercentage.toString(),
        cashbackAmount: settingsData.data.cashbackAmount.toString(),
        maxReferrals: settingsData.data.maxReferrals.toString(),
        rewardCreditDays: settingsData.data.rewardCreditDays.toString(),
      });
    }
  }, [settingsData, form]);

  // Handle form submission
  const handleUpdateSettings = async (data) => {
    try {
      const settings = {
        discountPercentage: parseInt(data.discountPercentage),
        cashbackAmount: parseInt(data.cashbackAmount),
        maxReferrals: parseInt(data.maxReferrals),
        rewardCreditDays: parseInt(data.rewardCreditDays),
      };

      if (
        isNaN(settings.discountPercentage) ||
        isNaN(settings.cashbackAmount) ||
        isNaN(settings.maxReferrals) ||
        isNaN(settings.rewardCreditDays)
      ) {
        toast.error("Please fill in all fields with valid numbers");
        return;
      }

      if (settings.discountPercentage < 0 || settings.discountPercentage > 100) {
        toast.error("Discount percentage must be between 0 and 100");
        return;
      }

      if (settings.cashbackAmount < 0) {
        toast.error("Cashback amount cannot be negative");
        return;
      }

      if (settings.maxReferrals < 0) {
        toast.error("Maximum referrals cannot be negative");
        return;
      }

      if (settings.rewardCreditDays < 0) {
        toast.error("Reward credit days cannot be negative");
        return;
      }

      await updateReferralSettings(settings).unwrap();
      toast.success("Referral settings updated successfully");
      setEditSettingsOpen(false);
    } catch (error) {
      toast.error(`Failed to update referral settings: ${error.data?.error || "Unknown error"}`);
    }
  };

  // Handle viewing referred users
  const handleViewReferrals = (referrer, referredUsers) => {
    setSelectedReferrer(referrer);
    setSelectedReferredUsers(referredUsers);
    setViewReferralsOpen(true);
  };

  // Filter referrers based on search term
  const filteredReferrers = referralsData?.usersWithReferrals?.filter((referrer) => {
    const searchFields = [
      referrer.name,
      referrer.email,
      referrer.refferalCode,
      referrer.mobile,
    ];
    return searchFields.some((field) =>
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  // Pagination logic
  const totalPages = Math.ceil(filteredReferrers.length / referrersPerPage);
  const startIndex = (currentPage - 1) * referrersPerPage;
  const displayedReferrers = filteredReferrers.slice(
    startIndex,
    startIndex + referrersPerPage
  );

  const generatePaginationNumbers = () => {
    const pageNumbers = [];
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

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Edit Settings Modal Component
  const EditSettingsModal = ({ isOpen, onClose, onSubmit }) => {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Edit Referral Settings
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Discount Percentage (%)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="Enter discount percentage"
                        className="border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        min="0"
                        max="100"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cashbackAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Cashback Amount (₹)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="Enter cashback amount"
                        className="border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        min="0"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxReferrals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Maximum Referrals (0 for unlimited)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="Enter maximum referrals"
                        className="border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        min="0"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rewardCreditDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Reward Credit Days
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="Enter reward credit days"
                        className="border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        min="0"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Update Settings
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  };

  // Referred Users Modal Component
  const ReferredUsersModal = ({ isOpen, onClose, referrer, referredUsers }) => {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="no-scrollbar max-h-[90vh] max-w-3xl overflow-y-auto rounded-md bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
          <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                Referred Users by {referrer?.name || "Unknown"}
              </DialogTitle>
              <RxCross2
                className="text-gray-800 dark:text-white cursor-pointer"
                size={20}
                onClick={onClose}
              />
            </div>
          </DialogHeader>
          <div className="p-6">
            {referredUsers.length > 0 ? (
              <div className="space-y-6">
                <div className="overflow-hidden rounded-md border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                    <h3 className="font-medium text-blue-800 dark:text-blue-300">
                      Referred Users
                    </h3>
                  </div>
                  <Table className="w-full text-black dark:text-white">
                    <TableHeader>
                      <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                        <TableHead className="py-3 text-center">#</TableHead>
                        <TableHead className="py-3">Name</TableHead>
                        <TableHead className="py-3">Email</TableHead>
                        <TableHead className="py-3 text-center">Courses Purchased</TableHead>
                        <TableHead className="py-3 text-center">Status</TableHead>
                        <TableHead className="py-3 text-center">Reward Given</TableHead>
                        <TableHead className="py-3 text-center">Reward Amount (₹)</TableHead>
                        <TableHead className="py-3 text-center">Referral Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referredUsers.map((user, index) => (
                        <TableRow
                          key={user._id}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <TableCell className="text-center font-medium">{index + 1}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell className="text-center">{user.purchasedCoursesCount}</TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.purchasedCoursesCount > 0
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              }`}
                            >
                              {user.purchasedCoursesCount > 0 ? "Completed" : "Pending"}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {user.firstPurchaseRewardGiven ? "Yes" : "No"}
                          </TableCell>
                          <TableCell className="text-center">
                            ₹{user.firstPurchaseRewardAmount || 0}
                          </TableCell>
                          <TableCell className="text-center">
                            {formatDate(user.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center">
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No referred users found.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (referralsLoading && !referralsData) {
    return <div>Loading...</div>;
  }

  if (referralsError) {
    return <div>Error: {referralsError.toString()}</div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm dark:bg-gray-800 md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">
          Referral Settings Management
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 md:justify-end">
            <h1 className="text-xl font-bold md:hidden dark:text-white">Dashboard</h1>
          </div>
          <div className="custom-scrollbar flex-1 overflow-y-auto">
            <Sidebar userRole="admin" />
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:ml-64">
        <div className="container mx-auto px-4 py-6">
          {/* Referral Settings Card */}
          <Card className="mb-6 overflow-hidden border-none bg-white shadow-md dark:bg-gray-900">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Referral Settings
                </CardTitle>
                <Button
                  onClick={() => setEditSettingsOpen(true)}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  <Pencil className="mr-2 h-5 w-5" />
                  Edit Settings
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {settingsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : settingsError ? (
                <p className="text-red-500">Error loading referral settings</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Discount Percentage
                    </h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {referralSettings.discountPercentage}%
                    </p>
                  </div>
                  <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Cashback Amount
                    </h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ₹{referralSettings.cashbackAmount}
                    </p>
                  </div>
                  <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Maximum Referrals
                    </h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {referralSettings.maxReferrals === 0
                        ? "Unlimited"
                        : referralSettings.maxReferrals}
                    </p>
                  </div>
                  <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Reward Credit Days
                    </h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {referralSettings.rewardCreditDays}{" "}
                      {referralSettings.rewardCreditDays === 1 ? "day" : "days"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referrals Overview Card */}
          <Card className="mb-6 overflow-hidden border-none bg-white shadow-md dark:bg-gray-900">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Referral Overview
                </CardTitle>
                <Input
                  type="text"
                  placeholder="Search referrers..."
                  className="h-10 w-full rounded border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* Summary Cards */}
              <div className="mb-6 grid gap-4 md:grid-cols-4">
                <div className="overflow-hidden rounded-md bg-white shadow transition-all hover:shadow-md dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                          <svg
                            className="h-6 w-6 text-green-600 dark:text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Referrers
                        </h3>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          {referralsData?.summary?.totalUsersWithReferrals?.toLocaleString() || 0}
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
                          <svg
                            className="h-6 w-6 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Completed Referrals
                        </h3>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          {referralsData?.summary?.totalCompletedReferrals?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-md bg-white shadow transition-all hover:shadow-md dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                          <svg
                            className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Referral Amount
                        </h3>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          ₹{referralsData?.summary?.totalReferralAmount?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-md bg-white shadow transition-all hover:shadow-md dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                          <svg
                            className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Pending Referrals
                        </h3>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          {referralsData?.summary?.totalPendingReferrals?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referrers Table */}
              <div className="no-scrollbar overflow-x-auto">
                <Table className="w-full text-black dark:text-white">
                  <TableHeader>
                    <TableRow className="border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                      <TableHead className="hidden py-3 text-center sm:table-cell">#</TableHead>
                      <TableHead className="py-3">Name</TableHead>
                      <TableHead className="hidden py-3 sm:table-cell">Email</TableHead>
                      <TableHead className="hidden py-3 md:table-cell">Mobile</TableHead>
                      <TableHead className="py-3">Referral Code</TableHead>
                      <TableHead className="hidden py-3 sm:table-cell text-center">
                        Completed Referrals
                      </TableHead>
                      <TableHead className="hidden py-3 sm:table-cell text-center">
                        Pending Referrals
                      </TableHead>
                      <TableHead className="hidden py-3 sm:table-cell text-center">
                        Total Referral Amount
                      </TableHead>
                      <TableHead className="py-3 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralsLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow
                          key={index}
                          className="border-b border-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <TableCell className="hidden text-center sm:table-cell">
                            <Skeleton className="h-4 w-6 mx-auto" />
                          </TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell className="hidden sm:table-cell text-center">
                            <Skeleton className="h-4 w-10 mx-auto" />
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-center">
                            <Skeleton className="h-4 w-10 mx-auto" />
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-center">
                            <Skeleton className="h-4 w-10 mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Skeleton className="h-6 w-6 rounded-full mx-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : displayedReferrers.length > 0 ? (
                      displayedReferrers.map((referrer, index) => (
                        <TableRow
                          key={referrer._id}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <TableCell className="hidden text-center font-medium sm:table-cell">
                            {startIndex + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="sm:block">
                              <p className="font-medium">{referrer.name}</p>
                              <p className="mt-1 text-xs text-gray-500 sm:hidden">
                                {referrer.email}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 md:hidden">
                                {referrer.mobile}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{referrer.email}</TableCell>
                          <TableCell className="hidden md:table-cell">{referrer.mobile}</TableCell>
                          <TableCell>{referrer.refferalCode}</TableCell>
                          <TableCell className="hidden sm:table-cell text-center">
                            {referrer.completedReferrals}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-center">
                            {referrer.pendingReferrals}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-center">
                            ₹{referrer.totalReferralAmount?.toLocaleString() || 0}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                onClick={() => handleViewReferrals(referrer, referrer.referredUsers)}
                                aria-label="View referred users"
                              >
                                <Eye
                                  size={16}
                                  className="transition-transform group-hover:scale-110"
                                />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  View referred users
                                </span>
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="h-32 text-center">
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
                              <p className="text-base font-medium">No referrers found</p>
                              <p className="text-sm">
                                {searchTerm
                                  ? "Try adjusting your search criteria"
                                  : "No referrers available"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="mt-6 rounded-md bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {Math.min(startIndex + referrersPerPage, filteredReferrers.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {filteredReferrers.length}
                    </span>{" "}
                    referrers
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
                          <span
                            key={`ellipsis-${index}`}
                            className="px-1 text-gray-400"
                          >
                            ...
                          </span>
                        ) : (
                          <Button
                            key={`page-${page}`}
                            onClick={() => setCurrentPage(Number(page))}
                            className={`h-8 w-8 rounded-md p-0 text-sm font-medium ${
                              currentPage === page
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
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))
                      }
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="h-8 w-8 rounded-md bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="hidden items-center space-x-2 lg:flex">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Go to page :
                    </span>
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
                      className="h-8 w-16 rounded-md border-gray-300 text-center text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      aria-label="Go to page"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Edit Settings Modal */}
      <EditSettingsModal
        isOpen={editSettingsOpen}
        onClose={() => setEditSettingsOpen(false)}
        onSubmit={handleUpdateSettings}
      />

      {/* Referred Users Modal */}
      <ReferredUsersModal
        isOpen={viewReferralsOpen}
        onClose={() => setViewReferralsOpen(false)}
        referrer={selectedReferrer}
        referredUsers={selectedReferredUsers}
      />

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

export default ReferralSettingsPage;