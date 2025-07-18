"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SingleCourse from "../../app/newcourses/SingleCourse";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useFetchCategoriesQuery, useFetchCourcesQuery } from "@/services/api";
import { SkeletonThemeProvider } from "@/components/ui/skeleton-theme-provider";
import type { Course } from "@/types/courseCard";

// Define Category interface
interface Category {
  _id: string;
  name: string;
  description: string;
  keywords: string[];
  createdAt: string;
}

const CoursesPage = () => {
  const param = useSearchParams();
  const courseId = param?.get("courseId");

  // Fetch categories without passing courseId (which might be causing issues)
  const { data: categoryData, isLoading: categoryLoading, error: categoryError } = useFetchCategoriesQuery(undefined);


  // Ensure categories is always an array
  const categories = Array.isArray(categoryData?.data) ? categoryData?.data : [];

  // Set selected category only after categories are loaded
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);

  const { data: coursesData, error } = useFetchCourcesQuery(undefined);
  const isLoading = !coursesData;


  // More flexible filtering logic to handle different field names
  const displayedCourses = (coursesData?.data || []).filter((course: any) => {
    // Check multiple possible category field names
    return (
      (course.category === selectedCategory) ||
      (course.courseCategory === selectedCategory) ||
      (course.categoryName === selectedCategory)
    );
  }).slice(0, 3);


  // If no courses are displayed after filtering, show all courses
  const coursesToDisplay = displayedCourses.length > 0
    ? displayedCourses
    : (coursesData?.data || []).slice(0, 3);

  // Add hardcoded categories if none are coming from the API
  const displayCategories = categories.length > 0
    ? categories
    : [
      { _id: "1", name: "Development", description: "Development courses", keywords: [], createdAt: "" },
      { _id: "2", name: "Business", description: "Business courses", keywords: [], createdAt: "" },
      { _id: "3", name: "Design", description: "Design courses", keywords: [], createdAt: "" },
    ];

  return (
    <SkeletonThemeProvider>
      <div className="main-container px-10 my-14">
        <div className="w-full mx-auto text-center pt-10 mb-6" style={{ maxWidth: "570px" }}>
          <h1 className="mb-4 text-3xl font-bold !leading-tight text-black dark:text-white sm:text-4xl md:text-[45px]">
            What Would You Like To <span className="text-blue-500">Learn</span>
          </h1>
          <p className="text-base !leading-relaxed text-body-color md:text-lg">
            Explore More and more.
          </p>
        </div>

        {/* Category Selection */}
        <div className="mt-4 flex justify-center gap-2 flex-wrap">
          {categoryLoading ? (
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : displayCategories.length > 0 ? (
            displayCategories.map((category: Category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-1 text-sm rounded font-medium transition ${selectedCategory === category.name ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800 dark:text-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white"
                  }`}
              >
                {category.name}
              </button>
            ))
          ) : (
            <p className="text-gray-500">No categories available</p>
          )}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8">
          {isLoading ? (
            Array(3)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="w-full rounded-lg p-4 shadow">
                  <Skeleton height={200} width="100%" className="rounded-lg" />
                  <Skeleton height={20} width="80%" className="mt-4" />
                  <Skeleton height={10} width="60%" className="mt-4" />
                </div>
              ))
          ) : coursesToDisplay.length > 0 ? (
            coursesToDisplay.map((course: Course) => (
              <SingleCourse key={course._id ?? course.courseName} course={course} isGrid={true} />
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-500">No courses available for this category</p>
            </div>
          )}
        </div>
      </div>
    </SkeletonThemeProvider>
  );
};

export default CoursesPage;
