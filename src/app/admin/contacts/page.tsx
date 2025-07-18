"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronUp,
  ChevronDown,
  Eye,
  Trash2,
  Menu,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminSkeletonWrapper } from "@/components/ui/admin-skeleton-wrapper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useDeleteContactMutation, useFetchContactsQuery, useUpdateContactStatusMutation } from "@/services/api";
import { RxCross2 } from "react-icons/rx";

// Define ContactRequest type
interface ContactRequest {
  _id: string;
  id: number;
  name: string;
  email: string;
  message: string;
  subject?: string;
  mobile?: string;
  status: "pending" | "resolved" | "in-progress";
  createdAt: string;
}

const ContactRequestsPage: React.FC = () => {
  const [sortField, setSortField] = useState<keyof ContactRequest | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [contactRequestsPerPage, setContactRequestsPerPage] = useState<number | "all">(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const { data: contacts, isLoading: isContactsLoading } = useFetchContactsQuery(undefined);
  const mockContactRequests = contacts?.data || [];

  const [_DELETECONTACT, { isLoading: isDeleting }] = useDeleteContactMutation();
  const [_UPDATECONTACTSTATUS, { isLoading: isUpdating }] = useUpdateContactStatusMutation();

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Simulate loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSort = (field: keyof ContactRequest) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredRequests = mockContactRequests.filter((request) =>
    Object.values(request).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (!sortField) return 0;
    return sortOrder === "asc"
      ? a[sortField] > b[sortField]
        ? 1
        : -1
      : a[sortField] < b[sortField]
        ? 1
        : -1;
  });

  const totalPages = contactRequestsPerPage === "all" ? 1 : Math.ceil(sortedRequests.length / contactRequestsPerPage);
  const startIndex = contactRequestsPerPage === "all" ? 0 : (currentPage - 1) * contactRequestsPerPage;
  const displayedRequests = contactRequestsPerPage === "all"
    ? sortedRequests
    : sortedRequests.slice(
      startIndex,
      startIndex + contactRequestsPerPage
    );

  const confirmDeleteRequest = (requestId: string) => {
    setRequestToDelete(requestId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteRequest = async () => {
    try {
      if (!requestToDelete) return;
      const response = await _DELETECONTACT(requestToDelete);
      if (response.data.success) {
        toast.success("Contact request deleted successfully");
        setDeleteConfirmOpen(false);
        setRequestToDelete(null);
      } else {
        toast.error("Failed to delete the contact request. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting contact request:", error);
      toast.error("Failed to delete the contact request. Please try again.");
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const response = await _UPDATECONTACTSTATUS({ id, status });
    if (response.data.success) {
      setViewOpen(false);
      toast.success("Contact request status updated successfully");
    } else {
      toast.error("Failed to update the contact request status. Please try again.");
    }
  };

  // Handle View
  const handleView = (request: ContactRequest) => {
    setSelectedRequest(request);
    setViewOpen(true);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <Badge className="bg-gray-300 text-black hover:bg-gray-400 dark:bg-gray-700 dark:text-white">
            Pending
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-300 hover:bg-green-400 text-black dark:bg-green-700 dark:text-white">
            Resolved
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-blue-300 hover:bg-blue-400 text-black dark:bg-blue-700 dark:text-white">
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            Unknown
          </Badge>
        );
    }
  };

  // Function to generate page numbers for pagination
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

  return (
    <div className="flex min-h-screen">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
        <button
          onClick={toggleSidebar}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Contact Requests</h1>
        <div className="w-10"></div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:sticky md:translate-x-0`}
      >
        <div className="h-16 md:h-0"></div>
        <Sidebar userRole="admin" />
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden pt-16">
        <div className="container mx-auto px-4 py-6">
          <Card className="mb-6 overflow-hidden border-none bg-white shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Contact Requests
                </CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                  <Input
                    placeholder="Search requests..."
                    className="h-10 w-full rounded-md border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 dark:bg-gray-800">
              {/* Stats Cards */}
              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <div className="overflow-hidden rounded-md bg-white shadow transition-all hover:shadow-md dark:bg-gray-900">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Requests
                        </h3>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          {mockContactRequests.length.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-md bg-white shadow transition-all hover:shadow-md dark:bg-gray-900">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Pending Requests
                        </h3>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          {mockContactRequests
                            .filter((r) => r.status === "pending")
                            .length.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-md bg-white shadow transition-all hover:shadow-md dark:bg-gray-900">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Resolved Requests
                        </h3>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          {mockContactRequests
                            .filter((r) => r.status === "resolved")
                            .length.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto no-scrollbar">
                <Table className="w-full text-black dark:text-white">
                  <TableHeader>
                    <TableRow className="border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                      <TableHead
                        className="hidden py-3 text-center sm:table-cell"
                        onClick={() => handleSort("id")}
                      >
                        <div className="flex items-center justify-center gap-2">
                          #
                          {sortField === "id" ? (
                            sortOrder === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : null}
                        </div>
                      </TableHead>
                      <TableHead className="py-3" onClick={() => handleSort("name")}>
                        <div className="flex items-center gap-2">
                          Name
                          {sortField === "name" ? (
                            sortOrder === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : null}
                        </div>
                      </TableHead>
                      <TableHead className="py-3" onClick={() => handleSort("email")}>
                        <div className="flex items-center gap-2">
                          Email
                          {sortField === "email" ? (
                            sortOrder === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : null}
                        </div>
                      </TableHead>
                      <TableHead className="py-3" onClick={() => handleSort("message")}>
                        <div className="flex items-center gap-2">Message</div>
                      </TableHead>
                      <TableHead className="hidden py-3 lg:table-cell" onClick={() => handleSort("status")}>
                        <div className="flex items-center gap-2">
                          Status
                          {sortField === "status" ? (
                            sortOrder === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : null}
                        </div>
                      </TableHead>
                      <TableHead className="hidden py-3 lg:table-cell" onClick={() => handleSort("createdAt")}>
                        <div className="flex items-center gap-2">
                          Date
                          {sortField === "createdAt" ? (
                            sortOrder === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : null}
                        </div>
                      </TableHead>
                      <TableHead className="py-3 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index} className="animate-pulse">
                          <TableCell className="hidden sm:table-cell">
                            <Skeleton className="h-5 w-6" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-full max-w-[100px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-full max-w-[150px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-full max-w-[200px]" />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Skeleton className="h-5 w-20" />
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-1">
                              <Skeleton className="h-8 w-8 rounded-full" />
                              <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : displayedRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="text-gray-400 dark:text-gray-500">
                              <Mail className="mx-auto h-12 w-12" />
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              <p className="text-base font-medium">No contact requests found</p>
                              <p className="text-sm">
                                {searchTerm
                                  ? "Try adjusting your search criteria"
                                  : "No contact requests available"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedRequests.map((request, index) => (
                        <TableRow
                          key={request._id}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <TableCell className="hidden text-center font-medium sm:table-cell">
                            {startIndex + index + 1}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{request.name}</p>
                            <p className="mt-1 text-xs text-gray-500 lg:hidden">
                              {getStatusBadge(request.status)}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 sm:hidden">
                              {formatDate(request.createdAt)}
                            </p>
                          </TableCell>
                          <TableCell>{request.email}</TableCell>
                          <TableCell>{request.message}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {formatDate(request.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                onClick={() => handleView(request)}
                                aria-label="View contact details"
                              >
                                <Eye size={16} className="transition-transform group-hover:scale-110" />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  View details
                                </span>
                              </button>
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-blue-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                onClick={() => confirmDeleteRequest(request._id)}
                                aria-label="Delete contact"
                              >
                                <Trash2 size={16} className="transition-transform group-hover:scale-110" />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  Delete contact
                                </span>
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {displayedRequests.length > 0 && (
            <div className="mt-6 rounded-md bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {contactRequestsPerPage === "all" ? 1 : startIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {contactRequestsPerPage === "all" ? sortedRequests.length : Math.min(startIndex + contactRequestsPerPage, sortedRequests.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {sortedRequests.length}
                  </span>{" "}
                  requests

                  <div className="flex items-center space-x-2 pt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                    <Select
                      value={contactRequestsPerPage.toString()}
                      onValueChange={(value) => {
                        setContactRequestsPerPage(value === "all" ? "all" : parseInt(value));
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
                        <span key={`ellipsis-${index}`} className="px-1 text-gray-400">...</span>
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
                  <span className="text-sm text-gray-500 dark:text-gray-400">Go to page:</span>
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
                    className="h-8 w-16 rounded-md border-gray-300 text-center text-sm dark:border-gray-700 dark:text-white dark:bg-gray-800"
                    aria-label="Go to page"
                  />
                </div>
              </div>
            </div>)}
        </div>
      </main>

      {/* View Contact Request Dialog */}
      {selectedRequest && (
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="no-scrollbar max-h-[90vh] max-w-md overflow-y-auto rounded-md bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
            <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                  Contact Request Details
                </DialogTitle>
                <RxCross2
                  className="text-gray-800 dark:text-white"
                  size={20}
                  onClick={() => setViewOpen(false)}
                />
              </div>
            </DialogHeader>
            <div className="p-6 space-y-6">
              <div className="overflow-hidden rounded-md border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300">
                    Contact Information
                  </h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  <div className="grid grid-cols-3 px-4 py-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Name
                    </span>
                    <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                      {selectedRequest.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 px-4 py-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </span>
                    <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                      {selectedRequest.email}
                    </span>
                  </div>
                  {selectedRequest.mobile && (
                    <div className="grid grid-cols-3 px-4 py-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Mobile
                      </span>
                      <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                        {selectedRequest.mobile}
                      </span>
                    </div>
                  )}
                  {selectedRequest.subject && (
                    <div className="grid grid-cols-3 px-4 py-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Subject
                      </span>
                      <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                        {selectedRequest.subject}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 px-4 py-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </span>
                    <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                      {getStatusBadge(selectedRequest.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 px-4 py-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Date
                    </span>
                    <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                      {formatDate(selectedRequest.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="overflow-hidden rounded-md border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300">
                    Message
                  </h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-900 dark:text-gray-200 whitespace-pre-wrap">
                    {selectedRequest.message}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="sticky bottom-0 z-10 border-t bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:gap-0">
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedRequest._id, "resolved")}
                    className="w-full sm:w-auto"
                  >
                    Mark as Resolved
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedRequest._id, "in-progress")}
                    className="w-full sm:w-auto"
                  >
                    In Progress
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setViewOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Close
                  </Button>


                </div>



              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <Trash2 className="mx-auto mb-4 h-12 w-12 text-red-500 dark:text-red-400" />
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this contact request? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRequest}
              className="w-full sm:w-auto"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>
        {`
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
        `}
      </style>
    </div>
  );
};

export default ContactRequestsPage;