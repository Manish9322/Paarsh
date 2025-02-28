"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateField,
  setThumbnail,
  resetForm,
} from "../../lib/slices/courseSlice";
import { useUpdateCourseMutation } from "../../services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const EditCourseDialog = ({ editOpen, setEditOpen, selectedCourse }) => {
  const dispatch = useDispatch();
  const [_UPDATECOURSE, { isLoading }] = useUpdateCourseMutation();
  const formData = useSelector((state) => state.course);

  useEffect(() => {
    if (selectedCourse) {
      Object.keys(selectedCourse).forEach((key) => {
        dispatch(updateField({ field: key, value: selectedCourse[key] }));
      });
    }
  }, [selectedCourse, dispatch]);

  const handleInputChange = (e) => {
    const { name, type, checked, value } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    dispatch(updateField({ field: name, value: newValue }));
  };

  const handleSelectChange = (field, value) => {
    dispatch(updateField({ field, value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    dispatch(setThumbnail(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await _UPDATECOURSE({ id: selectedCourse._id, ...formData }).unwrap();
      toast.success("Course updated successfully");
      setEditOpen(false);
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error(
        error?.data?.message ||
          "Failed to update the course. Please try again.",
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
        <DialogContent className="fixed left-1/2 top-1/2 w-full max-w-4xl p-0 -translate-x-1/2 -translate-y-1/2 overflow-hidden scrollbar-hidden rounded-lg bg-white shadow-xl transition-all duration-300 ease-in-out">
        <DialogHeader className="sticky w-full top-0 z-10 bg-white p-5 shadow-md">
          <DialogTitle className="text-2xl flex justify-between font-semibold p-2 text-gray-800">
            <h1>Update Course</h1>
            <button variant="ghost" className="text-black" onClick={() => setOpen(false)}>
            <X size={30}/>
          </button>
          </DialogTitle>
        </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Category and Subcategory */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-black">Category</Label>
                  <Select
                    value={formData.courseCategory || ""}
                    onValueChange={(value) =>
                      handleSelectChange("courseCategory", value)
                    }
                  >
                    <SelectTrigger className="border  border-gray-300 bg-white text-black">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black shadow-md">
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-black">SubCategory</Label>
                  <Select
                    value={formData.courseSubCategory || ""}
                    onValueChange={(value) =>
                      handleSelectChange("courseSubCategory", value)
                    }
                  >
                    <SelectTrigger className="border   border-gray-300 bg-white text-black">
                      <SelectValue placeholder="Select Subcategory" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black shadow-md">
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Course Name */}
              <div>
                <Label className="text-black">Course Name</Label>
                <Input
                  name="courseName"
                  value={formData.courseName || ""}
                  onChange={handleInputChange}
                  required
                  className="border   border-gray-300 bg-white text-black "
                />
              </div>
              <div>
                <Label className="text-black">Instructor</Label>
                <Input
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleInputChange}
                  required
                  className="border   border-gray-300 bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-black">Duration</Label>
                  <Input
                    name="courseDuration"
                    value={formData.courseDuration}
                    onChange={handleInputChange}
                    required
                    className="border  border-gray-300 bg-white text-black"
                  />
                </div>
                <div>
                  <Label className="text-black">Fees ($)</Label>
                  <Input
                    type="number"
                    name="courseFees"
                    value={formData.courseFees}
                    onChange={handleInputChange}
                    required
                    className="border  border-gray-300 bg-white text-black focus:outline-none "
                  />
                </div>
              </div>

              {/* Course Type */}
              <div>
                <Label className="text-black">Course Type</Label>
                <Select
                  value={formData.courseType || ""}
                  onValueChange={(value) =>
                    handleSelectChange("courseType", value)
                  }
                >
                  <SelectTrigger className="border   border-gray-300 bg-white text-black">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black shadow-md">
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Level */}
              <div>
                <Label className="text-black">Level</Label>
                <Select
                  value={formData.level || ""}
                  onValueChange={(value) => handleSelectChange("level", value)}
                >
                  <SelectTrigger className="border   border-gray-300 bg-white text-black">
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black shadow-md">
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Course Availability */}
              <div>
                <Label className="text-black">Availability</Label>

                <Select
                  value={formData.availability || ""}
                  onValueChange={(value) =>
                    handleSelectChange("availability", value)
                  }
                >
                  <SelectTrigger className="border  border-gray-300 bg-white text-black">
                    <SelectValue
                      placeholder="Select Availability"
                      className="text-black"
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black shadow-md">
                    <SelectItem
                      className="text-black hover:bg-gray-200"
                      value="Available"
                    >
                      Available
                    </SelectItem>
                    <SelectItem
                      className="text-black hover:bg-gray-200"
                      value="Unavailable"
                    >
                      Unavailable
                    </SelectItem>
                    <SelectItem
                      className="text-black hover:bg-gray-200"
                      value="Upcoming"
                    >
                      Upcoming
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Short Description */}
              <div>
                <Label className="text-gray-700">Short Description</Label>
                <Textarea
                  name="shortDescription"
                  value={formData.shortDescription || ""}
                  onChange={handleInputChange}
                  className="min-h-[80px] border   border-gray-300 bg-white text-black"
                  required
                />
              </div>

              {/* Long Description */}
              <div>
                <Label className="text-gray-700">Long Description</Label>
                <Textarea
                  name="longDescription"
                  value={formData.longDescription || ""}
                  onChange={handleInputChange}
                  className="min-h-[120px] border   border-gray-300 bg-white text-black"
                  required
                />
              </div>

              {/* Thumbnail */}
              <div>
                <Label className="text-black">Thumbnail Image</Label>
                <div className="relative flex h-32 w-32 cursor-pointer items-center justify-center border-2  border-gray-300">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={handleThumbnailChange}
                  />
                  {formData.thumbnail ? (
                    <img
                      src={URL.createObjectURL(formData.thumbnailImage)}
                      alt="Thumbnail Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Plus size={40} className="text-black" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="checkbox"
                  id="featured"
                  name="feturedCourse"
                  className="h-5 w-5 rounded bg-white text-white  checked:bg-blue-600  focus:ring-blue-600 "
                  onChange={handleInputChange}
                  checked={formData.feturedCourse}
                />
                <Label htmlFor="featured" className="text-gray-700">
                  Featured Course
                </Label>
              </div>

              <div>
                <Label className="text-gray-700">Keywords</Label>
                <Input
                  placeholder="Enter keywords (comma separated)"
                  className="border  border-gray-300 bg-white text-black"
                  required
                  name="keywords"
                  onChange={handleInputChange}
                  value={formData.keywords || ""}
                />
              </div>

              <div className=" bottom-0 z-10 flex justify-end gap-4 bg-white p-5 ">
                <Button
                  variant="outline"
                  className="text-white"
                  onClick={() => setEditOpen(false)}
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </motion.div>
    </Dialog>
  );
};

export default EditCourseDialog;
