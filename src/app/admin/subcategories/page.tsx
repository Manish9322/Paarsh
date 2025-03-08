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
import { toast } from "sonner";
import AddSubCategoryModal from "../../../components/Categories/AddSubCategory"
import EditSubCategoryModal from "@/components/Categories/EditSubCategory";
import { useDeleteSubCategoriesMutation, useFetchSubCategoriesQuery } from "@/services/api";
interface Subcategory {
  id: number;
  _id: string;
  categoryName: string;
  subcategoryName: string;
  description: string;
  keywords: string[];
  createdAt: string;
}

const SubcategoriesPage: React.FC = () => {
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: subcategoryData, isLoading, error } = useFetchSubCategoriesQuery(undefined);
  const subcategories: Subcategory[] = subcategoryData?.data || [];

  console.log("Subcategory Data: ", subcategoryData);

  const [_DELETE_SUBCATEGORY] = useDeleteSubCategoriesMutation();

  const totalPages = Math.ceil(subcategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedSubcategories = subcategories.slice(startIndex, startIndex + itemsPerPage);

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    try {
      const response = await _DELETE_SUBCATEGORY({ id: subcategoryId }).unwrap();
      if (response?.success) {
        toast.success("Subcategory deleted successfully");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete subcategory. Please try again.");
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <nav className="fixed top-0 z-10 flex w-full items-center justify-between bg-white p-4 shadow-md">
        <h1 className="ml-20 text-3xl font-semibold text-black">PaarshEdu</h1>
        <Button className="mr-8 bg-blue-500 text-white hover:bg-blue-600">Logout</Button>
      </nav>

      <div className="flex flex-1 pt-16">
        <div className="fixed bg-white shadow-md md:relative">
          <Sidebar />
        </div>

        <div className="ml-64 flex-1 overflow-auto p-6">
          <div className="flex items-center my-6 p-5 rounded-lg bg-white shadow-md justify-between">
            <h2 className="text-2xl font-bold text-gray-600">Subcategories</h2>
            <AddSubCategoryModal />
          </div>

          <Card className="overflow-hidden border border-gray-300 bg-white hover:shadow-md">
            <CardContent className="p-4">
              <Table className="w-full text-black">
                <TableHeader>
                  <TableRow className="border-b border-gray-300 hover:bg-gray-200">
                    <TableHead>#</TableHead>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Subcategory Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Keywords</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="p-4 text-center">Loading...</TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="p-4 text-center text-red-500">Failed to load subcategories</TableCell>
                    </TableRow>
                  ) : displayedSubcategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="p-4 text-center">No subcategories available</TableCell>
                    </TableRow>
                  ) : (
                    displayedSubcategories.map((subcategory, index) => (
                      <TableRow key={subcategory.id} className="border-b border-gray-300 hover:bg-gray-200">
                        <TableCell>{startIndex + index + 1}</TableCell>
                        <TableCell>{subcategory.categoryName}</TableCell>
                        <TableCell>{subcategory.subcategoryName}</TableCell>
                        <TableCell>{subcategory.description}</TableCell>
                        <TableCell>{subcategory.keywords.join(", ")}</TableCell>
                        <TableCell className="flex gap-4 justify-center">
                          <button className="text-green-600" onClick={() => { setSelectedSubcategory(subcategory); setViewOpen(true); }}>
                            <Eye size={22} />
                          </button>
                          <button className="text-blue-600" onClick={() => { setSelectedSubcategory(subcategory); setEditOpen(true); }}>
                            <Edit size={20} />
                          </button>
                          <button className="text-red-600" onClick={() => handleDeleteSubcategory(subcategory._id)}>
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

                {/* View Course Dialog */}
                <Dialog open={viewOpen} onOpenChange={setViewOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Category Details</DialogTitle>
              </DialogHeader>
              {selectedSubcategory && (
                <div>
                  <p>
                    <strong>{selectedSubcategory.description}</strong>
                  </p>
                  <p>Category Name: {selectedSubcategory.categoryName}</p>
                  <p>Description: {selectedSubcategory.description}</p>
                  <p>keywords: {selectedSubcategory.keywords.join(", ")}</p>
                  <p>
                    Created At:{" "}
                    {new Date(selectedSubcategory.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Course Modal */}
          <EditSubCategoryModal
            editOpen={editOpen}
            setEditOpen={setEditOpen}
            selectedSubcategory={selectedSubcategory}
          />
        </div>
      </div>
    </div>
  );
};

export default SubcategoriesPage;