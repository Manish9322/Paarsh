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
} from "@/components/ui/dialog";
import { Eye, Edit, Trash2 } from "lucide-react";
import { EditCourse } from "../../components/Courses/EditCourses";
import {
  useDeleteCourseMutation,
  useFetchCourcesQuery,
} from "../../services/api";
import { toast } from "sonner";
import { AddNewCourse } from "@/components/AddNewCourseModal";

// Define Course type
interface Course {
  id: number;
  _id: string;
  availability: string;
  category: string;
  subcategory: string;
  courseName: string;
  instructor: string;
  duration: string;
  price: number;
  level: string;
  feturedCourse: boolean;
  languages: string[];
  createdAt: string;
}

const AdminPage: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 10;

  // Fetch courses data
  const {
    data: courseData,
    isLoading,
    error,
  } = useFetchCourcesQuery(undefined);
  const courses: Course[] = courseData?.data || [];

  console.log("courses", courses);  

  const [_DELETECOURSE, { isLoading: isDeleteLoading, error: deleteError }] =
    useDeleteCourseMutation();
  // Pagination logic
  const totalPages = Math.ceil(courses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const displayedCourses = courses.slice(
    startIndex,
    startIndex + coursesPerPage,
  );

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const response = await _DELETECOURSE({ id: courseId }).unwrap();

      if (response?.success) {
        toast.success("Course updated successfully");
      }
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error(
        error?.data?.message ||
          "Failed to Delete the course. Please try again.",
      );
    }
  };
  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="fixed top-0 z-10 flex w-full items-center justify-between bg-white p-4 shadow-md">
        <h1 className="ml-20 text-3xl font-semibold text-black">PaarshEdu</h1>
        <Button className="mr-8 bg-blue-500 text-white hover:bg-blue-600">
          Logout
        </Button>
      </nav>

      {/* Sidebar & Main Content Wrapper */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <div className="fixed bg-white shadow-md md:relative">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 overflow-auto  p-6">
          <div className="my-6 flex items-center justify-between rounded-lg bg-white p-5 shadow-md">
            <h2 className="text-2xl font-bold text-gray-600">Courses</h2>
            <AddNewCourse />
          </div>

          {/* Courses Table */}
          <Card className="overflow-hidden border border-gray-300 bg-white hover:shadow-md">
            <CardContent className="p-4">
              <div className="custom-scrollbar overflow-x-auto">
                <Table className="w-full text-black">
                  <TableHeader>
                    <TableRow className="border-b border-gray-300 hover:bg-gray-200">
                      <TableHead>#</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Fees ($)</TableHead>
                      <TableHead>Languages</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={14} className="p-4 text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell
                          colSpan={14}
                          className="p-4 text-center text-red-500"
                        >
                          Failed to load courses
                        </TableCell>
                      </TableRow>
                    ) : displayedCourses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={14} className="p-4 text-center">
                          No courses available
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedCourses.map((course, index) => (
                        <TableRow
                          key={course._id}
                          className="border-b border-gray-300 hover:bg-gray-200"
                        >
                          <TableCell>{startIndex + index + 1}</TableCell>
                          <TableCell>{course.availability}</TableCell>
                          <TableCell>{course.category}</TableCell>
                          <TableCell>{course.courseName}</TableCell>
                          <TableCell>{course.level}</TableCell>
                          <TableCell>{course.duration}</TableCell>
                          <TableCell>{course.price}</TableCell>
                          <TableCell>{course.languages}</TableCell>
                          <TableCell>
                            {new Date(course.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="flex justify-center gap-4">
                            <button
                              className="text-green-600  "
                              onClick={() => {
                                setSelectedCourse(course);
                                setViewOpen(true);
                              }}
                            >
                              <Eye size={22} />
                            </button>
                            <button
                              className="text-blue-600"
                              onClick={() => {
                                setSelectedCourse(course);
                                setEditOpen(true);
                              }}
                            >
                              <Edit size={20} />
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
              </div>
            </CardContent>
          </Card>

          {/* View Course Dialog */}
          <Dialog open={viewOpen} onOpenChange={setViewOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Course Details</DialogTitle>
              </DialogHeader>
              {selectedCourse && (
                <div>
                  <p>
                    <strong>{selectedCourse.category}</strong>
                  </p>
                  <p>Subcategory: {selectedCourse.subcategory}</p>
                  <p>Course Name: {selectedCourse.courseName}</p>
                  <p>Instructor: {selectedCourse.instructor}</p>
                  <p>Duration: {selectedCourse.duration}</p>
                  <p>Fees: {selectedCourse.price}</p>
                  <p>Level: {selectedCourse.level}</p>
                  <p>Featured: {selectedCourse.feturedCourse ? "Yes" : "No"}</p>
                  <p>Languages: {selectedCourse.languages}</p>
                  <p>
                    Created At:{" "}
                    {new Date(selectedCourse.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Course Modal */}
          {/* <EditCourseModal
            editOpen={editOpen}
            setEditOpen={setEditOpen}
            selectedCourse={selectedCourse}
          /> */}

          <EditCourse
            editOpen={editOpen}
            setEditOpen={setEditOpen}
            selectedCourse={selectedCourse}
          />

          {/* Pagination Controls */}
          <div className="mt-4 flex items-center justify-between">
            {/* Placeholder div to push "Page X of Y" to the center */}
            <div className="w-1/3"></div>

            {/* Centered Page Info */}
            <span className="w-1/3 text-center font-semibold text-gray-800">
              Page {currentPage} of {totalPages}
            </span>

            {/* Next & Previous Buttons (Aligned to Right) */}
            <div className="flex w-1/3 justify-end">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="mr-2 bg-blue-700 text-white"
              >
                Previous
              </Button>
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="ml-2 bg-blue-600 text-white "
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styling */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: WhiteSmoke;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: #ffff;
        }
      `}</style>
    </div>
  );
};

export default AdminPage;
