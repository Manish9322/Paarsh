"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HiOutlinePlus } from "react-icons/hi";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import TextEditor from "../../components/TextEditor";
import { useDispatch, useSelector } from "react-redux";
import {
  useFetchCategoriesQuery,
  useFetchSubCategoriesQuery,
  useUpdateCourseMutation,
} from "@/services/api";
import {
  updateField,
  addCourseInclude,
  removeCourseInclude,
  addSyllabusOverview,
  removeSyllabusOverview,
  addThought,
  removeThought,
  addTag,
  removeTag,
  setFile,
  resetForm,
} from "../../lib/slices/courseSlice";
import { FaMinus } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const formSchema = z.object({
  courseName: z.string().optional(),
  price: z.string().optional(),
  duration: z.number().min().optional(),
  level: z.string().optional(),
  languages: z.array(z.string()).optional(),
  thumbnail: z.string().optional(),
  syllabus: z.string().optional(),
  summaryText: z.string().optional(),
  taglineIncludes: z.string().optional(),
  overviewTagline: z.string().optional(),
  finalText: z.string().optional(),
  tagline_in_the_box: z.string().optional(),
  tagline: z.string().optional(),
  videoLink: z.string().url("Invalid video link").optional(),
  courseIncludes: z.array(z.string()).optional(),
  syllabusOverview: z.array(z.string()).optional(),
  thoughts: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  availability: z.boolean().optional(),
  certificate: z.boolean().optional(),
  instructor: z.string().optional(),
  featuredCourse: z.boolean().optional(),
});

export function EditCourse({ editOpen, setEditOpen }) {
  const dispatch = useDispatch();
  const course = useSelector((state) => state.course);
  const [_UPDATECOURSE, { isLoading }] = useUpdateCourseMutation();
  const fileInputRef = React.useRef(null);
  const [newLanguage, setNewLanguage] = useState("");

  // Common languages list
  const commonLanguages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Hindi",
    "Arabic",
    "Portuguese",
    "Russian",
  ];

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const editorContent = useSelector((state) => state.course.editorContent);

  const { data: categoriesData } = useFetchCategoriesQuery();
  const { data: subCategoriesData } = useFetchSubCategoriesQuery();

  const categories = categoriesData?.data || [];
  const subCategories = subCategoriesData?.data || [];

  const handleChange = (field, value) => {
    dispatch(updateField({ field, value }));
  };

  const handleSelectChange = (name, value) => {
    dispatch(updateField({ field: name, value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        dispatch(
          setFile({
            field,
            fileData: reader.result,
          }),
        );

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
      reader.onerror = (error) => {
        console.error(`Error converting ${field} to Base64:`, error);
      };
    }
  };

  const onSubmit = async (data) => {
    // Convert languages array to comma-separated string
    const languagesString = Array.isArray(course.languages)
      ? course.languages.join(", ")
      : course.languages || "";

    const formattedData = {
      ...course,
      courseIncludes: course.courseIncludes,
      syllabusOverview: course.syllabusOverview,
      thoughts: course.thoughts,
      tags: course.tags,
      editorContent,
      languages: languagesString,
    };


    try {
      const response = await _UPDATECOURSE({
        id: course._id,
        ...formattedData,
      }).unwrap();

      dispatch(resetForm());
      setEditOpen(false);

      if (response?.success) {
        toast.success("Course updated successfully");
      } else {
        toast.error(response?.error || "Failed to update course.");
      }
    } catch (error) {
      const errorMessage =
        error?.data?.error ||
        error?.error ||
        error?.data?.message ||
        error?.message ||
        "Failed to update course.";
      toast.error(errorMessage);
    }
  };

  const handleAddItem = (field, action) => (value, e) => {
    e.preventDefault();
    if (value.trim()) {
      dispatch(action(value));
      e.target.value = "";
    }
  };

  const handleRemoveItem = (field, action) => (index, e) => {
    e.preventDefault(); // Prevent form submission
    dispatch(action(index));
  };

  const cardConfig = [
    {
      title: "This Course Includes",
      field: "courseIncludes",
      addAction: addCourseInclude,
      removeAction: removeCourseInclude,
    },
    {
      title: "Syllabus Overview",
      field: "syllabusOverview",
      addAction: addSyllabusOverview,
      removeAction: removeSyllabusOverview,
    },
    {
      title: "Some Thoughts",
      field: "thoughts",
      addAction: addThought,
      removeAction: removeThought,
    },
    {
      title: "Popular Tags",
      field: "tags",
      addAction: addTag,
      removeAction: removeTag,
    },
  ];

  // Convert string languages to array for backward compatibility
  useEffect(() => {
    if (course.languages && typeof course.languages === "string") {
      const languagesArray = course.languages
        .split(",")
        .map((lang) => lang.trim())
        .filter(Boolean);
      handleChange("languages", languagesArray);
    } else if (!Array.isArray(course.languages)) {
      handleChange("languages", []);
    }
  }, [editOpen, course._id]);

  return (
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogContent className="max-h-[75vh] overflow-y-auto p-12 sm:max-w-[950px]">
        <DialogHeader>
          <DialogTitle>Update Course</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 border-t p-6"
        >
          <div className="flex gap-4">
            <div className="w-1/2">
              <Label className="mb-2">Category</Label>
              <Select
                onValueChange={(value) => handleSelectChange("category", value)}
                value={course.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category._id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <p>No categories available</p>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="w-1/2">
              <Label className="mb-2">Subcategory</Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("subcategory", value)
                }
                value={course.subcategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(subCategories) && subCategories.length > 0 ? (
                    subCategories.map((subCategory) => (
                      <SelectItem
                        key={subCategory._id}
                        value={subCategory.subcategoryName}
                      >
                        {subCategory.subcategoryName}
                      </SelectItem>
                    ))
                  ) : (
                    <p>No SubCategories available</p>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <Label htmlFor="courseName">Course Name</Label>
              <Input
                id="courseName"
                name="courseName"
                className="mt-2 w-full"
                onChange={(e) => handleChange("courseName", e.target.value)}
                value={course.courseName}
              />
              {errors.courseName && (
                <p className="text-red-500">{errors.courseName.message}</p>
              )}
            </div>

            <div className="w-1/2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                name="tagline"
                className="mt-2 w-full"
                type="text"
                onChange={(e) => handleChange("tagline", e.target.value)}
                value={course.tagline}
              />
              {errors.tagline && (
                <p className="text-red-500">{errors.tagline.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <Label htmlFor="level">Difficulty Level</Label>
              <Select
                onValueChange={(value) => {
                  handleSelectChange("level", value);
                  setValue("level", value);
                }}
                value={course.level}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-red-500">{errors.level.message}</p>
              )}
            </div>
           <div className="w-1/2">
  <Label htmlFor="duration">Course Duration (in days)</Label>
  <Input
    id="duration"
    name="duration"
    className="mt-2 w-full"
    value={course.duration}
    type="number" // ✅ change this
    onChange={(e) => handleChange("duration", e.target.value)}
  />
  {errors.duration && (
    <p className="text-red-500">{errors.duration.message}</p>
  )}
</div>

          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <Label className="mb-2">Availability</Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("availability", value)
                }
                value={course.availability}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Available?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-1/2">
              <Label className="mb-2">Featured Course</Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("featuredCourse", value)
                }
                value={String(course.featuredCourse)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Featured?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <Label className="mb-2">Certificate</Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("certificate", value)
                }
                value={String(course.certificate)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Certificate Included?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/2">
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                name="instructor"
                className="mt-2 w-full"
                onChange={(e) => handleChange("instructor", e.target.value)}
                value={course.instructor}
              />
              {errors.instructor && (
                <p className="text-red-500">{errors.instructor.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <Label htmlFor="languages">Languages</Label>
              <div className="mt-2 flex flex-col space-y-2">
                <div className="flex flex-wrap gap-2 rounded-md border border-gray-300 bg-white p-2">
                  {Array.isArray(course.languages) && course.languages.length > 0 ? (
                    course.languages.map((lang, index) => (
                      <div
                        key={index}
                        className="flex items-center rounded bg-blue-100 px-2 py-1 text-sm"
                      >
                        <span>{lang}</span>
                        <button
                          type="button"
                          className="ml-1 text-gray-500 hover:text-gray-700"
                          onClick={(e) => {
                            e.preventDefault();
                            const updatedLangs = [...course.languages];
                            updatedLangs.splice(index, 1);
                            handleChange("languages", updatedLangs);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">Select languages...</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Select
                    onValueChange={(value) => {
                      if (value && (!Array.isArray(course.languages) || !course.languages.includes(value))) {
                        handleChange("languages", [...(Array.isArray(course.languages) ? course.languages : []), value]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-1/2">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonLanguages.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-1">
                    <Input
                      id="languageInput"
                      className="flex-1"
                      placeholder="Or type a custom language"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const value = newLanguage.trim();
                          if (value && (!Array.isArray(course.languages) || !course.languages.includes(value))) {
                            handleChange("languages", [...(Array.isArray(course.languages) ? course.languages : []), value]);
                            setNewLanguage("");
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      className="ml-2"
                      onClick={(e) => {
                        e.preventDefault();
                        const value = newLanguage.trim();
                        if (value && (!Array.isArray(course.languages) || !course.languages.includes(value))) {
                          handleChange("languages", [...(Array.isArray(course.languages) ? course.languages : []), value]);
                          setNewLanguage("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-1/2">
              <Label htmlFor="price">Course Price</Label>
              <Input
                id="price"
                name="price"
                className="mt-2 w-full"
                type="text"
                onChange={(e) => handleChange("price", e.target.value)}
                value={course.price}
              />
              {errors.price && (
                <p className="text-red-500">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-full">
              <Label htmlFor="summaryText">Summary Text Line</Label>
              <Input
                id="summaryText"
                name="summaryText"
                className="mt-2 w-full"
                type="text"
                onChange={(e) => handleChange("summaryText", e.target.value)}
                value={course.summaryText}
              />
              {errors.summaryText && (
                <p className="text-red-500">{errors.summaryText.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <Label htmlFor="videoLink">Introduction Video</Label>
              <Input
                id="videoLink"
                name="videoLink"
                type="file"
                accept="video/*"
                className="mt-2 w-full"
                onChange={(e) => handleFileChange(e, "videoLink")}
              />
            </div>

            <div className="w-1/2">
              <Label htmlFor="thumbnail">Thumbnail Image</Label>
              <Input
                id="thumbnail"
                name="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "thumbnail")}
                ref={fileInputRef}
              />
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt="Thumbnail Preview"
                  className="mt-2 h-32 w-32"
                />
              )}
              {errors.thumbnail && (
                <p className="text-red-500">{errors.thumbnail.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <Label htmlFor="taglineIncludes">
                Tagline for the Course Includes
              </Label>
              <Input
                id="taglineIncludes"
                name="taglineIncludes"
                className="mt-2 w-full"
                type="text"
                onChange={(e) =>
                  handleChange("taglineIncludes", e.target.value)
                }
                value={course.taglineIncludes}
              />
              {errors.taglineIncludes && (
                <p className="text-red-500">{errors.taglineIncludes.message}</p>
              )}
            </div>

            <div className="w-1/2">
              <Label htmlFor="overviewTagline">Tagline for the Overview</Label>
              <Input
                id="overviewTagline"
                name="overviewTagline"
                className="mt-2 w-full"
                type="text"
                onChange={(e) =>
                  handleChange("overviewTagline", e.target.value)
                }
                value={course.overviewTagline}
              />
              {errors.overviewTagline && (
                <p className="text-red-500">{errors.overviewTagline.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <Label htmlFor="tagline_in_the_box">Tagline in the Box</Label>
              <Input
                id="tagline_in_the_box"
                name="tagline_in_the_box"
                className="mt-2 w-full"
                type="text"
                onChange={(e) =>
                  handleChange("tagline_in_the_box", e.target.value)
                }
                value={course.tagline_in_the_box}
              />
              {errors.tagline_in_the_box && (
                <p className="text-red-500">
                  {errors.tagline_in_the_box.message}
                </p>
              )}
            </div>
            <div className="w-1/2">
              <Label htmlFor="finalText">Final Text</Label>
              <Input
                id="finalText"
                name="finalText"
                className="mt-2 w-full"
                type="text"
                onChange={(e) => handleChange("finalText", e.target.value)}
                value={course.finalText}
              />
              {errors.finalText && (
                <p className="text-red-500">{errors.finalText.message}</p>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <Label>Syllabus (PDF)</Label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileChange(e, "syllabus")}
                ref={fileInputRef}
              />
              {course.syllabus && (
                <a
                  href={course.syllabus}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-blue-500 underline"
                >
                  View Current Syllabus
                </a>
              )}
            </div>
          </div>

          <TextEditor placeholder={undefined} />

          <div className="grid grid-cols-2 gap-4">
            {cardConfig.map(
              ({ title, field, addAction, removeAction }, index) => (
                <Card key={index} className="border p-3">
                  <CardHeader className="text-lg font-semibold">
                    {title}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course[field].map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <span className="text-sm">{item}</span>
                          <button
                            type="button" // Explicitly set type to prevent form submission
                            onClick={(e) => handleRemoveItem(field, removeAction)(itemIndex, e)}
                          >
                            <FaMinus className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 flex">
                      <Input
                        className="flex-1"
                        placeholder="Enter description"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddItem(field, addAction)(e.target.value, e);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="ml-2"
                        onClick={(e) =>
                          handleAddItem(field, addAction)(
                            document.querySelector(
                              `input[placeholder="Enter description"]`,
                            ).value,
                            e,
                          )
                        }
                      >
                        <HiOutlinePlus className="h-5 w-5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ),
            )}
          </div>

          <DialogFooter>
            <Button type="submit">Update Course</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}