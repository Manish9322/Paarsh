"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateField, resetForm } from "../../lib/slices/subCategorySlice";
import { useAddSubCategoryMutation } from "../../services/api";
import { DialogTrigger } from "@radix-ui/react-dialog";

const AddSubCategoryModal = () => {
  const dispatch = useDispatch();
  const subcategory = useSelector((state) => state.subcategory); // Get subcategory state from Redux
  const [open, setOpen] = useState(false);

  const [_ADDSUBCATEGORY, { isLoading }] = useAddSubCategoryMutation();

  // Handle input change using Redux actions
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "keywords") {
      // Convert comma-separated values into an array
      dispatch(
        updateField({
          field: name,
          value: value.split(",").map((kw) => kw.trim()),
        }),
      );
    } else {
      dispatch(updateField({ field: name, value }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await _ADDSUBCATEGORY(subcategory).unwrap();
      if (response?.success) {
        toast.success("SubCategory added successfully");
        setOpen(false);
        dispatch(resetForm()); // Reset the form after successful submission
      }
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to add Subcategory. Please try again.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 text-white hover:bg-green-700">
          Add SubCategory
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[400px] rounded-lg bg-white p-6 text-black shadow-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold">
            Add SubCategory
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="categoryName"
            placeholder="Category Name"
            value={subcategory.categoryName}
            onChange={handleChange}
            required
            className="rounded-lg border border-gray-300 bg-white p-2 text-black focus:ring-2 focus:ring-blue-500"
          />
          <Input
            name="subcategoryName"
            placeholder="SubCategory Name"
            value={subcategory.subcategoryName}
            onChange={handleChange}
            required
            className="rounded-lg border border-gray-300 bg-white p-2 text-black focus:ring-2 focus:ring-blue-500"
          />
          <Input
            name="description"
            placeholder="Description"
            value={subcategory.description}
            onChange={handleChange}
            required
            className="rounded-lg border border-gray-300 bg-white p-2 text-black focus:ring-2 focus:ring-blue-500"
          />
          <Input
            name="keywords"
            placeholder="Keywords (comma-separated)"
            value={subcategory.keywords?.join(", ")}
            onChange={handleChange}
            className="rounded-lg border border-gray-300 bg-white p-2 text-black focus:ring-2 focus:ring-blue-500"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-500 p-2 font-medium text-white hover:bg-blue-600"
          >
            {isLoading ? "Adding..." : "Add SubCategory"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubCategoryModal;
