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
import AddCourseDialog from "@/components/Courses/AddCourse";
import EditCourseModal from "@/components/Courses/EditCourse";
import { toast } from "sonner";
import {
  useDeleteCategoriesMutation,
  useFetchCategoriesQuery,
} from "@/services/api";
import AddCategoryModal from "@/components/Categories/AddCategory";
import EditCategoryModal from "@/components/Categories/EditCategory";

// Define Course type
interface Category {
  id: number;
  _id: string;
  name: string;
  description: string;
  keywords: string[];
  createdAt: string;
}

const AdminPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 10;

  // Fetch courses data
  const {
    data: categoryData,
    isLoading,
    error,
  } = useFetchCategoriesQuery(undefined);
  const courses: Category[] = categoryData?.data || [];

  const [_DELETECATEGORY, { isLoading: isDeleteLoading, error: deleteError }] =
    useDeleteCategoriesMutation();
  // Pagination logic
  const totalPages = Math.ceil(courses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const displayedCategories = courses.slice(
    startIndex,
    startIndex + coursesPerPage,
  );

  const handleDeleteCategory = async (courseId: string) => {
    try {
      const response = await _DELETECATEGORY({ id: courseId }).unwrap();

      if (response?.success) {
        toast.success("Category deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(
        error?.data?.message ||
          "Failed to Delete the category. Please try again.",
      );
    }
  };

  
  return (
    <div className="flex h-screen flex-col bg-gray-100">
 
      {/* Sidebar & Main Content Wrapper */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <div className="fixed bg-white shadow-md md:relative">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 overflow-auto  p-6">
          <div className="my-6 flex items-center justify-between rounded-lg bg-white p-5 shadow-md">
            <h2 className="text-2xl font-bold text-gray-600">Categories</h2>
            <AddCategoryModal />
          </div>

          {/* Courses Table */}
          <Card className="overflow-hidden border border-gray-300 bg-white hover:shadow-md">
            <CardContent className="p-4">
              <div className="custom-scrollbar overflow-x-auto">
                <Table className="w-full text-black">
                  <TableHeader>
                    <TableRow className="border-b border-gray-300 hover:bg-gray-200">
                      <TableHead>#</TableHead>
                      <TableHead>Category Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>keywords</TableHead>
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
                    ) : displayedCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={14} className="p-4 text-center">
                          No categories available
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedCategories.map((category, index) => (
                        <TableRow
                          key={category.id}
                          className="border-b border-gray-300 hover:bg-gray-200"
                        >
                          <TableCell>{startIndex + index + 1}</TableCell>
                          <TableCell>{category.name}</TableCell>
                          <TableCell>{category.description}</TableCell>
                          <TableCell>{category.keywords.join(", ")}</TableCell>
                          <TableCell>
                            {new Date(category.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="flex justify-center gap-4">
                            <button
                              className="text-green-600  "
                              onClick={() => {
                                setSelectedCategory(category);
                                setViewOpen(true);
                              }}
                            >
                              <Eye size={22} />
                            </button>
                            <button
                              className="text-blue-600"
                              onClick={() => {
                                setSelectedCategory(category);
                                setEditOpen(true);
                              }}
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              className="text-red-600"
                              onClick={() => {
                                handleDeleteCategory(category._id);
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
                <DialogTitle>Category Details</DialogTitle>
              </DialogHeader>
              {selectedCategory && (
                <div>
                  <p>
                    <strong>{selectedCategory.description}</strong>
                  </p>
                  <p>Category Name: {selectedCategory.name}</p>
                  <p>Description: {selectedCategory.description}</p>
                  <p>keywords: {selectedCategory.keywords.join(", ")}</p>
                  <p>
                    Created At:{" "}
                    {new Date(selectedCategory.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Course Modal */}
          <EditCategoryModal
            editOpen={editOpen}
            setEditOpen={setEditOpen}
            selectedCategory={selectedCategory}
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
