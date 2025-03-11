"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SingleCourse from "../../app/newcourses/SingleCourse";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useFetchCategoriesQuery, useFetchCourcesQuery } from "@/services/api";

const CoursesPage = () => {
  const param = useSearchParams();
  const courseId = param.get("courseId");

  const { data: categoryData, isLoading: categoryLoading } = useFetchCategoriesQuery(courseId);
  const categories = categoryData?.data || [];

  // Set selected category only after categories are loaded
  const [selectedCategory, setSelectedCategory] = useState("");

  console.log("Selected Category:", selectedCategory);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);

  const { data: coursesData, error } = useFetchCourcesQuery(undefined);
  const isLoading = !coursesData;
  const displayedCourses = (coursesData?.data || []).filter((course: { category: string; }) => course.category === selectedCategory).slice(0, 3);

  return (
    <div className="main-container px-10">
      <div className="w-full mx-auto text-center pt-10 mb-6" style={{ maxWidth: "570px" }}>
        <h2 className="mb-4 text-3xl font-bold !leading-tight text-black dark:text-white sm:text-4xl md:text-[45px]">
          Top Courses
        </h2>
        <p className="text-base !leading-relaxed text-body-color md:text-lg">
          Discover top courses to elevate your skills and unlock new opportunities for personal growth.
        </p>
      </div>

      {/* Category Selection */}
      <div className="mt-4 flex justify-center gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => setSelectedCategory(category.name)}
            className={`px-4 py-1 text-sm rounded font-medium transition ${
              selectedCategory === category.name ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8">
        {isLoading
          ? Array(3)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="w-full rounded-lg p-4 shadow">
                  <Skeleton height={200} width="100%" className="rounded-lg" />
                  <Skeleton height={20} width="80%" className="mt-4" />
                  <Skeleton height={10} width="60%" className="mt-4" />
                </div>
              ))
          : displayedCourses.map((course) => (
              <SingleCourse key={course._id ?? course.courseName} course={course} isGrid={true} />
            ))}
      </div>
    </div>
  );
};

export default CoursesPage;
