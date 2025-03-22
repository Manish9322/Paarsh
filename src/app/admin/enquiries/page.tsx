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
        return <Badge className="bg-yellow-500">Pending</Badge>;
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
    <div className="flex h-full min-h-screen w-full">
      {/* Sidebar for larger screens */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Mobile Header with Menu Toggle */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:hidden">
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Enquiries</h1>
          <div className="w-8"></div> {/* Empty space for balance */}
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-gray-900 bg-opacity-50"
              onClick={toggleSidebar}
            ></div>
            <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg dark:bg-gray-800">
              <Sidebar />
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 hidden md:block">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Enquiries</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage and respond to customer enquiries
            </p>
          </div>

          {/* Search & Filter */}
          <div className="mb-6 flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4">
            <div className="relative w-full sm:max-w-xs">
              <Input
                type="text"
                placeholder="Search enquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* Enquiries Card */}
          <Card>
            <CardHeader className="px-6 py-4">
              <CardTitle>All Enquiries</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <AdminSkeletonWrapper>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center p-4">
                      <div className="grow">
                        <Skeleton className="mb-2 h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <div className="flex shrink-0 space-x-2">
                        <Skeleton className="h-9 w-9 rounded" />
                        <Skeleton className="h-9 w-9 rounded" />
                      </div>
                    </div>
                  ))}
                </AdminSkeletonWrapper>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("name")}
                          >
                            <div className="flex items-center">
                              Name
                              {sortField === "name" && (
                                <span className="ml-1">
                                  {sortOrder === "asc" ? (
                                    <ChevronUp size={16} />
                                  ) : (
                                    <ChevronDown size={16} />
                                  )}
                                </span>
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("email")}
                          >
                            <div className="flex items-center">
                              Email
                              {sortField === "email" && (
                                <span className="ml-1">
                                  {sortOrder === "asc" ? (
                                    <ChevronUp size={16} />
                                  ) : (
                                    <ChevronDown size={16} />
                                  )}
                                </span>
                              )}
                            </div>
                          </TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("status")}
                          >
                            <div className="flex items-center">
                              Status
                              {sortField === "status" && (
                                <span className="ml-1">
                                  {sortOrder === "asc" ? (
                                    <ChevronUp size={16} />
                                  ) : (
                                    <ChevronDown size={16} />
                                  )}
                                </span>
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("createdAt")}
                          >
                            <div className="flex items-center">
                              Date
                              {sortField === "createdAt" && (
                                <span className="ml-1">
                                  {sortOrder === "asc" ? (
                                    <ChevronUp size={16} />
                                  ) : (
                                    <ChevronDown size={16} />
                                  )}
                                </span>
                              )}
                            </div>
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayedEnquiries.length > 0 ? (
                          displayedEnquiries.map((enquiry) => (
                            <TableRow
                              key={enquiry._id}
                              className="group hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <TableCell className="font-medium">{enquiry.name}</TableCell>
                              <TableCell>{enquiry.email}</TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {enquiry.subject}
                              </TableCell>
                              <TableCell>{getStatusBadge(enquiry.status)}</TableCell>
                              <TableCell>
                                {formatDate(enquiry.createdAt)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleView(enquiry)}
                                    title="View"
                                  >
                                    <Eye size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openStatusUpdate(enquiry)}
                                    title="Change Status"
                                  >
                                    <Clock size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => confirmDeleteEnquiry(enquiry._id)}
                                    className="text-red-500 hover:text-red-700"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="h-24 text-center text-gray-500"
                            >
                              {searchTerm
                                ? "No enquiries found matching your search criteria"
                                : "No enquiries found"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 0 && (
                    <div className="flex items-center justify-between border-t px-4 py-4 sm:px-6">
                      <div className="hidden sm:block">
                        <p className="text-sm text-gray-700 dark:text-gray-400">
                          Showing <span className="font-medium">{(currentPage - 1) * enquiriesPerPage + 1}</span> to{" "}
                          <span className="font-medium">
                            {Math.min(currentPage * enquiriesPerPage, sortedEnquiries.length)}
                          </span>{" "}
                          of <span className="font-medium">{sortedEnquiries.length}</span> results
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft size={16} />
                        </Button>
                        <div className="hidden sm:flex sm:items-center sm:space-x-2">
                          {generatePaginationNumbers().map((page, index) => (
                            <React.Fragment key={index}>
                              {page === "..." ? (
                                <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                              ) : (
                                <Button
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  className={`w-9 ${currentPage === page ? "bg-blue-500" : "bg-transparent"}`}
                                  onClick={() => typeof page === "number" && setCurrentPage(page)}
                                >
                                  {page}
                                </Button>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Enquiry Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <h3 className="mb-2 font-semibold">{selectedEnquiry.subject}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEnquiry.message}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300">
                    {selectedEnquiry.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-medium">{selectedEnquiry.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(selectedEnquiry.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <Mail size={16} className="text-gray-500 dark:text-gray-400" />
                  <span>{selectedEnquiry.email}</span>
                </div>
                
                {selectedEnquiry.mobile && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone size={16} className="text-gray-500 dark:text-gray-400" />
                    <span>{selectedEnquiry.mobile}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-medium">Status:</span>
                  <span>{getStatusBadge(selectedEnquiry.status)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setViewOpen(false);
              selectedEnquiry && openStatusUpdate(selectedEnquiry);
            }}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this enquiry? This action cannot be undone.</p>
          </div>
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEnquiry}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Enquiry Status</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="mb-2 block text-sm font-medium">Status</label>
            <Select 
              value={newStatus} 
              onValueChange={(value) => setNewStatus(value as "pending" | "resolved" | "in-progress")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setStatusUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnquiriesPage;