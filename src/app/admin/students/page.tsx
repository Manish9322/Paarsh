"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Menu,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  X,
} from "lucide-react";
import {
  useFetchStudentsQuery,
  useDeleteStudentMutation,
} from "@/services/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useDispatch } from "react-redux";
import { setPreviewStudent } from "@/lib/slices/studentsSlice";
import StudentPreviewModal from "./components/student-preview-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  degree: string;
  university: string;
  college?: {
    name: string;
    _id: string;
  };
  createdAt: string;
}

interface StudentFilters {
  degree: string;
  university: string;
  college: string;
  joinedAfter: string;
  joinedBefore: string;
}

export default function AdminStudents() {
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState<number>(10);
  const [filters, setFilters] = useState<StudentFilters>({
    degree: "all",
    university: "all",
    college: "all",
    joinedAfter: "",
    joinedBefore: "",
  });

  const {
    data: studentsData,
    isLoading: studentsLoading,
    error: studentsError,
  } = useFetchStudentsQuery(undefined);
  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();

  const students = (studentsData?.data || []) as Student[];

  // Get unique values for filters with proper type assertions
  const uniqueDegrees = [
    ...new Set(students.map((student) => student.degree)),
  ] as string[];
  const uniqueUniversities = [
    ...new Set(students.map((student) => student.university)),
  ] as string[];
  const uniqueColleges = [
    ...new Set(
      students.map((student) => student.college?.name).filter(Boolean),
    ),
  ] as string[];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      degree: "all",
      university: "all",
      college: "all",
      joinedAfter: "",
      joinedBefore: "",
    });
    setCurrentPage(1);
  };

  // Filter students based on search term and filters
  const filteredStudents = students.filter((student) => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch =
      (student?.name?.toLowerCase() || "").includes(searchString) ||
      (student?.email?.toLowerCase() || "").includes(searchString) ||
      (student?.phone || "").includes(searchString) ||
      (student?.degree?.toLowerCase() || "").includes(searchString) ||
      (student?.university?.toLowerCase() || "").includes(searchString);

    if (!matchesSearch) return false;

    if (filters.degree !== "all" && student?.degree !== filters.degree)
      return false;
    if (
      filters.university !== "all" &&
      student?.university !== filters.university
    )
      return false;
    if (filters.college !== "all" && student?.college?.name !== filters.college)
      return false;

    if (filters.joinedAfter && student?.createdAt) {
      const joinedDate = new Date(student.createdAt);
      const filterDate = new Date(filters.joinedAfter);
      if (joinedDate < filterDate) return false;
    }

    if (filters.joinedBefore && student?.createdAt) {
      const joinedDate = new Date(student.createdAt);
      const filterDate = new Date(filters.joinedBefore);
      if (joinedDate > filterDate) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const displayedStudents = filteredStudents.slice(
    startIndex,
    startIndex + studentsPerPage,
  );

  const handleDeleteClick = (id: string) => {
    setStudentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      const response = await deleteStudent(studentToDelete).unwrap();
      if (response.success) {
        toast.success("Student deleted successfully!");
        setIsDeleteModalOpen(false);
        setStudentToDelete(null);
      } else {
        toast.error(response.message || "Failed to delete student");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error(error.data?.message || "Failed to delete student");
    }
  };

  const handlePreviewStudent = (student: Student) => {
    dispatch(setPreviewStudent(student));
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

      if (startPage > 2) pageNumbers.push("...");
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      if (endPage < totalPages - 1) pageNumbers.push("...");
      if (totalPages > 1) pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  if (studentsError) {
    return <div>Error loading students</div>;
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
        <button
          onClick={toggleSidebar}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Student Management</h1>
        <div className="w-10"></div>
      </div>

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
            <Sidebar userRole="admin" />
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:ml-64">
        <div className="container mx-auto px-4 py-6">
          <Card className="mb-6 overflow-hidden border-none bg-white shadow-md dark:bg-gray-800 dark:text-white">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Students Management
                </CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                  <div className="relative">
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-10 w-full rounded border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 dark:text-black md:w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Filters Section */}
            <div className="m-4 mb-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white">
                  Filters
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-white">
                    Degree
                  </label>
                  <Select
                    value={filters.degree}
                    onValueChange={(value) =>
                      handleFilterChange("degree", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Degrees</SelectItem>
                      {uniqueDegrees.map((degree) => (
                        <SelectItem key={`degree-${degree}`} value={degree}>
                          {degree}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-white">
                    University
                  </label>
                  <Select
                    value={filters.university}
                    onValueChange={(value) =>
                      handleFilterChange("university", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select university" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Universities</SelectItem>
                      {uniqueUniversities.map((university) => (
                        <SelectItem
                          key={`university-${university}`}
                          value={university}
                        >
                          {university}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-white">
                    College
                  </label>
                  <Select
                    value={filters.college}
                    onValueChange={(value) =>
                      handleFilterChange("college", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select college" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Colleges</SelectItem>
                      {uniqueColleges.map((college) => (
                        <SelectItem key={`college-${college}`} value={college}>
                          {college}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-white">
                    Joined After
                  </label>
                  <Input
                    type="date"
                    value={filters.joinedAfter}
                    onChange={(e) =>
                      handleFilterChange("joinedAfter", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-white">
                    Joined Before
                  </label>
                  <Input
                    type="date"
                    value={filters.joinedBefore}
                    onChange={(e) =>
                      handleFilterChange("joinedBefore", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <CardContent className="p-0">
              {studentsLoading ? (
                <div className="p-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="mb-2 h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Degree</TableHead>
                          <TableHead>University</TableHead>
                          <TableHead>College</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayedStudents.map((student) => (
                          <TableRow key={student._id}>
                            <TableCell className="font-medium">
                              {student.name}
                            </TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.phone}</TableCell>
                            <TableCell>{student.degree}</TableCell>
                            <TableCell>{student.university}</TableCell>
                            <TableCell>
                              {student.college?.name || "N/A"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600 transition-all duration-200 hover:bg-green-100 hover:text-green-700 hover:shadow-md dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 dark:hover:text-green-300"
                                  onClick={() => handlePreviewStudent(student)}
                                  aria-label="Preview student"
                                >
                                  <Eye
                                    size={16}
                                    className="transition-transform group-hover:scale-110"
                                  />
                                  <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                    Preview student
                                  </span>
                                </button>
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                  onClick={() => {
                                    setStudentToDelete(student._id);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  aria-label="Delete student"
                                >
                                  <Trash2
                                    size={16}
                                    className="transition-transform group-hover:scale-110"
                                  />
                                  <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                    Delete student
                                  </span>
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="mt-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {startIndex + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {Math.min(
                            startIndex + studentsPerPage,
                            filteredStudents.length,
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {filteredStudents.length}
                        </span>{" "}
                        students
                        <div className="flex items-center space-x-2 pt-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Show:
                          </span>
                          <Select
                            value={studentsPerPage.toString()}
                            onValueChange={(value) => {
                              setStudentsPerPage(parseInt(value));
                              setCurrentPage(1); // Reset to first page when changing entries per page
                            }}
                          >
                            <SelectTrigger className="h-8 w-24 rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                              <SelectValue placeholder="Entries" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
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
                          className="h-8 w-8 rounded-md bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="hidden sm:flex sm:items-center sm:space-x-1">
                          {generatePaginationNumbers().map((page, index) =>
                            typeof page === "number" ? (
                              <Button
                                key={`page-${page}`}
                                onClick={() => setCurrentPage(page)}
                                className={`h-8 w-8 rounded-md p-0 text-sm font-medium ${
                                  currentPage === page
                                    ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                    : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                }`}
                                aria-label={`Page ${page}`}
                                aria-current={
                                  currentPage === page ? "page" : undefined
                                }
                              >
                                {page}
                              </Button>
                            ) : (
                              <span
                                key={`ellipsis-${index}`}
                                className="px-1 text-gray-400"
                              >
                                {page}
                              </span>
                            ),
                          )}
                        </div>

                        <Button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                          disabled={currentPage === totalPages}
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
                          max={totalPages}
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
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <DialogDescription className="py-4">
            <p>Are you sure you want to delete this student?</p>
            <p className="text-sm text-gray-500">
              This action cannot be undone.
            </p>
          </DialogDescription>
          <DialogFooter>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Preview Modal */}
      <StudentPreviewModal />
    </div>
  );
}
