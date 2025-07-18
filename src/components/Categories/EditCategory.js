"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { updateField, resetForm } from "../../lib/slices/categorySlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useUpdateCategoriesMutation } from "@/services/api";

const EditCategoryModal = ({ editOpen, setEditOpen, selectedCategory }) => {
  const dispatch = useDispatch();
  const category = useSelector((state) => state.category);
  const [_UPDATECATEGORY, { isLoading }] = useUpdateCategoriesMutation();

  useEffect(() => {
    if (selectedCategory) {
      Object.keys(selectedCategory).forEach((key) => {
        dispatch(updateField({ field: key, value: selectedCategory[key] }));
      });
    }
  }, [selectedCategory, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateField({ 
      field: name, 
      value: name === "keywords" ? value.split(",").map((kw) => kw.trim()) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await _UPDATECATEGORY({ id: selectedCategory._id, ...category }).unwrap();
      toast.success("category updated successfully");
      setEditOpen(false);
      dispatch(resetForm());
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to update category. Please try again."
      );
    }
  };

  return (
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <DialogContent className="w-[400px] rounded-lg bg-white p-6 text-black shadow-lg">
          <DialogHeader className="mb-4 flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">
              Edit category
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              placeholder="Category Name"
              value={category?.name || ""}
              onChange={handleChange}
              required
              className="border border-gray-300 bg-white p-2 rounded-lg text-black focus:ring-2 focus:ring-blue-500"
            />
            <Input
              name="description"
              placeholder="Description"
              value={category?.description || ""}
              onChange={handleChange}
              required
              className="border border-gray-300 bg-white p-2 rounded-lg text-black focus:ring-2 focus:ring-blue-500"
            />
            <Input
              name="keywords"
              placeholder="Keywords (comma separated)"
              value={category?.keywords || ""}
              onChange={handleChange}
              required
              className="border border-gray-300 bg-white p-2 rounded-lg text-black focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white p-2 rounded-lg font-medium hover:bg-blue-600"
            >
              {isLoading ? "Updating..." : "Update Category"}
            </Button>
          </form>
        </DialogContent>
      </motion.div>
    </Dialog>
  );
};

export default EditCategoryModal;
