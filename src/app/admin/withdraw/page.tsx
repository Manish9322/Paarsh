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
  Wallet,
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

// Hypothetical API hooks for withdrawal requests
import { useDeleteWithdrawalRequestMutation, useFetchWithdrawalRequestQuery, useUpdateWithdrawalRequestMutation } from "@/services/api";

// Define WithdrawalRequest type based on schema
interface WithdrawalRequest {
  _id: string;
  userId: string; // ObjectId as string
  amount: number;
  upiId: string;
  status: "Pending" | "Approved" | "Rejected";
  paymentReferenceId: string;
  requestedAt: string;
  processedAt?: string;
}

const WithdrawalRequestsPage: React.FC = () => {
  const [sortField, setSortField] = useState<keyof WithdrawalRequest | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: withdrawals, isLoading: isWithdrawalsLoading } = useFetchWithdrawalRequestQuery(undefined);
  const withdrawalRequests = withdrawals?.data || [];

  const [deleteWithdrawalRequest, { isLoading: isDeleting }] = useDeleteWithdrawalRequestMutation();
  const [updateWithdrawalRequestStatus, { isLoading: isUpdating }] = useUpdateWithdrawalRequestMutation();

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

  // Simulate initial loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const withdrawalRequestsPerPage = 10;

  const handleSort = (field: keyof WithdrawalRequest) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredRequests = withdrawalRequests.filter((request) =>
    Object.values(request).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }
    return sortOrder === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const totalPages = Math.ceil(sortedRequests.length / withdrawalRequestsPerPage);
  const displayedRequests = sortedRequests.slice(
    (currentPage - 1) * withdrawalRequestsPerPage,
    currentPage * withdrawalRequestsPerPage
  );

  const confirmDeleteRequest = (requestId: string) => {
    setRequestToDelete(requestId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteRequest = async () => {
    try {
      if (!requestToDelete) return;
      const response = await deleteWithdrawalRequest(requestToDelete).unwrap();
      if (response.success) {
        toast.success("Withdrawal request deleted successfully");
        setDeleteConfirmOpen(false);
        setRequestToDelete(null);
      } else {
        toast.error("Failed to delete the withdrawal request. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting withdrawal request:", error);
      toast.error("Failed to delete the withdrawal request. Please try again.");
    }
  };

  const handleUpdateStatus = async (id: string, status: "Approved" | "Rejected") => {
    try {
      const response = await updateWithdrawalRequestStatus({ id, status }).unwrap();
      if (response.success) {
        setViewOpen(false);
        toast.success("Withdrawal request status updated successfully");
      } else {
        toast.error(  response.message || "Failed to update the withdrawal request status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating withdrawal request status:", error);
      toast.error( "Failed to update the withdrawal request status. Please try again.");
    }
  };

  const handleView = (request: WithdrawalRequest) => {
    setSelectedRequest(request);
    setViewOpen(true);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "Approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "Rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  const startIndex = (currentPage - 1) * withdrawalRequestsPerPage;

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

      if (startPage > 2) {
        pageNumbers.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

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
        <h1 className="text-lg font-bold text-gray-800">Withdrawal Requests</h1>
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
            <h1 className="text-xl font-bold md:hidden">Dashboard</h1>
          </div>
          <div className="custom-scrollbar flex-1 overflow-y-auto">
            <Sidebar />
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-16 md:ml-64">
        <div className="container mx-auto px-4 py-6">
          {/* Page Header */}
          <div className="mb-6 flex flex-col justify-between md:flex-row md:items-center">
            <h1 className="text-2xl font-bold">Withdrawal Requests</h1>
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
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{withdrawalRequests.length}</div>
                <p className="text-xs text-muted-foreground">+3 from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {withdrawalRequests.filter((r) => r.status === "Pending").length}
                </div>
                <p className="text-xs text-muted-foreground">+2 from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {withdrawalRequests.filter((r) => r.status === "Approved").length}
                </div>
                <p className="text-xs text-muted-foreground">+5 this month</p>
              </CardContent>
            </Card>
          </div>

          {/* Withdrawal Requests Table */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Recent Withdrawal Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading || isWithdrawalsLoading ? (
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
                          <TableHead className="w-[100px]">ID</TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("userId")}
                          >
                            <div className="flex items-center gap-2">
                              User ID
                              {sortField === "userId" &&
                                (sortOrder === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                ))}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("amount")}
                          >
                            <div className="flex items-center gap-2">
                              Amount
                              {sortField === "amount" &&
                                (sortOrder === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                ))}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("upiId")}
                          >
                            <div className="flex items-center gap-2">
                              UPI ID
                              {sortField === "upiId" &&
                                (sortOrder === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                ))}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("status")}
                          >
                            <div className="flex items-center gap-2">
                              Status
                              {sortField === "status" &&
                                (sortOrder === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                ))}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("requestedAt")}
                          >
                            <div className="flex items-center gap-2">
                              Requested At
                              {sortField === "requestedAt" &&
                                (sortOrder === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                ))}
                            </div>
                          </TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayedRequests.length > 0 ? (
                          displayedRequests.map((request, index) => (
                            <TableRow key={request._id}>
                              <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                              <TableCell>{request.userId}</TableCell>
                              <TableCell>{formatCurrency(request.amount)}</TableCell>
                              <TableCell>{request.upiId}</TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                              <TableCell>{formatDate(request.requestedAt)}</TableCell>
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
                            <TableCell colSpan={7} className="h-24 text-center">
                              No withdrawal requests found
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
                            variant={pageNum === currentPage ? "default" : "outline"}
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
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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

      {/* View Withdrawal Request Dialog */}
      {selectedRequest && (
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="md:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Withdrawal Request Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="font-medium">{selectedRequest.userId}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="font-medium">{formatCurrency(selectedRequest.amount)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">UPI ID</p>
                  <p className="font-medium">{selectedRequest.upiId}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Payment Reference ID</p>
                  <p className="font-medium">{selectedRequest.paymentReferenceId || "N/A"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Requested At</p>
                  <p className="font-medium">{formatDate(selectedRequest.requestedAt)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Processed At</p>
                  <p className="font-medium">{formatDate(selectedRequest.processedAt)}</p>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedRequest._id, "Approved")}
                  disabled={isUpdating}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedRequest._id, "Rejected")}
                  disabled={isUpdating}
                >
                  Reject
                </Button>
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
            <p>Are you sure you want to delete this withdrawal request? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRequest} disabled={isDeleting}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WithdrawalRequestsPage;