"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateField,
  setThumbnail,
  resetForm,
} from "../../lib/slices/courseSlice";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus , X } from "lucide-react";
import { useAddCourseMutation } from "@/services/api";
import { toast } from "sonner";

const AddCourseDialog = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const course = useSelector((state) => state.course);

  const [_ADDCOURSE, { isLoading }] = useAddCourseMutation();

  const handleInputChange = (field, value) => {
    dispatch(updateField({ field, value }));
  };

  const handleThumbnailChange = (event) => {
    const file = event.target.files?.[0];
    if (file) dispatch(setThumbnail(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("Form Data Before Submission:", course);

    const formattedData = {
      courseCategory: course.category || "",
      courseSubCategory: course.subCategory || "",
      courseName: course.courseName || "",
      courseDuration: course.duration || "",
      courseFees: Number(course.fees) || 0,
      languages: ["English", "Hindi"],
      level: course.level || "",
      courseType: course.type || "",
      instructor: course.instructor || "",
      thumbnailImage: course.thumbnail
        ? course.thumbnail
        : "https://via.placeholder.com/150",
      shortDescription: course.shortDescription || "",
      longDescription: course.longDescription || "",
      availability: course.availability || "",
      keywords: course.keywords
        ? course.keywords.split(",").map((kw) => kw.trim())
        : [],
      feturedCourse: Boolean(course.featured),
    };

    try {
      const response = await _ADDCOURSE(formattedData).unwrap();
    
      setOpen(false);
      dispatch(resetForm());
      toast.success("Course added successfully");
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error(
        error?.data?.message ||
          "Failed to add the course. Please try again.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 text-white hover:bg-green-700">
          Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed left-1/2 top-1/2 w-full max-w-4xl p-0 -translate-x-1/2 -translate-y-1/2 overflow-hidden scrollbar-hide rounded-lg bg-white shadow-xl transition-all duration-300 ease-in-out">
        <DialogHeader className="sticky w-full top-0 z-10 bg-white p-5 shadow-md">
          <DialogTitle className="text-2xl flex justify-between font-semibold p-2 text-gray-800">
            <h1>Add New Course</h1>
            <button variant="ghost" className="text-black" onClick={() => setOpen(false)}>
            <X size={30}/>
          </button>
          </DialogTitle>
        </DialogHeader>
        <div className="scrollbar-hide max-h-[70vh] overflow-y-auto p-5">
          <form
            className="space-y-4 overflow-hidden p-4"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-black">Category</Label>
                <Select
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger className="border  border-gray-300 bg-white text-black">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black shadow-md">
                    <SelectItem
                      className="text-black hover:bg-gray-100"
                      value="programming"
                    >
                      Programming
                    </SelectItem>
                    <SelectItem
                      className="text-black hover:bg-gray-100"
                      value="design"
                    >
                      Design
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory */}
              <div>
                <Label className="text-black">SubCategory</Label>
                <Select
                  onValueChange={(value) =>
                    handleInputChange("subCategory", value)
                  }
                >
                  <SelectTrigger className="border  border-gray-300 bg-white text-black">
                    <SelectValue placeholder="Select Subcategory" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black shadow-md">
                    <SelectItem
                      className="text-black hover:bg-gray-100"
                      value="frontend"
                    >
                      Frontend
                    </SelectItem>
                    <SelectItem
                      className="text-black hover:bg-gray-100"
                      value="backend"
                    >
                      Backend
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-gray-700">Course Name</Label>
              <Input
                placeholder="Enter course name"
                className="border  border-gray-300 bg-white text-black"
                required
                onChange={(e) =>
                  handleInputChange("courseName", e.target.value)
                }
              />
            </div>

            <div>
              <Label className="text-gray-700">Instructor</Label>
              <Input
                placeholder="Enter instructor name"
                className="border  border-gray-300 bg-white text-black"
                required
                onChange={(e) =>
                  handleInputChange("instructor", e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-gray-700">Duration</Label>
                <Input
                  placeholder="e.g. 6 Weeks"
                  className="border  border-gray-300 bg-white text-black"
                  required
                  onChange={(e) =>
                    handleInputChange("duration", e.target.value)
                  }
                />
              </div>
              <div>
                <Label className="text-gray-700">Fees ($)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 499"
                  className="border  border-gray-300 bg-white text-black"
                  required
                  onChange={(e) => handleInputChange("fees", e.target.value)}
                />
              </div>
            </div>

            {/* Course Type */}
            <Select onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger className="border  border-gray-300 bg-white text-black">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black shadow-md">
                <SelectItem
                  className="text-black hover:bg-gray-100"
                  value="Online"
                >
                  Online
                </SelectItem>
                <SelectItem
                  className="text-black hover:bg-gray-100"
                  value="Offline"
                >
                  Offline
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Course Level */}
            <Select
              onValueChange={(value) => handleInputChange("level", value)}
            >
              <SelectTrigger className="border  border-gray-300 bg-white text-black">
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black shadow-md">
                <SelectItem
                  className="text-black hover:bg-gray-100"
                  value="Beginner"
                >
                  Beginner
                </SelectItem>
                <SelectItem
                  className="text-black hover:bg-gray-100"
                  value="Intermediate"
                >
                  Intermediate
                </SelectItem>
                <SelectItem
                  className="text-black hover:bg-gray-100"
                  value="Advanced"
                >
                  Advanced
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Course Availability */}
            <Select
              onValueChange={(value) =>
                handleInputChange("availability", value)
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

            <div>
              <Label className="text-gray-700">Thumbnail Image</Label>
              <div className="relative flex h-32 w-32 cursor-pointer items-center justify-center border-2  border-gray-300">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={handleThumbnailChange}
                />
                {course.thumbnail ? (
                  <img
                    src={URL.createObjectURL(course.thumbnail)}
                    alt="Thumbnail Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Plus size={40} className="text-gray-400" />
                )}
              </div>
            </div>

            <div>
              <Label className="text-gray-700">Short Description</Label>
              <Textarea
                placeholder="Enter a short course description"
                className="min-h-[80px] border  border-gray-300 bg-white text-black"
                required
                onChange={(e) =>
                  handleInputChange("shortDescription", e.target.value)
                }
              />
            </div>

            <div>
              <Label className="text-gray-700">Long Description</Label>
              <Textarea
                placeholder="Enter a detailed course description"
                className="min-h-[120px] border  border-gray-300 bg-white text-black"
                required
                onChange={(e) =>
                  handleInputChange("longDescription", e.target.value)
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                className="h-5 w-5 rounded  border-gray-300 bg-white text-blue-600 focus:ring-blue-500"
                onChange={(e) =>
                  handleInputChange("featured", e.target.checked)
                }
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
                onChange={(e) => handleInputChange("keywords", e.target.value)}
              />
            </div>
            <div className="sticky bottom-0 z-10 flex justify-end gap-4 bg-white p-5 border-t border-gray-200">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Submit
          </Button>
        </div>
          </form>
        </div>
      
      </DialogContent>
    </Dialog>
  );
};

export default AddCourseDialog;
