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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminSkeletonWrapper } from "@/components/ui/admin-skeleton-wrapper";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Define Enquiry type
interface Enquiry {
  _id: string;
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  mobile: string;
  status: "pending" | "resolved" | "in-progress";
  createdAt: string;
}

const EnquiriesPage: React.FC = () => {
  const [sortField, setSortField] = useState<keyof Enquiry | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<"pending" | "resolved" | "in-progress">("pending");

  // Fetch enquiries
  useEffect(() => {
    const fetchEnquiries = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/enquiries");
        const result = await response.json();
        if (result.success) {
          setEnquiries(result.data);
        } else {
          toast.error(result.message || "Failed to fetch enquiries");
        }
      } catch (error) {
        console.error("Error fetching enquiries:", error);
        toast.error("Something went wrong while fetching enquiries");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnquiries();
  }, []);

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

  const enquiriesPerPage = 10;

  const handleSort = (field: keyof Enquiry) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredEnquiries = enquiries.filter((enquiry) =>
    Object.values(enquiry).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const sortedEnquiries = [...filteredEnquiries].sort((a, b) => {
    if (!sortField) return 0;
    return sortOrder === "asc"
      ? a[sortField] > b[sortField]
        ? 1
        : -1
      : a[sortField] < b[sortField]
        ? 1
        : -1;
  });

  const totalPages = Math.ceil(sortedEnquiries.length / enquiriesPerPage);
  const displayedEnquiries = sortedEnquiries.slice(
    (currentPage - 1) * enquiriesPerPage,
    currentPage * enquiriesPerPage,
  );

  const confirmDeleteEnquiry = (enquiryId: string) => {
    setEnquiryToDelete(enquiryId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteEnquiry = async () => {
    try {
      if (!enquiryToDelete) return;
      
      // Make API request to delete enquiry
      const response = await fetch(`/api/enquiries?id=${enquiryToDelete}`, {
        method: "DELETE",
      });
      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setEnquiries(enquiries.filter(enquiry => enquiry._id !== enquiryToDelete));
        toast.success("Enquiry deleted successfully");
      } else {
        toast.error(result.message || "Failed to delete enquiry");
      }
      
      setDeleteConfirmOpen(false);
      setEnquiryToDelete(null);
    } catch (error) {
      console.error("Error deleting enquiry:", error);
      toast.error("Something went wrong while deleting the enquiry");
    }
  };

  // Handle View
  const handleView = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setViewOpen(true);
  };

  // Handle Status Update
  const openStatusUpdate = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setNewStatus(enquiry.status);
    setStatusUpdateOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedEnquiry) return;
    
    try {
      // Make API request to update status
      const response = await fetch("/api/enquiries", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedEnquiry._id,
          status: newStatus,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setEnquiries(
          enquiries.map((enquiry) =>
            enquiry._id === selectedEnquiry._id
              ? { ...enquiry, status: newStatus }
              : enquiry
          )
        );
        toast.success("Status updated successfully");
      } else {
        toast.error(result.message || "Failed to update status");
      }
      
      setStatusUpdateOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Something went wrong while updating the status");
    }
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
    switch (status) {
      case "pending":
        return <Badge className="bg-black/50 dark:bg-black/80 dark:text-gray-400">Pending</Badge>;
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  // Function to generate page numbers for pagination
  const generatePaginationNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show at most 5 page numbers

    if (totalPages <= maxPagesToShow) {
      // If total pages are less than max to show, display all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);

      // Calculate start and end of page numbers to show
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - maxPagesToShow + 2);
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always include last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
        <button
          onClick={toggleSidebar}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Enquiries</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-0 z-40 h-screen w-64 transform overflow-y-auto bg-white shadow-lg transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:sticky md:top-0 md:translate-x-0 md:h-screen`}
        >
          <div className="h-16 md:h-0"></div>
          <Sidebar  userRole="admin" />
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
        <main className="w-full flex-1 overflow-x-hidden pt-16 dark:bg-gray-900">
          <div className="container mx-auto px-4 py-6">
            <Card className="mb-6 overflow-hidden border-none bg-white shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                    Enquiries Management
                  </CardTitle>
                  <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                    <Input
                      type="text"
                      placeholder="Search enquiries..."
                      className="h-10 w-full rounded border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 md:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b dark:border-b-gray-900 border-gray-200 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900">
                        <TableHead className="py-3">
                          <div className="flex items-center">
                            Name
                            {sortField === "name" && (
                              <span className="ml-1">
                                {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="py-3">
                          <div className="flex items-center">
                            Email
                            {sortField === "email" && (
                              <span className="ml-1">
                                {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="hidden py-3 lg:table-cell">Subject</TableHead>
                        <TableHead className="hidden py-3 xl:table-cell">Status</TableHead>
                        <TableHead className="py-3">
                          <div className="flex items-center">
                            Date
                            {sortField === "createdAt" && (
                              <span className="ml-1">
                                {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="py-3 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array.from({ length: 7 }).map((_, index) => (
                          <TableRow key={index} className="border-b border-gray-100">
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : displayedEnquiries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-6 text-center text-gray-500">
                            No enquiries found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        displayedEnquiries.map((enquiry) => (
                          <TableRow
                            key={enquiry._id}
                            className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800"
                          >
                            <TableCell>
                              <div className="md:hidden">
                                <p className="font-medium">{enquiry.name}</p>
                                <p className="mt-1 text-xs text-gray-500">{enquiry.email}</p>
                                <p className="mt-1 text-xs text-gray-500">{enquiry.subject}</p>
                              </div>
                              <span className="hidden font-medium md:inline">{enquiry.name}</span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{enquiry.email}</TableCell>
                            <TableCell className="hidden lg:table-cell">{enquiry.subject}</TableCell>
                            <TableCell className="hidden xl:table-cell">{getStatusBadge(enquiry.status)}</TableCell>
                            <TableCell>{formatDate(enquiry.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                  onClick={() => handleView(enquiry)}
                                  aria-label="View enquiry details"
                                >
                                  <Eye size={16} className="transition-transform group-hover:scale-110" />
                                </button>
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                  onClick={() => openStatusUpdate(enquiry)}
                                  aria-label="Update enquiry status"
                                >
                                  <Clock size={16} className="transition-transform group-hover:scale-110" />
                                </button>
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                  onClick={() => confirmDeleteEnquiry(enquiry._id)}
                                  aria-label="Delete enquiry"
                                >
                                  <Trash2 size={16} className="transition-transform group-hover:scale-110" />
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
            <div className="mt-6 rounded bg-white p-4 shadow-md dark:bg-gray-800">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="text-sm text-gray-500 dark:text-white">
                  Showing <span className="font-medium text-gray-700">{(currentPage - 1) * enquiriesPerPage + 1}</span> to{" "}
                  <span className="font-medium text-gray-700">
                    {Math.min(currentPage * enquiriesPerPage, sortedEnquiries.length)}
                  </span>{" "}
                  of <span className="font-medium text-gray-700">{sortedEnquiries.length}</span> enquiries
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 rounded bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="hidden sm:flex sm:items-center sm:space-x-1">
                    {generatePaginationNumbers().map((page, index) => (
                      typeof page === 'number' ? (
                        <Button
                          key={index}
                          onClick={() => setCurrentPage(page)}
                          className={`h-8 w-8 rounded p-0 text-sm font-medium ${
                            currentPage === page
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          }`}
                        >
                          {page}
                        </Button>
                      ) : (
                        <span key={index} className="px-2 text-gray-400">
                          {page}
                        </span>
                      )
                    ))}
                  </div>

                  <Button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 rounded bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="hidden items-center space-x-2 lg:flex">
                  <span className="text-sm text-gray-500 dark:text-white">Go to page:</span>
                  <Input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= totalPages) {
                        setCurrentPage(value);
                      }
                    }}
                    className="h-8 w-16 rounded border-gray-300 text-center text-sm dark:text-white dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
          <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:bg-gray-800 dark:border-gray-700">
            <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
              Enquiry Details
            </DialogTitle>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="p-6 space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-500 dark:text-gray-400">Personal Information</h3>
                  <div className="rounded border p-4 dark:border-gray-700">
                    <div className="grid gap-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Name:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedEnquiry.name}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedEnquiry.email}</span>
                      </div>
                      {selectedEnquiry.mobile && (
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedEnquiry.mobile}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-500 dark:text-gray-400">Enquiry Details</h3>
                  <div className="rounded border p-4 dark:border-gray-700">
                    <div className="grid gap-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedEnquiry.subject}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                        <span className="ml-2">{getStatusBadge(selectedEnquiry.status)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Date:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{formatDate(selectedEnquiry.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-500 dark:text-gray-400">Message</h3>
                  <div className="rounded border p-4 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedEnquiry.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
              Are you sure you want to delete this enquiry? This action cannot be undone.
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
              onClick={handleDeleteEnquiry}
              className="w-full sm:w-auto"
            >
              Delete Enquiry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
        <DialogContent className="sm:max-w-[450px] dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">Update Enquiry Status</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Current Status</h3>
                <div className="w-fit dark:text-white">{selectedEnquiry && getStatusBadge(selectedEnquiry.status)}</div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">New Status</h3>
                <Select
                  value={newStatus} 
                  onValueChange={(value) => setNewStatus(value as "pending" | "resolved" | "in-progress")}
                >
                  <SelectTrigger className="w-full ">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-black/80">Pending</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="in-progress">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-500">In Progress</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="resolved">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500">Resolved</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStatusUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} className="bg-blue-600 hover:bg-blue-700 dark:bg-white/80 dark:hover:bg-white/70">
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Scrollbar Styling */}
      <style jsx global>{`
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

export default EnquiriesPage;