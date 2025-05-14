"use client";
import React, { useEffect, useState } from "react";
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
import { ChevronUp, ChevronDown, Eye, Trash2, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { useDeleteAgentMutation, useFetchAgentQuery } from "@/services/api";
import { toast } from "sonner";
import AddCourseModal from "../../../../components/Courses/AddCourseVideo";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

const CourseVideoPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseVideo[]>([]); // Initialize state for courses
  const [viewOpen, setViewOpen] = useState(false);
  const [sortField, setSortField] = useState<keyof CourseVideo | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedCourse, setSelectedCourse] = useState<CourseVideo | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const coursesPerPage = 10;
  const { data: courseData, isLoading } = useFetchAgentQuery(undefined);
  const fetchedCourses: CourseVideo[] = courseData?.data || []; // Renamed to avoid conflict
  const startIndex = (currentPage - 1) * coursesPerPage;

  const [_DELETEAGENT] = useDeleteAgentMutation();

  const handleSort = (field: keyof CourseVideo) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredCourses = fetchedCourses.filter((course) =>
    Object.values(course).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (!sortField) return 0;
    return sortOrder === "asc"
      ? a[sortField] > b[sortField]
        ? 1
        : -1
      : a[sortField] < b[sortField]
        ? 1
        : -1;
  });

  const totalPages = Math.ceil(sortedCourses.length / coursesPerPage);
  const displayedCourses = sortedCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage,
  );

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const response = await _DELETEAGENT({ id: courseId }).unwrap();
      if (response?.success) {
        toast.success("Course deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete the course. Please try again.");
    }
  };

  useEffect(() => {
    if (courseData) {
      setCourses(courseData.data);
    }
  }, [courseData]);

  const handleAddCourse = (newCourse: CourseVideo) => {
    setCourses((prevCourses) => [...prevCourses, newCourse]);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 overflow-hidden">
      {/* Mobile Header with Menu Button */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
        <button 
          onClick={toggleSidebar}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Course Videos</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      <div className="flex flex-1">
        {/* Sidebar - responsive with overlay for mobile */}
        <aside 
          className={`fixed left-0 top-0 z-40 h-screen w-64 transform overflow-y-auto bg-white shadow-lg transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:sticky md:top-0 md:translate-x-0 md:h-screen`}
        >
          {/* Add padding to the top of sidebar content to prevent it from going under the navbar */}
          <div className="h-16 md:h-0"></div> {/* Spacer for mobile header */}
          <Sidebar userRole="admin" />
        </aside>
        
        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden" 
            onClick={toggleSidebar}
            aria-hidden="true"
          ></div>
        )}

      {/* Main Content */}
      <main className="w-full flex-1 overflow-x-hidden pt-16">
        <div className="container mx-auto px-4 py-6">
          <Card className="mb-6 overflow-hidden border-none bg-white shadow-md">
            <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Course Videos Management
                </CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                  <Input
                    type="text"
                    placeholder="Search courses..."
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="h-10 w-full bg-green-500 text-white transition-colors hover:bg-green-600 md:w-auto"
                  >
                    + Add Course
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="w-full text-black">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
                      <TableHead className="hidden py-3 text-center sm:table-cell">#</TableHead>
                      <TableHead 
                        className="cursor-pointer py-3"
                        onClick={() => handleSort("courseName")}
                      >
                        <div className="flex items-center">
                          Course Name
                          {sortField === "courseName" && (
                            <span className="ml-1">
                              {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="hidden py-3 md:table-cell">Videos</TableHead>
                      <TableHead className="py-3 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {isLoading
                        ? Array.from({ length: 7 }).map((_, index) => (
                            <TableRow key={index} className="border-b border-gray-100">
                              <TableCell className="hidden sm:table-cell">
                                <Skeleton className="h-4 w-6" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-4 w-24" />
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Skeleton className="h-4 w-24" />
                              </TableCell>
                              <TableCell className="flex justify-center gap-2 sm:gap-4">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-6 w-6 rounded-full" />
                              </TableCell>
                            </TableRow>
                          )) : displayedCourses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-6 text-center text-gray-500">
                            No courses available. Add a new course to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                      displayedCourses.map((course, index) => (
                        <TableRow
                          key={course.id}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                        >
                          <TableCell className="hidden text-center font-medium sm:table-cell">{startIndex + index + 1}</TableCell>
                          <TableCell>
                            <div className="md:hidden">
                              <p className="font-medium">{course.courseName}</p>
                              {course.videos?.length > 0 ? (
                                <div className="mt-1 space-y-1">
                                  <p className="text-xs text-gray-500">
                                    {course.videos.length} video{course.videos.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              ) : (
                                <p className="mt-1 text-xs italic text-gray-500">
                                  No videos
                                </p>
                              )}
                            </div>
                            <span className="hidden font-medium md:inline">{course.courseName}</span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {course.videos?.length > 0 ? (
                              <div className="space-y-1">
                                {course.videos.map((video, i) => (
                                  <div key={i} className="rounded-md bg-blue-50 p-2 text-sm">
                                    <span className="font-medium text-blue-700">{video.videoName}</span>
                                    <span className="ml-2 text-xs text-gray-500">({video.videoId})</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm italic text-gray-500">
                                No videos available
                              </p>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 transition-all duration-200 hover:bg-cyan-100 hover:text-cyan-700 hover:shadow-md dark:bg-cyan-900/20 dark:text-cyan-400 dark:hover:bg-cyan-900/30 dark:hover:text-cyan-300"
                                onClick={() => {
                                  setSelectedCourse(course);
                                  setViewOpen(true);
                                }}
                                aria-label="View course details"
                              >
                                <Eye size={16} className="transition-transform group-hover:scale-110" />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">View details</span>
                              </button>
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                onClick={() => {
                                  handleDeleteCourse(course._id);
                                }}
                                aria-label="Delete course"
                              >
                                <Trash2 size={16} className="transition-transform group-hover:scale-110" />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">Delete course</span>
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

          {/* View Course Dialog */}
          <Dialog open={viewOpen} onOpenChange={setViewOpen}>
            <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-lg bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
              <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:bg-gray-800 dark:border-gray-700">
                <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">Course Details</DialogTitle>
              </DialogHeader>
              {selectedCourse ? (
                <div className="p-6">
                  <div className="mb-6 flex items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-600 dark:from-cyan-900/30 dark:to-blue-900/30 dark:text-cyan-400">
                      <span className="text-2xl font-bold">{selectedCourse.courseName.charAt(0)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-lg border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-2 dark:from-cyan-900/20 dark:to-blue-900/20">
                        <h3 className="font-medium text-cyan-800 dark:text-cyan-300">Course Information</h3>
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        <div className="grid grid-cols-3 px-4 py-3">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Course Name</span>
                          <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">{selectedCourse.courseName}</span>
                        </div>
                        <div className="grid grid-cols-3 px-4 py-3">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</span>
                          <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                            {new Date(selectedCourse.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-hidden rounded-lg border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-2 dark:from-cyan-900/20 dark:to-blue-900/20">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-cyan-800 dark:text-cyan-300">Videos</h3>
                          <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-medium text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300">
                            {selectedCourse.videos?.length || 0}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        {selectedCourse.videos?.length > 0 ? (
                          <div className="space-y-3">
                            {selectedCourse.videos.map((video, i) => (
                              <div 
                                key={i} 
                                className="group overflow-hidden rounded-md border border-gray-100 bg-white p-3 transition-all hover:border-cyan-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-cyan-900/30"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                                    <span className="text-xs font-bold">{i+1}</span>
                                  </div>
                                  <div className="flex-1 overflow-hidden">
                                    <p className="truncate font-medium text-gray-800 dark:text-gray-200">{video.videoName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {video.videoId}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex h-20 items-center justify-center rounded-md border border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-center text-sm italic text-gray-500 dark:text-gray-400">No videos available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-center text-gray-500 dark:text-gray-400">No course selected.</p>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Enhanced Pagination Controls */}
          <div className="mt-6 rounded-lg bg-white p-4 shadow-md">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">{startIndex + 1}</span> to{" "}
                <span className="font-medium text-gray-700">
                  {Math.min(startIndex + coursesPerPage, sortedCourses.length)}
                </span>{" "}
                of <span className="font-medium text-gray-700">{sortedCourses.length}</span> courses
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 rounded-md bg-cyan-50 p-0 text-cyan-600 transition-colors hover:bg-cyan-100 disabled:bg-gray-50 disabled:text-gray-400"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Page Numbers */}
                <div className="hidden sm:flex sm:items-center sm:space-x-1">
                  {generatePaginationNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-1 text-gray-400">...</span>
                    ) : (
                      <Button
                        key={`page-${page}`}
                        onClick={() => setCurrentPage(Number(page))}
                        className={`h-8 w-8 rounded-md p-0 text-sm font-medium ${
                          currentPage === page
                            ? "bg-cyan-600 text-white hover:bg-cyan-700"
                            : "bg-cyan-50 text-cyan-600 hover:bg-cyan-100"
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
                <span className="text-sm font-medium text-gray-700 sm:hidden">
                  Page {currentPage} of {totalPages || 1}
                </span>
                
                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="h-8 w-8 rounded-md bg-cyan-50 p-0 text-cyan-600 transition-colors hover:bg-cyan-100 disabled:bg-gray-50 disabled:text-gray-400"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Jump to page (desktop only) */}
              <div className="hidden items-center space-x-2 lg:flex">
                <span className="text-sm text-gray-500">Go to page:</span>
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
                  className="h-8 w-16 rounded-md border-gray-300 text-center text-sm"
                  aria-label="Go to page"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>

      {/* Custom Scrollbar Styling */}
      <style jsx global>{`
        body {
          overflow-x: hidden;
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
      `}</style>

      {/* Add Course Modal */}
      <AddCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddCourse={handleAddCourse} // Pass the callback to the modal
             />
    </div>
  );
};

export default CourseVideoPage;
