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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useFetchEnquiriesQuery, useDeleteEnquiryMutation } from "@/services/api";

// Define Enquiry type
interface Enquiry {
  _id: string;
  name: string;
  email: string;
  mobile: string;
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
  const [enquiriesPerPage, setEnquiriesPerPage] = useState<number | "all">(10);

  // Fetch enquiries using RTK Query
  const { data: enquiriesData, isLoading, error } = useFetchEnquiriesQuery(undefined);
  const [deleteEnquiry] = useDeleteEnquiryMutation();

  // Handle fetch errors
  if (error) {
    toast.error("Something went wrong while fetching enquiries");
  }

  const enquiries: Enquiry[] = enquiriesData?.data || [];

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

  const handleSort = (field: keyof Enquiry) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredEnquiries = enquiries.filter((enquiry) =>
    Object.values(enquiry).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
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

  const totalPages =
    enquiriesPerPage === "all" ? 1 : Math.ceil(sortedEnquiries.length / enquiriesPerPage);
  const startIndex = enquiriesPerPage === "all" ? 0 : (currentPage - 1) * enquiriesPerPage;
  const displayedEnquiries =
    enquiriesPerPage === "all"
      ? sortedEnquiries
      : sortedEnquiries.slice(startIndex, startIndex + enquiriesPerPage);

  const confirmDeleteEnquiry = (enquiryId: string) => {
    setEnquiryToDelete(enquiryId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteEnquiry = async () => {
    try {
      if (!enquiryToDelete) return;

      const result = await deleteEnquiry(enquiryToDelete).unwrap();

      if (result.success) {
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

  const handleView = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setViewOpen(true);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
    <div className="flex min-h-screen flex-col bg-gray-50 overflow-hidden">
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
        <aside
          className={`fixed left-0 top-0 z-40 h-screen w-64 transform overflow-y-auto bg-white shadow-lg transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:sticky md:top-0 md:translate-x-0 md:h-screen`}
        >
          <div className="h-16 md:h-0"></div>
          <Sidebar userRole="admin" />
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
          ></div>
        )}

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
                          <div
                            className="flex items-center cursor-pointer"
                            onClick={() => handleSort("name")}
                          >
                            Name
                            {sortField === "name" && (
                              <span className="ml-1">
                                {sortOrder === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="py-3">
                          <div
                            className="flex items-center cursor-pointer"
                            onClick={() => handleSort("email")}
                          >
                            Email
                            {sortField === "email" && (
                              <span className="ml-1">
                                {sortOrder === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="py-3">
                          <div
                            className="flex items-center cursor-pointer"
                            onClick={() => handleSort("mobile")}
                          >
                            Contact
                            {sortField === "mobile" && (
                              <span className="ml-1">
                                {sortOrder === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
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
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : displayedEnquiries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-6 text-center text-gray-500">
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
                                <p className="mt-1 text-xs text-gray-500">{enquiry.mobile}</p>
                              </div>
                              <span className="hidden font-medium md:inline">{enquiry.name}</span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{enquiry.email}</TableCell>
                            <TableCell className="hidden md:table-cell">{enquiry.mobile}</TableCell>
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

            <div className="mt-6 rounded bg-white p-4 shadow-md dark:bg-gray-800">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="text-sm text-gray-500 dark:text-white">
                  Showing{" "}
                  <span className="font-medium text-gray-700">
                    {enquiriesPerPage === "all" ? 1 : startIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-gray-700">
                    {enquiriesPerPage === "all"
                      ? sortedEnquiries.length
                      : Math.min(startIndex + enquiriesPerPage, sortedEnquiries.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-700">
                    {sortedEnquiries.length}
                  </span>{" "}
                  enquiries
                  <div className="flex items-center space-x-2 pt-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                    <Select
                      value={enquiriesPerPage.toString()}
                      onValueChange={(value) => {
                        setEnquiriesPerPage(value === "all" ? "all" : parseInt(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-24 rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800">
                        <SelectValue placeholder="Entries" />
                      </SelectTrigger>
                      <SelectContent className="rounded border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white">
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
                    className="h-8 w-8 rounded bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="hidden sm:flex sm:items-center sm:space-x-1">
                    {generatePaginationNumbers().map((page, index) =>
                      typeof page === "number" ? (
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
                    )}
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

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
          <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:bg-gray-800 dark:border-gray-700">
            <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
              Enquiry Details
            </DialogTitle>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="p-6 space-y-4">
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
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedEnquiry.mobile}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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