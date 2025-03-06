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
import { ChevronUp, ChevronDown, Eye, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDeleteAgentMutation, useFetchAgentQuery } from "@/services/api";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { toast } from "sonner";
import AddCourseModal from "../../../../../components/Courses/AddCourseVideo"

// Define CourseVideo type with video array
interface CourseVideo {
  _id: string;
  id: string;
  courseName: string;
  category: string;
  price: string;
  rating: number;
  feature: string;
  videos: {
    videoName: string;
    videoId: string;
  }[];
  createdAt: string;
}

const CourseVideoPage: React.FC = () => {
  const [sortField, setSortField] = useState<keyof CourseVideo | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedCourse, setSelectedCourse] = useState<CourseVideo | null>(
    null,
  );
  const [viewOpen, setViewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const coursesPerPage = 10;
  const { data: courseData, isLoading } = useFetchAgentQuery(undefined);
  const courses: CourseVideo[] = courseData?.data || [];
  const startIndex = (currentPage - 1) * coursesPerPage;

  const [_DELETEAGENT, { isLoading: isDeleteLoading, error: deleteError }] =
    useDeleteAgentMutation();

  const handleSort = (field: keyof CourseVideo) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredCourses = courses.filter((course) =>
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
      toast.error(
        error?.data?.message ||
          "Failed to delete the course. Please try again.",
      );
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <nav className="fixed top-0 z-10 flex w-full items-center justify-between bg-white p-4 shadow-md">
        <h1 className="ml-20 text-3xl font-semibold text-black">Paarsh Edu</h1>
        <Button className="mr-8 bg-blue-500 text-white hover:bg-blue-600">
          Logout
        </Button>
      </nav>

      <div className="flex flex-1 pt-16">
        <Sidebar />
     </div>
               {/* Main Content */}
                  <div className="ml-64 flex-1 overflow-auto  p-6">
                    <div className="my-6 flex items-center justify-between rounded-lg bg-white p-5 shadow-md">
                      <h2 className="text-2xl font-bold text-gray-600">Courses</h2>
                      <AddCourseModal isOpen={undefined} onClose={undefined} />
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
                    <TableHead onClick={() => handleSort("category")}>
                      Category{" "}
                      {sortField === "category" &&
                        (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown />)}
                    </TableHead>
                    <TableHead>Videos</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedCourses.map((course, index) => (
                      <TableRow
                        key={course.id}
                        className="border-b border-gray-300 hover:bg-gray-200"
                      >
                        <TableCell>{startIndex + index + 1}</TableCell>
                        <TableCell>{course.courseName}</TableCell>
                        <TableCell>{course.category}</TableCell>
                        <TableCell>
                          {/* {course.videos.map((video, i) => (
                            <p key={i} className="text-sm text-gray-700">
                              {video.videoName} ({video.videoId})
                            </p>
                          ))} */}
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
        </div>
      </div>

  );
};

export default CourseVideoPage;
