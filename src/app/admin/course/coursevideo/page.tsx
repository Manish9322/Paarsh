"use client";
import React, { useEffect, useState } from "react";
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
import { ChevronUp, ChevronDown, Eye, Trash2 } from "lucide-react";
import { useDeleteAgentMutation, useFetchAgentQuery } from "@/services/api";
import { toast } from "sonner";
import AddCourseModal from "../../../../components/Courses/AddCourseVideo";
import { Skeleton } from "@/components/ui/skeleton";

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

  return (
    <div className="flex h-screen flex-col bg-gray-100">

      <div className="flex pt-16">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 overflow-auto p-6">
        <div className="my-6 flex items-center justify-between rounded-lg bg-white p-5 shadow-md">
          <h2 className="text-2xl font-bold text-gray-600">Courses</h2>
          <button
            className="rounded bg-blue-600 px-3 py-3 text-sm text-white transition hover:bg-blue-700 dark:bg-white dark:text-black"
            onClick={() => setIsModalOpen(true)}
          >
            Add Course
          </button>
        </div>

        <Card className="border border-gray-300 bg-white hover:shadow-md">
          <CardContent className="p-4">
            <Table className="w-full text-black">
              <TableHeader>
                <TableRow className="border-b border-gray-300 hover:bg-gray-200">
                  <TableHead>#</TableHead>
                  <TableHead onClick={() => handleSort("courseName")}>
                    Course Name{" "}
                    {sortField === "courseName" &&
                      (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown />)}
                  </TableHead>
                  <TableHead>Videos</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {isLoading
                    ? Array.from({ length: 7 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton className="h-4 w-6" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell className="flex justify-center gap-4">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-6 w-6 rounded-full" />
                          </TableCell>
                        </TableRow>
                      )) : (
                  displayedCourses.map((course, index) => (
                    <TableRow
                      key={course.id}
                      className="border-b border-gray-300 hover:bg-gray-200"
                    >
                      <TableCell>{startIndex + index + 1}</TableCell>
                      <TableCell>{course.courseName}</TableCell>
                      <TableCell>
                        {course.videos?.length > 0 ? (
                          course.videos.map((video, i) => (
                            <p key={i} className="text-sm text-gray-700">
                              {video.videoName} ({video.videoId})
                            </p>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            No videos available
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="flex justify-center gap-4">
                        <button
                          className="text-green-600"
                          onClick={() => {
                            setSelectedCourse(course);
                            setViewOpen(true);
                          }}
                        >
                          <Eye size={22} />
                        </button>
                        <button
                          className="text-red-600"
                          onClick={() => {
                            handleDeleteCourse(course._id);
                          }}
                        >
                          <Trash2 size={20} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add Course Modal */}
        <AddCourseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddCourse={handleAddCourse} // Pass the callback to the modal
          selectedCourse={undefined}        />
      </div>
    </div>
  );
};

export default CourseVideoPage;
