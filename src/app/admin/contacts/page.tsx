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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useDeleteContactMutation, useFetchContactsQuery, useUpdateContactStatusMutation } from "@/services/api";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: contacts, isLoading: isContactsLoading } = useFetchContactsQuery(undefined);
  console.log(contacts);
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

  const contactRequestsPerPage = 10;

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

  const totalPages = Math.ceil(sortedRequests.length / contactRequestsPerPage);
  const displayedRequests = sortedRequests.slice(
    (currentPage - 1) * contactRequestsPerPage,
    currentPage * contactRequestsPerPage,
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
    const response = await _UPDATECONTACTSTATUS({id, status});
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
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow">Pending</Badge>;
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  const startIndex = (currentPage - 1) * contactRequestsPerPage;
  const endIndex = startIndex + contactRequestsPerPage;

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

      // Add ellipsis if needed before middle pages
      if (startPage > 2) {
        pageNumbers.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis if needed after middle pages
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always include last page if there is more than one page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header with Menu Button */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
        <button
          onClick={toggleSidebar}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Contact Requests</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Sidebar - fixed position with proper scrolling */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between px-4 md:justify-end">
            <h1 className="text-xl font-bold md:hidden">Dashboard</h1>
          </div>

          {/* Sidebar Content - Scrollable */}
          <div className="custom-scrollbar flex-1 overflow-y-auto">
            <Sidebar />
          </div>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto pt-16 md:ml-64">
        <div className="container mx-auto px-4 py-6">
          {/* Page Header */}
          <div className="mb-6 flex flex-col justify-between md:flex-row md:items-center">
            <h1 className="text-2xl font-bold">Contact Requests</h1>
            <div className="mt-4 md:mt-0">
              <Input
                placeholder="Search requests..."
                className="w-full md:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Requests
                </CardTitle>
                <Eye
                  className="h-4 w-4 text-muted-foreground"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockContactRequests.length}</div>
                <p className="text-xs text-muted-foreground">
                  +3 from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Requests
                </CardTitle>
                <Clock
                  className="h-4 w-4 text-muted-foreground"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockContactRequests.filter(r => r.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  +2 from yesterday
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Resolved Requests
                </CardTitle>
                <Mail
                  className="h-4 w-4 text-muted-foreground"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockContactRequests.filter(r => r.status === "resolved").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  +5 this month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Recent Contact Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <AdminSkeletonWrapper>
                  <div className="mb-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </AdminSkeletonWrapper>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-800">
                          <TableHead
                            className="w-[100px] cursor-pointer"
                            onClick={() => handleSort("id")}
                          >
                            <div className="flex items-center gap-2">
                              ID
                              {sortField === "id" ? (
                                sortOrder === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )
                              ) : null}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("name")}
                          >
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
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("email")}
                          >
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
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("message")}
                          >
                            <div className="flex items-center gap-2">
                              Message
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("status")}
                          >
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
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("createdAt")}
                          >
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
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayedRequests.length > 0 ? (
                          displayedRequests.map((request, index) => (
                            <TableRow key={request._id}>
                              <TableCell className="font-medium">
                                {startIndex + index + 1}
                              </TableCell>
                              <TableCell>{request.name}</TableCell>
                              <TableCell>{request.email}</TableCell>
                              <TableCell>{request.message}</TableCell>
                              <TableCell>
                                {getStatusBadge(request.status)}
                              </TableCell>
                              <TableCell>
                                {formatDate(request.createdAt)}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleView(request)}
                                    title="View details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => confirmDeleteRequest(request._id)}
                                    title="Delete"
                                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="h-24 text-center"
                            >
                              No contact requests found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {displayedRequests.length > 0 && (
                    <div className="mt-6 flex justify-center">
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {generatePaginationNumbers().map((pageNum, index) => (
                          <Button
                            key={index}
                            variant={
                              pageNum === currentPage ? "default" : "outline"
                            }
                            onClick={() => {
                              if (typeof pageNum === "number") {
                                setCurrentPage(pageNum);
                              }
                            }}
                            disabled={pageNum === "..."}
                            className={pageNum === "..." ? "cursor-default" : ""}
                          >
                            {pageNum}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setCurrentPage(Math.min(totalPages, currentPage + 1))
                          }
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* View Contact Request Dialog */}
      {selectedRequest && (
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="md:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Contact Request Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="font-medium">{selectedRequest.name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="font-medium">{selectedRequest.email}</p>
                </div>
                {selectedRequest.mobile && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Mobile</p>
                    <p className="font-medium">{selectedRequest.mobile}</p>
                  </div>
                )}
                {selectedRequest.subject && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Subject</p>
                    <p className="font-medium">{selectedRequest.subject}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(selectedRequest.createdAt)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Message</p>
                <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="whitespace-pre-wrap">{selectedRequest.message}</p>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => handleUpdateStatus(selectedRequest._id, "resolved")}>Mark as Resolved</Button>
                <Button variant="outline" onClick={() => handleUpdateStatus(selectedRequest._id, "in-progress")}>In Progress</Button>
              </div>
              <Button variant="outline" onClick={() => setViewOpen(false)}>
                Close
              </Button>           
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p>Are you sure you want to delete this contact request? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRequest}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactRequestsPage; 