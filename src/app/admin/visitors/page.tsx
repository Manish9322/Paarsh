"use client";

import { useState, useEffect } from "react";
import { Menu, ChevronLeft, ChevronRight, Eye, RefreshCw } from "lucide-react";
import { RxCross2 } from "react-icons/rx";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaLocationArrow } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa6";

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
} from "@/components/ui/dialog";
import Sidebar from "@/components/Sidebar/Sidebar";
import { useFetchVisitorsQuery } from "@/services/api";
import { toast } from "sonner";

// Define TypeScript interfaces
interface User {
  _id: string;
  name?: string;
  email?: string;
}

interface Visitor {
  _id: string;
  sessionId: string;
  userId?: User | null;
  deviceId?: string | null;
  ipAddress: string;
  pageUrl: string;
  visitTime: string; // ISO date string
  duration: number;
  userAgent?: string;
  referrer?: string;
}

interface VisitorsResponse {
  success: boolean;
  data: Visitor[];
}

const VisitorsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [activeFilters, setActiveFilters] = useState({
    pageUrl: "",
    date: "",
  });

  const { data: visitorsData, isLoading, isFetching, error: fetchError, refetch } = useFetchVisitorsQuery(undefined, {
    pollingInterval: 30000,
  }) as { data?: VisitorsResponse; isLoading: boolean; isFetching: boolean; error?: unknown; refetch: () => void };
  const visitors: Visitor[] = visitorsData?.data || [];
  const visitorsPerPage = 10;

  // Aggregate by sessionId, keep latest entry for table display
  const aggregatedVisitors: Visitor[] = Object.values(
    visitors.reduce((acc: Record<string, Visitor>, visitor: Visitor) => {
      const sessionId = visitor.sessionId;
      if (!acc[sessionId] || new Date(visitor.visitTime) > new Date(acc[sessionId].visitTime)) {
        acc[sessionId] = visitor;
      }
      return acc;
    }, {})
  );

  const filteredVisitors = aggregatedVisitors.filter((visitor: Visitor) => {
    const searchFields = [
      visitor.sessionId,
      visitor.userId?.name,
      visitor.userId?.email,
      visitor.ipAddress,
      visitor.pageUrl,
      visitor.userAgent,
      visitor.referrer,
      visitor.deviceId,
    ];

    const matchesSearch = searchFields.some((field) =>
      field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!matchesSearch) return false;

    if (activeFilters.pageUrl && !visitor.pageUrl.toLowerCase().includes(activeFilters.pageUrl.toLowerCase())) {
      return false;
    }

    if (activeFilters.date) {
      const visitDate = new Date(visitor.visitTime).toISOString().split("T")[0];
      if (visitDate !== activeFilters.date) {
        return false;
      }
    }

    return true;
  });

  // Get all visits for the selected user/device
  const getUserVisits = (visitor: Visitor | null): Visitor[] => {
    if (!visitor) return [];
    return visitors.filter((v) =>
      (visitor.userId?._id && v.userId?._id === visitor.userId?._id) ||
      (visitor.deviceId && v.deviceId === visitor.deviceId) ||
      (v.ipAddress === visitor.ipAddress)
    ).sort((a, b) => new Date(b.visitTime).getTime() - new Date(a.visitTime).getTime());
  };

  const totalPages = Math.ceil(filteredVisitors.length / visitorsPerPage);
  const startIndex = (currentPage - 1) * visitorsPerPage;
  const displayedVisitors = filteredVisitors.slice(
    startIndex,
    startIndex + visitorsPerPage
  );

  useEffect(() => {
    const handleFocus = () => refetch();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetch]);

  const handleFilterChange = (newFilters: { pageUrl: string; date: string }) => {
    setActiveFilters(newFilters);
    setCurrentPage(1);
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

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds < 1) return "<1s";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`;
  };

  const handlePreview = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setPreviewOpen(true);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Table refreshed", {
      description: "Latest visitor data has been fetched.",
      duration: 3000,
    });
  };

  // Unique Visitors: Prioritize userId, then deviceId, then ipAddress
  const uniqueVisitors = [...new Set(
    aggregatedVisitors.map((v: Visitor) => v.userId?._id?.toString() || v.deviceId || v.ipAddress)
  )].length;

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
        <h1 className="text-lg font-bold text-gray-800">Visitor Tracking</h1>
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
                  Visitor Tracking
                </CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                  <Button
                    onClick={handleRefresh}
                    disabled={isFetching}
                    className="h-10 w-10 rounded-full bg-white/90 p-0 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-600"
                    aria-label="Refresh visitor data"
                  >
                    <RefreshCw
                      size={20}
                      className={isFetching ? "animate-spin" : ""}
                    />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <div className="overflow-hidden rounded-md bg-white shadow transition-all hover:shadow-md dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <FaLocationArrow className="h-5 w-5 text-blue-600 dark:text-blue-700" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Visits
                        </h3>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          {aggregatedVisitors.length.toLocaleString()}
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
                          <FaRegUser className="h-5 w-5 text-blue-600 dark:text-blue-700" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Unique Visitors
                        </h3>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          {uniqueVisitors.toLocaleString()}
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
                            className="h-6 w-6 text-blue-600 dark:text-blue-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Top Visited Page
                        </h3>
                        <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white break-all">
                          {aggregatedVisitors.length > 0
                            ? Object.entries(
                              aggregatedVisitors.reduce((acc: Record<string, number>, v: Visitor) => {
                                acc[v.pageUrl] = (acc[v.pageUrl] || 0) + 1;
                                return acc;
                              }, {})
                            ).reduce((a, b) => (b[1] > a[1] ? b : a), ["", 0])[0] || "N/A"
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <div>
                  <Input
                    type="text"
                    placeholder="Filter by Page URL"
                    value={activeFilters.pageUrl}
                    onChange={(e) =>
                      handleFilterChange({
                        ...activeFilters,
                        pageUrl: e.target.value,
                      })
                    }
                    className="w-full dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Search visitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={activeFilters.date}
                    onChange={(e) =>
                      handleFilterChange({
                        ...activeFilters,
                        date: e.target.value,
                      })
                    }
                    className="w-full dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="no-scrollbar overflow-x-auto">
                <Table className="w-full text-black dark:text-white">
                  <TableHeader>
                    <TableRow className="border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                      <TableHead className="hidden py-3 text-center sm:table-cell">
                        #
                      </TableHead>
                      <TableHead className="py-3">Session ID</TableHead>
                      <TableHead className="hidden py-3 md:table-cell">User</TableHead>
                      <TableHead className="py-3">IP Address</TableHead>
                      <TableHead className="hidden py-3 sm:table-cell">Page URL</TableHead>
                      <TableHead className="hidden py-3 md:table-cell">Visit Time</TableHead>
                      <TableHead className="py-3">Duration</TableHead>
                      <TableHead className="py-3 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedVisitors.length > 0 ? (
                      displayedVisitors.map((visitor: Visitor, index: number) => (
                        <TableRow
                          key={visitor._id}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <TableCell className="hidden text-center font-medium sm:table-cell">
                            {startIndex + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="sm:block">
                              <p className="font-medium">{visitor.sessionId.substring(0, 8)}...</p>
                              <p className="mt-1 text-xs text-gray-500 md:hidden">
                                {visitor.userId?.name || "Anonymous"}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 sm:hidden">
                                {visitor.ipAddress}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {visitor.userId?.name || "Anonymous"}
                          </TableCell>
                          <TableCell>{visitor.ipAddress}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {visitor.pageUrl}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatDate(visitor.visitTime)}
                          </TableCell>
                          <TableCell>{formatDuration(visitor.duration)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                onClick={() => handlePreview(visitor)}
                                aria-label="View visitor details"
                              >
                                <Eye
                                  size={16}
                                  className="transition-transform group-hover:scale-110"
                                />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  View all visits
                                </span>
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center">
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
                              <p className="text-base font-medium">No visitors found</p>
                              <p className="text-sm">
                                {searchTerm || Object.values(activeFilters).some(Boolean)
                                  ? "Try adjusting your search or filter criteria"
                                  : "No visitors available"}
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

          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="no-scrollbar max-h-[90vh] max-w-2xl overflow-y-auto rounded-md bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
              <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                    All Visits for {selectedVisitor?.userId?.name || selectedVisitor?.deviceId || selectedVisitor?.ipAddress || "Visitor"}
                  </DialogTitle>
                  <RxCross2
                    className="text-gray-800 dark:text-white"
                    size={20}
                    onClick={() => setPreviewOpen(false)}
                  />
                </div>
              </DialogHeader>
              {selectedVisitor ? (
                <div className="space-y-6 p-6">
                  <div className="overflow-hidden rounded-md border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                      <h3 className="font-medium text-blue-800 dark:text-blue-300">
                        Visitor Information
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          User Name
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                          {selectedVisitor.userId?.name || "Anonymous"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Email
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200 break-all">
                          {selectedVisitor.userId?.email || "N/A"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Device ID
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                          {selectedVisitor.deviceId || "N/A"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          IP Address
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                          {selectedVisitor.ipAddress}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-md border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                      <h3 className="font-medium text-blue-800 dark:text-blue-300">
                        Visit History
                      </h3>
                    </div>
                    <div className="no-scrollbar overflow-x-auto">
                      <Table className="w-full text-black dark:text-white">
                        <TableHeader>
                          <TableRow className="border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                            <TableHead className="py-3">Session ID</TableHead>
                            <TableHead className="py-3">Page URL</TableHead>
                            <TableHead className="py-3">Visit Time</TableHead>
                            <TableHead className="py-3">Duration</TableHead>
                            <TableHead className="py-3">User Agent</TableHead>
                            <TableHead className="py-3">Referrer</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getUserVisits(selectedVisitor).length > 0 ? (
                            getUserVisits(selectedVisitor).map((visit: Visitor) => (
                              <TableRow
                                key={visit._id}
                                className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-800"
                              >
                                <TableCell>
                                  {visit.sessionId.substring(0, 8)}...
                                </TableCell>
                                <TableCell className="break-all">
                                  {visit.pageUrl}
                                </TableCell>
                                <TableCell>
                                  {formatDate(visit.visitTime)}
                                </TableCell>
                                <TableCell>
                                  {formatDuration(visit.duration)}
                                </TableCell>
                                <TableCell className="break-all">
                                  {visit.userAgent || "N/A"}
                                </TableCell>
                                <TableCell className="break-all">
                                  {visit.referrer || "Direct"}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="h-32 text-center">
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
                                    <p className="text-base font-medium">No visits found</p>
                                    <p className="text-sm">No additional visits recorded for this user.</p>
                                  </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center">
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      No visitor selected.
                    </p>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <div className="mt-6 rounded-md bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {startIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {Math.min(startIndex + visitorsPerPage, filteredVisitors.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {filteredVisitors.length}
                  </span>{" "}
                  visitors
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

export default VisitorsPage;