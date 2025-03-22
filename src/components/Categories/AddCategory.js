"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { updateField, resetForm } from "../../lib/slices/categorySlice";
import { useAddCategoryMutation } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogTrigger } from "@radix-ui/react-dialog";

const AddCategoryModal = () => {
  const dispatch = useDispatch();
  const category = useSelector((state) => state.category);
  const [open, setOpen] = useState(false);

  const [_ADDCATEGORY, { isLoading }] = useAddCategoryMutation();

  const handleChange = (e) => {
    dispatch(updateField({ field: e.target.name, value: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await _ADDCATEGORY(category).unwrap();
      if (response?.success) {
        toast.success("Category added successfully");
        setOpen(false);
        dispatch(resetForm());
      }
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to add category. Please try again.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 text-white hover:bg-green-700">
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[400px] rounded-lg bg-white p-6 text-black shadow-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold">
            Add Category
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            placeholder="Category Name"
            
            onChange={handleChange}
            required
            className="rounded-lg border border-gray-300 bg-white p-2 text-black focus:ring-2 focus:ring-blue-500"
          />
          <Input
            name="description"
            placeholder="Description"
            
            onChange={handleChange}
            required
            className="rounded-lg border border-gray-300 bg-white p-2 text-black focus:ring-2 focus:ring-blue-500"
          />
          <Input
            name="keywords"
            placeholder="Keywords (comma separated)"
            
            onChange={handleChange}
            required
            className="rounded-lg border border-gray-300 bg-white p-2 text-black focus:ring-2 focus:ring-blue-500"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-500 p-2 font-medium text-white hover:bg-blue-600"
          >
            {isLoading ? "Adding..." : "Add Category"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryModal;
