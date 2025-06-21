"use client";

import React, { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, BookOpen, Menu, Video, BookPlus } from "lucide-react";
import { EditCourse } from "../../../components/Courses/EditCourses";
import {
  useDeleteCourseMutation,
  useFetchCategoriesQuery,
  useFetchCourcesQuery,
  useFetchCourseVideoQuery,
} from "../../../services/api";
import { toast } from "sonner";
import { AddNewCourse } from "@/components/AddNewCourseModal";
import AddCourseModal from "@/components/Courses/AddCourseVideo";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCourse } from "@/lib/slices/courseSlice";
import { selectRootState } from "@/lib/store";
import { RxCross2 } from "react-icons/rx";
import CourseFilters from "./CourseFilters/CourseFilters";

// Define Course type
interface Course {
  id: number;
  _id: string;
  courseName: string;
  price: string | number;
  duration: string;
  level: string;
  videoLink: string | null;
  languages: string | string[];
  thumbnail: string | null;
  summaryText: string;
  tagline_in_the_box: string;
  taglineIncludes: string;
  overviewTagline: string;
  finalText: string;
  editorContent: string;
  courseIncludes: string[];
  syllabus: string | null;
  syllabusOverview: string[];
  thoughts: string[];
  tags: string[];
  category: string;
  subcategory: string;
  availability: string | boolean;
  certificate: boolean;
  instructor: string;
  featuredCourse: boolean;
  inputValues: Record<string, string>;
  createdAt?: string;
  enrolledUsers: number;
  lectureCount: number;
  videos?: {
    videoName: string;
    videoId: string;
  }[];
}

interface CourseVideo {
  _id: string;
  id: string;
  courseName: string;
  videos: {
    videoName: string;
    videoId: string;
  }[];
  createdAt: string;
}

// Define Category type
interface Category {
  name: string;
}

