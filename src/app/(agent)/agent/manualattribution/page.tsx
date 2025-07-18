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
  Menu,
  User,
  Mail,
  Phone,
  Book,
  Info,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { RxCross2 } from "react-icons/rx";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { addLead } from "../../../../lib/slices/attributionSlice";
import {
  useCreateLeadMutation,
  useFetchagentCourseRefferalLinkQuery,
  useFetchLeadsQuery,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
} from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
  id: string;
  courseName: string;
  referralLink: string;
}

interface Lead {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  courseId: string;
  notes: string;
  createdAt: string;
}

const LeadTracking = () => {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [notes, setNotes] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sortField, setSortField] = useState<keyof Lead | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch = useDispatch();
  const [_CREATELEAD, { isLoading: isCreateLoading }] = useCreateLeadMutation();
  const [_UPDATELEAD, { isLoading: isUpdateLoading }] = useUpdateLeadMutation();
  const [_DELETELEAD, { isLoading: isDeleteLoading }] = useDeleteLeadMutation();
  const { data: agentCourseRefferalLinks } = useFetchagentCourseRefferalLinkQuery(undefined);
  const { data: leadsData, isLoading: isLeadsLoading } = useFetchLeadsQuery(undefined);

  const courses: Course[] = agentCourseRefferalLinks?.data.map((course) => ({
    id: course.courseId,
    courseName: course.courseName,
  })) || [];
  const leads: Lead[] = leadsData?.data || [];

  const leadsPerPage = 10;
  const startIndex = (currentPage - 1) * leadsPerPage;

  const handleSort = (field: keyof Lead) => {
    setSortField(field);
    setSortOrder(sortField === field && sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredLeads = leads.filter((lead) =>
    [
      lead.customerName,
      lead.customerEmail,
      lead.customerMobile,
      lead.notes,
      courses.find((course) => course.id === lead.courseId)?.courseName || "",
    ].some((value) =>
      value?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (!sortField) return 0;
    const valueA = a[sortField];
    const valueB = b[sortField];
    return sortOrder === "asc"
      ? valueA > valueB ? 1 : -1
      : valueA < valueB ? 1 : -1;
  });

  const totalPages = Math.ceil(sortedLeads.length / leadsPerPage);
  const displayedLeads = sortedLeads.slice(startIndex, startIndex + leadsPerPage);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      dispatch(
        addLead({
          customerName,
          customerEmail,
          customerMobile,
          courseId: selectedCourse,
          notes,
        })
      );

      const response = await _CREATELEAD({
        customerName,
        customerEmail,
        customerMobile,
        courseId: selectedCourse,
        notes,
      }).unwrap();

      toast.success("Lead recorded successfully");

      setCustomerName("");
      setCustomerEmail("");
      setCustomerMobile("");
      setSelectedCourse("");
      setNotes("");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to record lead");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      const response = await _UPDATELEAD({
        leadId: selectedLead._id,
        customerName,
        customerEmail,
        customerMobile,
        courseId: selectedCourse,
        notes,
      }).unwrap();

      toast.success("Lead updated successfully");

      setCustomerName("");
      setCustomerEmail("");
      setCustomerMobile("");
      setSelectedCourse("");
      setNotes("");
      setIsEditModalOpen(false);
      setSelectedLead(null);
    } catch (error) {
      toast.error("Failed to update lead");
    }
  };

  const handleDeleteLead = async () => {
    if (!selectedLead) return;

    try {
      const response = await _DELETELEAD({ id: selectedLead._id }).unwrap();

      if (response?.success) {
        toast.success("Lead deleted successfully");
        setIsDeleteConfirmOpen(false);
        setSelectedLead(null);
      }
    } catch (error) {
      toast.error("Failed to delete lead");
    }
  };

  const handleClearForm = () => {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerMobile("");
    setSelectedCourse("");
    setNotes("");
    toast.info("Form cleared");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm dark:bg-gray-800 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-gray-600 hover:bg-teal-100 dark:text-gray-400 dark:hover:bg-teal-900/30"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </Button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Lead Tracking</h1>
        <div className="w-10"></div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-md transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white md:hidden">Dashboard</h1>
          </div>
          <div className="custom-scrollbar flex-1 overflow-y-auto">
            <Sidebar userRole="agent" />
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
          <Card className="mb-6 overflow-hidden border-none bg-white shadow-md dark:bg-gray-800 dark:text-white">
            <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-800 p-4 pb-4 pt-6 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Lead Tracking
                </CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                  <Input
                    type="text"
                    placeholder="Search leads..."
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 dark:text-white md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      setCustomerName("");
                      setCustomerEmail("");
                      setCustomerMobile("");
                      setSelectedCourse("");
                      setNotes("");
                      setIsModalOpen(true);
                    }}
                    className="h-10 w-full bg-white text-teal-600 transition-colors md:w-auto hover:bg-teal-50"
                  >
                    + Add Lead
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="w-full text-black dark:text-white">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                      <TableHead className="hidden py-3 text-center sm:table-cell">
                        #
                      </TableHead>
                      <TableHead
                        className="cursor-pointer py-3"
                        onClick={() => handleSort("customerName")}
                      >
                        <div className="flex items-center">
                          Customer Name
                          {sortField === "customerName" && (
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
                      <TableHead
                        className="hidden cursor-pointer py-3 sm:table-cell"
                        onClick={() => handleSort("customerEmail")}
                      >
                        <div className="flex items-center">
                          Email
                          {sortField === "customerEmail" && (
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
                      <TableHead
                        className="hidden cursor-pointer py-3 sm:table-cell"
                        onClick={() => handleSort("customerMobile")}
                      >
                        <div className="flex items-center">
                          Mobile
                          {sortField === "customerMobile" && (
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
                      <TableHead
                        className="hidden cursor-pointer py-3 sm:table-cell"
                        onClick={() => handleSort("courseId")}
                      >
                        <div className="flex items-center">
                          Course
                          {sortField === "courseId" && (
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
                      <TableHead
                        className="hidden cursor-pointer py-3 md:table-cell"
                        onClick={() => handleSort("notes")}
                      >
                        <div className="flex items-center">
                          Notes
                          {sortField === "notes" && (
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
                      <TableHead
                        className="hidden cursor-pointer py-3 lg:table-cell"
                        onClick={() => handleSort("createdAt")}
                      >
                        <div className="flex items-center">
                          Created At
                          {sortField === "createdAt" && (
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
                      <TableHead className="py-3 text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLeadsLoading ? (
                      Array.from({ length: 6 }).map((_, index) => (
                        <TableRow
                          key={index}
                          className="border-b border-gray-100 dark:border-gray-700 dark:bg-gray-900"
                        >
                          <TableCell className="hidden sm:table-cell">
                            <Skeleton className="h-4 w-6" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-20" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : displayedLeads.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="py-6 text-center text-gray-500"
                        >
                          No leads found. Try a different search term or add a new lead.
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedLeads.map((lead, index) => (
                        <TableRow
                          key={lead._id}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <TableCell className="hidden text-center font-medium sm:table-cell">
                            {startIndex + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="sm:hidden">
                              <p className="font-medium">{lead.customerName}</p>
                              <p className="text-xs text-gray-500">
                                Email: {lead.customerEmail}
                              </p>
                              <p className="text-xs text-gray-500">
                                Mobile: {lead.customerMobile}
                              </p>
                              <p className="text-xs text-gray-500">
                                Course: {courses.find((course) => course.id === lead.courseId)?.courseName || "Unknown"}
                              </p>
                            </div>
                            <span className="hidden sm:inline">{lead.customerName}</span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{lead.customerEmail}</TableCell>
                          <TableCell className="hidden sm:table-cell">{lead.customerMobile}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {courses.find((course) => course.id === lead.courseId)?.courseName || "Unknown"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{lead.notes || "-"}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {new Date(lead.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600 transition-all duration-200 hover:bg-green-100 hover:text-green-700 hover:shadow-md dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 dark:hover:text-green-300"
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setIsViewModalOpen(true);
                                }}
                                aria-label="View lead details"
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
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setCustomerName(lead.customerName);
                                  setCustomerEmail(lead.customerEmail);
                                  setCustomerMobile(lead.customerMobile);
                                  setSelectedCourse(lead.courseId);
                                  setNotes(lead.notes || "");
                                  setIsEditModalOpen(true);
                                }}
                                aria-label="Edit lead"
                              >
                                <Edit
                                  size={16}
                                  className="transition-transform group-hover:scale-110"
                                />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  Edit lead
                                </span>
                              </button>
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setIsDeleteConfirmOpen(true);
                                }}
                                aria-label="Delete lead"
                              >
                                <Trash2
                                  size={16}
                                  className="transition-transform group-hover:scale-110"
                                />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  Delete lead
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

          {/* Pagination Controls */}
          <div className="mt-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {Math.min(startIndex + leadsPerPage, sortedLeads.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {sortedLeads.length}
                </span>{" "}
                leads
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 rounded-md bg-teal-50 p-0 text-teal-600 transition-colors hover:bg-teal-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
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
                            ? "bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800"
                            : "bg-teal-50 text-teal-600 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30"
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
                  className="h-8 w-8 rounded-md bg-teal-50 p-0 text-teal-600 transition-colors hover:bg-teal-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="hidden items-center space-x-2 lg:flex">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Go to page:
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
                  className="h-8 w-16 rounded-md border-gray-300 text-center text-sm dark:border-gray-700 dark:bg-gray-800"
                  aria-label="Go to page"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Lead Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-lg bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
          <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                Add New Lead
              </DialogTitle>
              <RxCross2
                size={20}
                className="cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              />
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="customer-name"
                className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white"
              >
                <User className="h-4 w-4" /> Customer Name
              </Label>
              <Input
                id="customer-name"
                placeholder="Customer's full name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-10 rounded-lg border-gray-300 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="customer-email"
                className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white"
              >
                <Mail className="h-4 w-4" /> Customer Email
              </Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="customer@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="h-10 rounded-lg border-gray-300 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="customer-mobile"
                className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white"
              >
                <Phone className="h-4 w-4" /> Customer Mobile
              </Label>
              <Input
                id="customer-mobile"
                type="tel"
                placeholder="+1234567890"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                className="h-10 rounded-lg border-gray-300 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="course"
                className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white"
              >
                <Book className="h-4 w-4" /> Course
              </Label>
              <Select
                value={selectedCourse}
                onValueChange={setSelectedCourse}
                required
              >
                <SelectTrigger className="h-10 rounded-lg border-gray-300 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent className="rounded-lg bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                  {courses.map((course) => (
                    <SelectItem
                      key={course.id}
                      value={course.id}
                      className="bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                    >
                      {course.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white"
              >
                <Info className="h-4 w-4" /> Additional Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Details about this lead"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-20 rounded-lg border-gray-300 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
              />
            </div>

            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearForm}
                className="w-full sm:w-auto"
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800"
                disabled={isCreateLoading}
              >
                {isCreateLoading ? "Recording..." : "Record Lead"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-lg bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
          <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                Edit Lead
              </DialogTitle>
              <RxCross2
                size={20}
                className="cursor-pointer"
                onClick={() => setIsEditModalOpen(false)}
              />
            </div>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="customer-name"
                className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white"
              >
                <User className="h-4 w-4" /> Customer Name
              </Label>
              <Input
                id="customer-name"
                placeholder="Customer's full name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-10 rounded-lg border-gray-300 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="customer-email"
                className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white"
              >
                <Mail className="h-4 w-4" /> Customer Email
              </Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="customer@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="h-10 rounded-lg border-gray-300 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="customer-mobile"
                className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white"
              >
                <Phone className="h-4 w-4" /> Customer Mobile
              </Label>
              <Input
                id="customer-mobile"
                type="tel"
                placeholder="+1234567890"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                className="h-10 rounded-lg border-gray-300 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="course"
                className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white"
              >
                <Book className="h-4 w-4" /> Course
              </Label>
              <Select
                value={selectedCourse}
                onValueChange={setSelectedCourse}
                required
              >
                <SelectTrigger className="h-10 rounded-lg border-gray-300 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent className="rounded-lg bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                  {courses.map((course) => (
                    <SelectItem
                      key={course.id}
                      value={course.id}
                      className="bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                    >
                      {course.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white"
              >
                <Info className="h-4 w-4" /> Additional Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Details about this lead"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-20 rounded-lg border-gray-300 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
              />
            </div>

            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearForm}
                className="w-full sm:w-auto"
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800"
                disabled={isUpdateLoading}
              >
                {isUpdateLoading ? "Updating..." : "Update Lead"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Lead Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-lg bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
          <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                Lead Details
              </DialogTitle>
              <RxCross2
                size={20}
                className="cursor-pointer"
                onClick={() => setIsViewModalOpen(false)}
              />
            </div>
          </DialogHeader>
          {selectedLead ? (
            <div className="p-6">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-lg border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                  <div className="bg-gray-50 px-4 py-2 dark:bg-gray-700">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">
                      Lead Information
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    <div className="grid grid-cols-3 px-4 py-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Customer Name
                      </span>
                      <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                        {selectedLead.customerName}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 px-4 py-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Email
                      </span>
                      <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                        {selectedLead.customerEmail}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 px-4 py-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Mobile
                      </span>
                      <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                        {selectedLead.customerMobile}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 px-4 py-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Course
                      </span>
                      <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                        {courses.find((course) => course.id === selectedLead.courseId)?.courseName || "Unknown"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 px-4 py-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Notes
                      </span>
                      <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                        {selectedLead.notes || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 px-4 py-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Created At
                      </span>
                      <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                        {new Date(selectedLead.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <p className="text-center text-gray-500 dark:text-gray-400">
                No lead selected.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <Trash2 className="mx-auto mb-4 h-12 w-12 text-red-500 dark:text-red-400" />
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this lead? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteLead}
              className="w-full sm:w-auto"
              disabled={isDeleteLoading}
            >
              {isDeleteLoading ? "Deleting..." : "Delete Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadTracking;