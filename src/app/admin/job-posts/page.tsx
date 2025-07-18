"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronUp,
  ChevronDown,
  Eye,
  Trash2,
  Plus,
  Edit,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import Sidebar from "@/components/Sidebar/Sidebar";
import {
  useCreateJobPositionMutation,
  useFetchJobPositionsQuery,
  useUpdateJobPositionMutation,
  useDeleteJobPositionMutation,
} from "@/services/api";

interface JobPosition {
  _id: string;
  position: string;
  department: string;
  location: string;
  workType: string;
  description: string;
  skillsRequired: string[];
  expiryDate: string;
  isActive: boolean;
  salaryRange: { min?: number; max?: number };
  experienceLevel: string;
}

const skillsOptions = [
  { label: "JavaScript", value: "JavaScript" },
  { label: "TypeScript", value: "TypeScript" },
  { label: "React", value: "React" },
  { label: "Node.js", value: "Node.js" },
  { label: "Python", value: "Python" },
  { label: "Java", value: "Java" },
  { label: "SQL", value: "SQL" },
  { label: "MongoDB", value: "MongoDB" },
  { label: "AWS", value: "AWS" },
  { label: "Docker", value: "Docker" },
  { label: "Content Writing", value: "Content Writing" },
  { label: "Editing", value: "Editing" },
];

const JobPositionsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<JobPosition | null>(
    null,
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [sortField, setSortField] = useState<keyof JobPosition>("position");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<string | null>(null);
  const [jobPositionsPerPage, setJobPositionsPerPage] = useState<
    number | "all"
  >(10);

  interface FormSkill {
    label: string;
    value: string;
  }

  interface FormData {
    position: string;
    department: string;
    location: string;
    workType: string;
    description: string;
    skillsRequired: FormSkill[];
    expiryDate: string;
    salaryRangeMin: string;
    salaryRangeMax: string;
    experienceLevel: string;
  }

  const [formData, setFormData] = useState<FormData>({
    position: "",
    department: "",
    location: "",
    workType: "",
    description: "",
    skillsRequired: [],
    expiryDate: "",
    salaryRangeMin: "",
    salaryRangeMax: "",
    experienceLevel: "",
  });

  const {
    data: positionsData,
    isLoading,
    error,
  } = useFetchJobPositionsQuery(undefined);
  const [createJobPosition] = useCreateJobPositionMutation();
  const [updateJobPosition] = useUpdateJobPositionMutation();
  const [deleteJobPosition] = useDeleteJobPositionMutation();

  const positions = positionsData?.data || [];

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch job positions");
    }
  }, [error]);

  const handleFormChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { name: string; value: any },
  ) => {
    if ("target" in e) {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [e.name]: e.value }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      position: formData.position,
      department: formData.department,
      location: formData.location,
      workType: formData.workType,
      description: formData.description,
      skillsRequired: formData.skillsRequired.map(
        (s: { value: string }) => s.value,
      ),
      expiryDate: formData.expiryDate,
      salaryRange: {
        min: formData.salaryRangeMin
          ? Number(formData.salaryRangeMin)
          : undefined,
        max: formData.salaryRangeMax
          ? Number(formData.salaryRangeMax)
          : undefined,
      },
      experienceLevel: formData.experienceLevel,
    };

    try {
      if (isEditMode && selectedPosition) {
        await updateJobPosition({ id: selectedPosition._id, ...data }).unwrap();
        toast.success("Job position updated successfully");
      } else {
        await createJobPosition(data).unwrap();
        toast.success("Job position created successfully");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error("Failed to save job position");
    }
  };

  const resetForm = () => {
    setFormData({
      position: "",
      department: "",
      location: "",
      workType: "",
      description: "",
      skillsRequired: [],
      expiryDate: "",
      salaryRangeMin: "",
      salaryRangeMax: "",
      experienceLevel: "",
    });
    setIsEditMode(false);
    setSelectedPosition(null);
  };

  const handleEdit = (position: JobPosition) => {
    setSelectedPosition(position);
    setFormData({
      position: position.position,
      department: position.department,
      location: position.location,
      workType: position.workType,
      description: position.description,
      skillsRequired: position.skillsRequired.map((s) => ({
        label: s,
        value: s,
      })),
      expiryDate: position.expiryDate.split("T")[0],
      salaryRangeMin: position.salaryRange?.min?.toString() || "",
      salaryRangeMax: position.salaryRange?.max?.toString() || "",
      experienceLevel: position.experienceLevel,
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!positionToDelete) {
      return;
    }
    try {
      await deleteJobPosition(positionToDelete).unwrap();
      toast.success("Job position deleted successfully");
      setIsDeleteOpen(false);
      setPositionToDelete(null);
    } catch (err) {
      toast.error("Failed to delete job position");
    }
  };

  const handleSort = (field: keyof JobPosition) => {
    setSortField(field);
    setSortOrder(sortField === field && sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredPositions = useMemo(() => {
    return positions.filter((pos) =>
      Object.values(pos).some((val) =>
        val?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [positions, searchTerm]);

  const sortedPositions = useMemo(() => {
    return [...filteredPositions].sort((a, b) => {
      const aValue = a[sortField]?.toString().toLowerCase() || "";
      const bValue = b[sortField]?.toString().toLowerCase() || "";
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [filteredPositions, sortField, sortOrder]);

  const totalPages =
    jobPositionsPerPage === "all"
      ? 1
      : Math.ceil(sortedPositions.length / jobPositionsPerPage);
  const startIndex =
    jobPositionsPerPage === "all" ? 0 : (currentPage - 1) * jobPositionsPerPage;
  const displayedPositions =
    jobPositionsPerPage === "all"
      ? sortedPositions
      : sortedPositions.slice(startIndex, startIndex + jobPositionsPerPage);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
    <div className="flex min-h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm dark:bg-gray-800 dark:text-white md:hidden">
        <button
          onClick={toggleSidebar}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">
          Job Positions
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-0 z-40 h-screen w-64 transform overflow-y-auto bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:sticky md:top-0 md:h-screen md:translate-x-0`}
        >
          <div className="h-16 md:h-0"></div>
          <Sidebar userRole="admin" />
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}

        {/* Main Content */}
        <main className="w-full flex-1 overflow-x-hidden pt-16">
          <div className="container mx-auto px-4 py-6">
            <Card className="mb-6 overflow-hidden border border-gray-100 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                    Job Posts Management
                  </CardTitle>
                  <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                    <Input
                      type="text"
                      placeholder="Search positions..."
                      className="h-10 w-full rounded border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 md:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                      }}
                      className="h-10 w-full rounded bg-white text-blue-600 transition-colors hover:bg-blue-50 md:w-auto"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Position
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="w-full text-gray-900 dark:text-white">
                    <TableHeader>
                      <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                        <TableHead className="hidden py-3 sm:table-cell">
                          #
                        </TableHead>
                        <TableHead
                          className="cursor-pointer py-3"
                          onClick={() => handleSort("position")}
                        >
                          <div className="flex items-center">
                            Position
                            {sortField === "position" && (
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
                          onClick={() => handleSort("department")}
                        >
                          <div className="flex items-center">
                            Department
                            {sortField === "department" && (
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
                          onClick={() => handleSort("location")}
                        >
                          <div className="flex items-center">
                            Location
                            {sortField === "location" && (
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
                          className="hidden cursor-pointer py-3 xl:table-cell"
                          onClick={() => handleSort("workType")}
                        >
                          <div className="flex items-center">
                            Work Type
                            {sortField === "workType" && (
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
                      {isLoading ? (
                        Array.from({ length: 7 }).map((_, i) => (
                          <TableRow
                            key={i}
                            className="border-b border-gray-100 dark:border-gray-700"
                          >
                            <TableCell className="hidden sm:table-cell">
                              <Skeleton className="h-4 w-6 dark:bg-gray-700" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-24 dark:bg-gray-700" />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Skeleton className="h-4 w-24 dark:bg-gray-700" />
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Skeleton className="h-4 w-24 dark:bg-gray-700" />
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              <Skeleton className="h-4 w-24 dark:bg-gray-700" />
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-full dark:bg-gray-700" />
                                <Skeleton className="h-8 w-8 rounded-full dark:bg-gray-700" />
                                <Skeleton className="h-8 w-8 rounded-full dark:bg-gray-700" />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : displayedPositions.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="py-6 text-center text-gray-500 dark:text-gray-400"
                          >
                            No positions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        displayedPositions.map((pos, index) => (
                          <TableRow
                            key={pos._id}
                            className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                          >
                            <TableCell className="hidden text-center font-medium sm:table-cell">
                              {startIndex + index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="md:hidden">
                                <p className="font-medium">{pos.position}</p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  {pos.department}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  {pos.location}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  {pos.workType}
                                </p>
                              </div>
                              <span className="hidden font-medium md:inline">
                                {pos.position}
                              </span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {pos.department}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {pos.location}
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              {pos.workType}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                  onClick={() => {
                                    setSelectedPosition(pos);
                                    setIsViewOpen(true);
                                  }}
                                  aria-label="View position"
                                >
                                  <Eye
                                    size={16}
                                    className="transition-transform group-hover:scale-110"
                                  />
                                </button>
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                  onClick={() => handleEdit(pos)}
                                  aria-label="Edit position"
                                >
                                  <Edit
                                    size={16}
                                    className="transition-transform group-hover:scale-110"
                                  />
                                </button>
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                  onClick={() => {
                                    setPositionToDelete(pos._id);
                                    setIsDeleteOpen(true);
                                  }}
                                  aria-label="Delete position"
                                >
                                  <Trash2
                                    size={16}
                                    className="transition-transform group-hover:scale-110"
                                  />
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
            <div className="mt-6 rounded bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {jobPositionsPerPage === "all" ? 1 : startIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {jobPositionsPerPage === "all"
                      ? sortedPositions.length
                      : Math.min(
                          startIndex + jobPositionsPerPage,
                          sortedPositions.length,
                        )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {sortedPositions.length}
                  </span>{" "}
                  positions
                  <div className="flex items-center space-x-2 pt-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Show:
                    </span>
                    <Select
                      value={jobPositionsPerPage.toString()}
                      onValueChange={(value) => {
                        setJobPositionsPerPage(
                          value === "all" ? "all" : parseInt(value),
                        );
                        setCurrentPage(1); // Reset to first page when changing entries per page
                      }}
                    >
                      <SelectTrigger className="h-8 w-24 rounded border-gray-300 dark:border-gray-700 dark:bg-gray-900">
                        <SelectValue placeholder="Entries" />
                      </SelectTrigger>
                      <SelectContent className="rounded border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-white">
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="h-8 w-8 rounded bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
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
                              ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                          }`}
                        >
                          {page}
                        </Button>
                      ) : (
                        <span
                          key={index}
                          className="px-2 text-gray-400 dark:text-gray-500"
                        >
                          {page}
                        </span>
                      ),
                    )}
                  </div>
                  <Button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 rounded bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
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
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= totalPages) {
                        setCurrentPage(value);
                      }
                    }}
                    className="h-8 w-16 rounded border-gray-300 text-center text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    aria-label="Go to page"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="custom-scrollbar max-h-[90vh] max-w-2xl overflow-y-auto rounded bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
          <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {isEditMode ? "Edit Job Position" : "Add Job Position"}
              </DialogTitle>
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="ghost"
                className="h-8 w-8 rounded-full p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  className="h-4 w-4 text-gray-500 dark:text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="position"
                  className="text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Position
                </Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleFormChange}
                  required
                  className="h-10 rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="department"
                  className="text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Department
                </Label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  required
                  className="h-10 rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  required
                  className="h-10 rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="workType"
                  className="text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Work Type
                </Label>
                <Select
                  value={formData.workType}
                  onValueChange={(value) =>
                    handleFormChange({ name: "workType", value })
                  }
                >
                  <SelectTrigger className="h-10 rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                    <SelectValue placeholder="Select work type" />
                  </SelectTrigger>
                  <SelectContent className="rounded border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    {["Full-time", "Part-time", "Contract", "Internship"].map(
                      (type) => (
                        <SelectItem
                          key={type}
                          value={type}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {type}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                required
                className="rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="skillsRequired"
                className="text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                Skills Required
              </Label>
              <Select
                onValueChange={(value) => {
                  const matchedSkill = skillsOptions.find(
                    (s) => s.value === value,
                  );
                  if (matchedSkill) {
                    setFormData((prev) => ({
                      ...prev,
                      skillsRequired: [
                        ...prev.skillsRequired,
                        { label: matchedSkill.label, value },
                      ],
                    }));
                  }
                }}
              >
                <SelectTrigger className="h-10 rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                  <SelectValue placeholder="Select skills" />
                </SelectTrigger>
                <SelectContent className="rounded border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                  {skillsOptions.map((skill) => (
                    <SelectItem
                      key={skill.value}
                      value={skill.value}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {skill.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.skillsRequired?.map(
                  (skill: { value: string; label: string }) => (
                    <div
                      key={skill.value}
                      className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 dark:bg-blue-900/20"
                    >
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        {skill.label}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            skillsRequired: prev.skillsRequired.filter(
                              (s: { value: string }) => s.value !== skill.value,
                            ),
                          }));
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ),
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="expiryDate"
                  className="text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Expiry Date
                </Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={handleFormChange}
                  required
                  className="h-10 rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="experienceLevel"
                  className="text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Experience Level
                </Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value) =>
                    handleFormChange({ name: "experienceLevel", value })
                  }
                >
                  <SelectTrigger className="h-10 rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="rounded border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    {["Entry", "Mid", "Senior"].map((level) => (
                      <SelectItem
                        key={level}
                        value={level}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="salaryRangeMin"
                  className="text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Salary Min
                </Label>
                <Input
                  id="salaryRangeMin"
                  name="salaryRangeMin"
                  type="number"
                  value={formData.salaryRangeMin}
                  onChange={handleFormChange}
                  className="h-10 rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="salaryRangeMax"
                  className="text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Salary Max
                </Label>
                <Input
                  id="salaryRangeMax"
                  name="salaryRangeMax"
                  type="number"
                  value={formData.salaryRangeMax}
                  onChange={handleFormChange}
                  className="h-10 rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 sm:w-auto"
              >
                {isEditMode ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="custom-scrollbar max-h-[90vh] max-w-2xl overflow-y-auto rounded bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
          <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Job Position Details
              </DialogTitle>
              <Button
                onClick={() => setIsViewOpen(false)}
                variant="ghost"
                className="h-8 w-8 rounded-full p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  className="h-4 w-4 text-gray-500 dark:text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          </DialogHeader>
          {selectedPosition && (
            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">
                  Position Details
                </h3>
                <div className="rounded border border-gray-100 p-4 dark:border-gray-700">
                  <div className="grid gap-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Position:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedPosition.position}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Department:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedPosition.department}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Location:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedPosition.location}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Work Type:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedPosition.workType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">
                  Description
                </h3>
                <div className="rounded border border-gray-100 p-4 dark:border-gray-700">
                  <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                    {selectedPosition.description}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">
                  Additional Information
                </h3>
                <div className="rounded border border-gray-100 p-4 dark:border-gray-700">
                  <div className="grid gap-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Skills Required:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedPosition.skillsRequired.join(", ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Expiry Date:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {new Date(
                          selectedPosition.expiryDate,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Salary Range:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedPosition.salaryRange.min &&
                        selectedPosition.salaryRange.max
                          ? `$${selectedPosition.salaryRange.min} - $${selectedPosition.salaryRange.max}`
                          : "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Experience Level:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedPosition.experienceLevel}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Status:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedPosition.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <Trash2 className="mx-auto mb-4 h-12 w-12 text-red-500 dark:text-red-400" />
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this job position? This action
              cannot be undone.
            </p>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="w-full bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 sm:w-auto"
            >
              Delete
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

export default JobPositionsPage;