const CoursePage: React.FC = () => {
  const [coursess, setCourses] = useState<CourseVideo[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage, setCoursesPerPage] = useState<number | "all">(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    level: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });

  const dispatch = useDispatch();
  const selectedCourse = useSelector(
    (state) => selectRootState(state).course,
  );

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch courses data
  const {
    data: courseData,
    isLoading,
    error,
  } = useFetchCourcesQuery(undefined);
  const courses: Course[] = courseData?.data || [];

  const courseid = courseData?.data[0]?._id;

  // Fetch categories data
  const { data: categoriesData, isLoading: isCategoriesLoading } = useFetchCategoriesQuery(undefined);
  const categories: Category[] = categoriesData?.data || [];


  const { data: courseVideoData } = useFetchCourseVideoQuery(courseid);

  // Filter courses based on search term and active filters
  const filteredCourses = courses.filter((course: Course) => {
    const searchFields = [
      course.courseName,
      course.category,
      course.subcategory,
      course.level,
      course.instructor,
      Array.isArray(course.languages) ? course.languages.join(', ') : course.languages,
      course.price.toString(),
    ];

    const matchesSearch = searchFields.some((field) =>
      field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!matchesSearch) return false;

    if (activeFilters.level && (!course.level || course.level.toLowerCase() !== activeFilters.level.toLowerCase())) {
      return false;
    }

    if (activeFilters.category && course.category !== activeFilters.category) {
      return false;
    }

    if (activeFilters.minPrice && Number(course.price) < parseInt(activeFilters.minPrice)) {
      return false;
    }

    if (activeFilters.maxPrice && Number(course.price) > parseInt(activeFilters.maxPrice)) {
      return false;
    }

    return true;
  });

  const [_DELETECOURSE, { isLoading: isDeleteLoading, error: deleteError }] =
    useDeleteCourseMutation();

  // Pagination logic
  const startIndex = coursesPerPage === "all" ? 0 : (currentPage - 1) * coursesPerPage;
  const totalPages = coursesPerPage === "all" ? 1 : Math.ceil(filteredCourses.length / coursesPerPage);
  const displayedCourses = coursesPerPage === "all"
    ? filteredCourses
    : filteredCourses.slice(
      startIndex,
      startIndex + coursesPerPage
    );

  // Function to generate page numbers for pagination
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

      if (startPage > 2) pageNumbers.push('...');
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      if (endPage < totalPages - 1) pageNumbers.push('...');
      if (totalPages > 1) pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  const confirmDeleteCourse = (courseId: string) => {
    setCourseToDelete(courseId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      const response = await _DELETECOURSE({ id: courseToDelete }).unwrap();

      if (response?.success) {
        toast.success("Course deleted successfully");
        setDeleteConfirmOpen(false);
        setCourseToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error(
        error?.data?.message ||
        "Failed to delete the course. Please try again.",
      );
    }
  };

  const handleEditCourse = (course: Course) => {
    dispatch(setSelectedCourse(course));
    setEditOpen(true);
  };

  const handleAddLecture = (course: Course) => {
    dispatch(setSelectedCourse(course));
    setIsModalOpen(true);
  };

  const handlePreview = (course: Course) => {
    dispatch(setSelectedCourse(course));
    setViewOpen(true);
  };

  const handleAddCourse = (newCourse: CourseVideo) => {
    setCourses((prevCourses) => [...prevCourses, newCourse]);
  };

  const handleFilterChange = (newFilters: { searchTerm: string; level: string; category: string; minPrice: string; maxPrice: string }) => {
    console.log("New filters:", newFilters);
    setSearchTerm(newFilters.searchTerm);
    setActiveFilters({
      level: newFilters.level,
      category: newFilters.category,
      minPrice: newFilters.minPrice,
      maxPrice: newFilters.maxPrice,
    });
    setCurrentPage(1);
  };

  // Function to get level badge color
  const getLevelBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-blue-100 text-blue-800 hover:bg-white/90 dark:bg-blue-900/30 dark:text-blue-400';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'advanced':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
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
        <h1 className="text-lg font-bold text-gray-800">User Management</h1>
        <div className="w-10"></div>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
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
      <main className="flex-1 overflow-y-auto  pt-16 md:ml-64">
        <div className="container mx-auto px-4 py-6">
          <Card className="mb-6 overflow-hidden border-none bg-white shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Course Management
                </CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                  <AddNewCourse />
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
                          <svg
                            className="h-6 w-6 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Cost
                        </h3>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          ₹{filteredCourses.reduce((sum, course) => sum + (Number(course.price) * (Array.isArray(course.enrolledUsers) ? course.enrolledUsers.length : 0)), 0).toLocaleString()}
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
                          <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Courses
                        </h3>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          {filteredCourses.length.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-md bg-white shadow transition-all hover:shadow-md dark:bg-gray-900">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                          <svg
                            className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Enrollments
                        </h3>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          {filteredCourses.reduce((sum, course) => sum + (Array.isArray(course.enrolledUsers) ? course.enrolledUsers.length : 0), 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <CourseFilters
                categories={categories}
                isCategoriesLoading={isCategoriesLoading}
                onFilterChange={handleFilterChange}
              />

              {/* Table */}
              <div className="overflow-x-auto no-scrollbar">
                <Table className="w-full text-black dark:text-white">
                  <TableHeader>
                    <TableRow className="border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                      <TableHead className="hidden py-3 text-center sm:table-cell">#</TableHead>
                      <TableHead className="py-3">Category</TableHead>
                      <TableHead className="py-3">Course Name</TableHead>
                      <TableHead className="hidden py-3 md:table-cell">Level</TableHead>
                      <TableHead className="hidden py-3 lg:table-cell">Duration</TableHead>
                      <TableHead className="py-3">Fees (₹)</TableHead>
                      <TableHead className="hidden py-3 lg:table-cell">Languages</TableHead>
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
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-full max-w-[150px]" />
                              <Skeleton className="h-4 w-full max-w-[100px] md:hidden" />
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Skeleton className="h-5 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-12" />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Skeleton className="h-5 w-20" />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap justify-center gap-2">
                              <Skeleton className="h-8 w-20 rounded-md" />
                              <div className="flex gap-1">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : displayedCourses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="text-gray-400 dark:text-gray-500">
                              <BookOpen className="mx-auto h-12 w-12" />
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              <p className="text-base font-medium">No courses found</p>
                              <p className="text-sm">
                                {searchTerm || Object.values(activeFilters).some(Boolean)
                                  ? "Try adjusting your search or filter criteria"
                                  : "No courses available"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedCourses.map((course, index) => (
                        <TableRow
                          key={course._id}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <TableCell className="hidden text-center font-medium sm:table-cell">
                            {startIndex + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="sm:block">
                              <p className="font-medium">{course.category}</p>
                              <p className="mt-1 text-xs text-gray-500 md:hidden">
                                {course.level}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 sm:hidden">
                                ₹{course.price}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{course.courseName}</p>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge className={`${getLevelBadgeColor(course.level)}`}>
                              {course.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">{course.duration}</TableCell>
                          <TableCell>₹{course.price}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {Array.isArray(course.languages)
                              ? course.languages.join(', ')
                              : course.languages}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                onClick={() => {
                                  handleAddLecture(course);
                                  setIsModalOpen(true);
                                }}
                                aria-label="Add lecture"
                              >
                                <Video size={16} className="transition-transform group-hover:scale-110" />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  Add Lecture
                                </span>
                              </button>

                              <div className="flex gap-2">
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                  onClick={() => handlePreview(course)}
                                  aria-label="View course details"
                                >
                                  <Eye size={16} className="transition-transform group-hover:scale-110" />
                                  <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                    View details
                                  </span>
                                </button>
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                  onClick={() => {
                                    handleEditCourse(course);
                                    setEditOpen(true);
                                  }}
                                  aria-label="Edit course"
                                >
                                  <Edit size={16} className="transition-transform group-hover:scale-110" />
                                  <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                    Edit course
                                  </span>
                                </button>
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-blue-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                  onClick={() => confirmDeleteCourse(course._id)}
                                  aria-label="Delete course"
                                >
                                  <Trash2 size={16} className="transition-transform group-hover:scale-110" />
                                  <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                    Delete course
                                  </span>
                                </button>
                              </div>
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
        </div>

        {/* Pagination */}
        <div className="mt-6 rounded-md bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium text-gray-700 dark:text-gray-300">{coursesPerPage === "all" ? 1 : startIndex + 1}</span> to{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {coursesPerPage === "all" ? filteredCourses.length : Math.min(startIndex + coursesPerPage, filteredCourses.length)}
              </span>{" "}
              of <span className="font-medium text-gray-700 dark:text-gray-300">{filteredCourses.length}</span> courses

              <div className="flex items-center space-x-2 pt-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                <Select
                  value={coursesPerPage.toString()}
                  onValueChange={(value) => {
                    setCoursesPerPage(value === "all" ? "all" : parseInt(value));
                    setCurrentPage(1); // Reset to first page when changing entries per page
                  }}
                >
                  <SelectTrigger className="h-8 w-24 rounded-md dark:border-gray-700 dark:bg-gray-800">
                    <SelectValue placeholder="Entries" />
                  </SelectTrigger>
                  <SelectContent>
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
        </div>
      </main>

      {/* View Course Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="no-scrollbar max-h-[90vh] max-w-md overflow-y-auto rounded-md bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
          <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                Course Details
              </DialogTitle>
              <RxCross2
                className="text-gray-800 dark:text-white"
                size={20}
                onClick={() => setViewOpen(false)}
              />
            </div>
          </DialogHeader>
          {selectedCourse ? (
            <div className="p-6 space-y-6">
              <div className="overflow-hidden rounded-md border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300">
                    Course Overview
                  </h3>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">
                    {selectedCourse.courseName}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge className={`${getLevelBadgeColor(selectedCourse.level)}`}>
                      {selectedCourse.level}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                      {selectedCourse.duration}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                      ₹{selectedCourse.price}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                      {selectedCourse.lectureCount || 0} Lectures
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                      {(Array.isArray(selectedCourse.enrolledUsers) ? selectedCourse.enrolledUsers.length : 0)} Students
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-md border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300">
                    Course Information
                  </h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  <div className="grid grid-cols-3 px-4 py-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Category
                    </span>
                    <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                      {selectedCourse.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 px-4 py-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Subcategory
                    </span>
                    <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                      {selectedCourse.subcategory}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 px-4 py-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Instructor
                    </span>
                    <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                      {selectedCourse.instructor}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 px-4 py-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Featured
                    </span>
                    <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                      {selectedCourse.featuredCourse ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 px-4 py-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Languages
                    </span>
                    <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                      {Array.isArray(selectedCourse.languages)
                        ? selectedCourse.languages.join(', ')
                        : selectedCourse.languages}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 px-4 py-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Created At
                    </span>
                    <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                      {new Date(selectedCourse.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <p className="text-center text-gray-500 dark:text-gray-400">
                No course selected.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <Trash2 className="mx-auto mb-4 h-12 w-12 text-red-500 dark:text-red-400" />
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this course? This action cannot be undone.
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
              onClick={handleDeleteCourse}
              className="w-full sm:w-auto"
              disabled={isDeleteLoading}
            >
              {isDeleteLoading ? "Deleting..." : "Delete Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Modal */}
      <EditCourse
        editOpen={editOpen}
        setEditOpen={setEditOpen}
      />

      {/* Add Course Modal */}
      <AddCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddCourse={handleAddCourse}
      />

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

export default CoursePage;