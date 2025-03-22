"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { EditCourse } from "../../../components/Courses/EditCourses";
import {
  useDeleteCourseMutation,
  useFetchCourcesQuery,
} from "../../../services/api";
import { toast } from "sonner";
import { AddNewCourse } from "@/components/AddNewCourseModal";
import AddCourseModal from "@/components/Courses/AddCourseVideo";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCourse } from "@/lib/slices/courseSlice";
import { selectRootState } from "@/lib/store";

// Define Course type
interface Course {
  id: number; // Optional since it's not present in the initial state
  _id: string; // Optional because it's not in the initial state
  courseName: string;
  price: string | number; // Redux state has price as a string, but it should be number
  duration: string;
  level: string;
  videoLink: string | null; // Can be null
  languages: string | string[]; // Redux has it as a string, but ideally an array
  thumbnail: string | null; // Can be null
  summaryText: string;
  tagline_in_the_box: string;
  taglineIncludes: string;
  overviewTagline: string;
  finalText: string;
  editorContent: string;
  courseIncludes: string[]; // Assuming it's an array of strings
  syllabus: string | null; // Can be null
  syllabusOverview: string[]; // Assuming it's an array of strings
  thoughts: string[]; // Assuming it's an array of strings
  tags: string[]; // Assuming it's an array of strings
  category: string;
  subcategory: string;
  availability: string | boolean; // Redux has it as a string, but it seems like a boolean
  certificate: boolean;
  instructor: string;
  featuredCourse: boolean;
  inputValues: Record<string, string>; // Object storing input values dynamically
  createdAt?: string; // Optional because it's not in initial state
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
const CoursePage: React.FC = () => {
 
  const [coursess, setCourses] = useState<CourseVideo[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const coursesPerPage = 10;
  const dispatch = useDispatch();
  const selectedCourse = useSelector(
    (state) => selectRootState(state).course.selectedCourse,
  );
  
  // Fetch courses data
  const {
    data: courseData,
    isLoading,
    error,
  } = useFetchCourcesQuery(undefined);

  const courses: Course[] = courseData?.data || [];

  const [_DELETECOURSE, { isLoading: isDeleteLoading, error: deleteError }] =
    useDeleteCourseMutation();
  // Pagination logic
  const totalPages = Math.ceil(courses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const displayedCourses = courses.slice(
    startIndex,
    startIndex + coursesPerPage,
  );

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
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed after middle pages
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always include last page if there is more than one page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
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
  };

  const handleViewCourse = (course: Course) => {
    dispatch(setSelectedCourse(course));
  };

  const handleAddCourse = (newCourse: CourseVideo) => {
    setCourses((prevCourses) => [...prevCourses, newCourse]);
  };

  // Function to get level badge color
  const getLevelBadgeColor = (level: string) => {
    switch(level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 dark:bg-gray-900">
      {/* Main Layout */}
      <div className="flex">
             {/* Sidebar - fixed position with proper scrolling */}
                  <aside 
              className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white md:translate-x-0 
              }`}
            >
              <div className="flex h-full flex-col">
                         
                {/* Sidebar Content - Scrollable */}
                <div className="custom-scrollbar flex-1 overflow-y-auto">
                  <Sidebar />
                </div>
              </div>
            </aside>
            
  

        {/* Main Content */}
        <div className="w-full pt-16 md:pl-64">
          <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-lg bg-white p-5 shadow-md dark:bg-gray-800 dark:text-white sm:flex-row sm:items-center">
              <div className="flex items-center">
                <BookOpen className="mr-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h1 className="text-2xl font-bold text-gray-600 dark:text-gray-200">Courses</h1>
              </div>
              <AddNewCourse />
            </div>

            {/* Courses Table */}
            <Card className="mb-6 overflow-hidden border border-gray-300 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <CardContent className="p-0 sm:p-4">
                <div className="overflow-x-auto">
                  <Table className="w-full min-w-full table-auto text-black dark:text-white">
                    <TableHeader>
                      <TableRow className="border-b border-gray-300 hover:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-700">
                        <TableHead className="hidden w-12 sm:table-cell">#</TableHead>
                        <TableHead className="w-1/6">Category</TableHead>
                        <TableHead className="w-1/4">Course Name</TableHead>
                        <TableHead className="hidden w-1/6 md:table-cell">Level</TableHead>
                        <TableHead className="hidden w-1/6 lg:table-cell">Duration</TableHead>
                        <TableHead className="hidden w-1/6 md:table-cell">Fees (₹)</TableHead>
                        <TableHead className="hidden w-1/6 lg:table-cell">Languages</TableHead>
                        <TableHead className="w-1/4 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                    {isLoading
                      ? Array.from({ length: 5 }).map((_, index) => (
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
                            <TableCell className="hidden md:table-cell">
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
                        )) : displayedCourses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="p-4 text-center">
                            <div className="flex flex-col items-center justify-center py-8">
                              <BookOpen className="mb-2 h-12 w-12 text-gray-400 dark:text-gray-600" />
                              <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No courses available</p>
                              <p className="text-sm text-gray-400 dark:text-gray-500">Add a new course to get started</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        displayedCourses.map((course, index) => (
                          <TableRow
                            key={course._id}
                            className="border-b border-gray-300 hover:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
                          >
                            <TableCell className="hidden whitespace-nowrap sm:table-cell">{startIndex + index + 1}</TableCell>
                            <TableCell className="max-w-[100px] truncate whitespace-nowrap">{course.category}</TableCell>
                            <TableCell className="max-w-[150px]">
                              <div className="space-y-1">
                                <div className="font-medium line-clamp-1">{course.courseName}</div>
                                <div className="md:hidden">
                                  <Badge variant="outline" className={`${getLevelBadgeColor(course.level)} text-xs`}>
                                    {course.level}
                                  </Badge>
                                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">₹{course.price}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden whitespace-nowrap md:table-cell">
                              <Badge variant="outline" className={`${getLevelBadgeColor(course.level)}`}>
                                {course.level}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden whitespace-nowrap lg:table-cell">{course.duration}</TableCell>
                            <TableCell className="hidden whitespace-nowrap md:table-cell">₹{course.price}</TableCell>
                            <TableCell className="hidden max-w-[120px] truncate lg:table-cell">
                              {Array.isArray(course.languages) 
                                ? course.languages.join(', ') 
                                : course.languages}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  className="h-8 w-auto rounded bg-blue-600 px-2 text-xs text-white transition hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 sm:px-3 sm:text-sm"
                                  onClick={() => {
                                    setSelectedCourse(course);
                                    setIsModalOpen(true);
                                  }}
                                >
                                  <span className="hidden sm:inline">Add</span> Lectures
                                </Button>
                                <div className="flex gap-1 sm:gap-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full text-green-600 hover:bg-green-100 hover:text-green-700 dark:text-green-500 dark:hover:bg-green-900/30 dark:hover:text-green-400"
                                    onClick={() => {
                                      handleViewCourse(course);
                                      setViewOpen(true);
                                    }}
                                  >
                                    <Eye size={18} />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:text-blue-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                                    onClick={() => {
                                      handleEditCourse(course);
                                     
                                      setEditOpen(true);
                                    }}
                                  >
                                    <Edit size={18} />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                    onClick={() => confirmDeleteCourse(course._id)}
                                  >
                                    <Trash2 size={18} />
                                  </Button>
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

            {/* Pagination Controls */}
            <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-medium text-gray-700 dark:text-gray-300">{startIndex + 1}</span> to{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {Math.min(startIndex + coursesPerPage, courses.length)}
                  </span>{" "}
                  of <span className="font-medium text-gray-700 dark:text-gray-300">{courses.length}</span> courses
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
                  
                  {/* Page Numbers */}
                  <div className="hidden sm:flex sm:items-center sm:space-x-1">
                    {generatePaginationNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-1 text-gray-400 dark:text-gray-500">...</span>
                      ) : (
                        <Button
                          key={`page-${page}`}
                          onClick={() => setCurrentPage(Number(page))}
                          className={`h-8 w-8 rounded-md p-0 text-sm font-medium ${
                            currentPage === page
                              ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                          }`}
                          aria-label={`Page ${page}`}
                          aria-current={currentPage === page ? "page" : undefined}
                        >
                          {page}
                        </Button>
                      )
                    ))}
                  </div>
                  
                  {/* Mobile Page Indicator */}
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
                
                {/* Jump to page (desktop only) */}
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
                    className="h-8 w-16 rounded-md border-gray-300 text-center text-sm dark:border-gray-700 dark:bg-gray-800"
                    aria-label="Go to page"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Course Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">Course Details</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex flex-col rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{selectedCourse.courseName}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge className={`${getLevelBadgeColor(selectedCourse.level)}`}>
                    {selectedCourse.level}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                    {selectedCourse.duration}
                  </Badge>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                    ₹{selectedCourse.price}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Category</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{selectedCourse.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Subcategory</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{selectedCourse.subcategory}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Instructor</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{selectedCourse.instructor}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Featured</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{selectedCourse.feturedCourse ? "Yes" : "No"}</p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Languages</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {Array.isArray(selectedCourse.languages) 
                      ? selectedCourse.languages.join(', ') 
                      : selectedCourse.languages}
                  </p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Created At</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {new Date(selectedCourse.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
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
        selectedCourse={selectedCourse}
      />
    </div>
  );
};

export default CoursePage;
