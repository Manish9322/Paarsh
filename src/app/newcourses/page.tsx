"use client";

import Link from "next/link";
import SingleCourse from "./SingleCourse";
import courseData from "./CourseData";
import Breadcrumb from "@/components/Common/Breadcrumb";
import RelatedPost from "@/components/Blog/RelatedPost";
import { useMemo, useState } from "react";
import ModelOne from "@/components/View-Models/modelTwo";
import ModelTwo from "@/components/View-Models/modelOne";

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import { CiGrid41 } from "react-icons/ci";
import { TbLayoutList } from "react-icons/tb";
import { useFetchCategoriesQuery, useFetchCourcesQuery } from "@/services/api";
import { useSearchParams } from "next/navigation";

interface Category {
  id: number;
  _id: string;
  name: string;
  description: string;
  keywords: string[];
  createdAt: string;
}

const Courses = () => {
  const [isGrid, setIsGrid] = useState(true);
  const [showMore, setShowMore] = useState(false); // State to manage showing more courses
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAll, setShowAll] = useState(false);

  const param = useSearchParams();
  const courseId = param.get("courseId");

  // TITLE CASE FUNCTION
  const toTitleCase = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // COURSES SECTION
  const {
    data: coursesData,
    error,
  } = useFetchCourcesQuery(undefined);

  // CATEGORY SECTION
  const {
    data: categoryData,
    isLoading: categoryLoading,
    error: categoryError,
  } = useFetchCategoriesQuery(courseId);

  const categories = categoryData?.data || [];
  const visibleCategories = showAll ? categories : categories.slice(0, 4);

  const isLoading = !coursesData;
  console.log("Courses Data", coursesData);

  const getRandomCourses = (courses, count = 3) => {
    if (!courses || courses.length === 0) return [];
    const shuffled = [...courses].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const randomCourses = useMemo(() => getRandomCourses(coursesData?.data, 3), [coursesData]);

  const getRandomCategories = (categories, count) => {
    if (!Array.isArray(categories) || categories.length === 0) return [];
    const shuffled = [...categories].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category);
    setShowMore(false); // Reset showMore when changing category
  };

  const filteredCourses = selectedCategory
    ? (coursesData?.data || []).filter((course: { category: string; }) => course.category === selectedCategory) : coursesData?.data || [];

  const displayedCourses = showMore ? filteredCourses : filteredCourses.slice(0, 6);

  const toggleDisplayStyle = () => {
    setIsGrid(!isGrid);
  };

  console.log("Filtered courses: ", filteredCourses);
  console.log("category : ", categories)

  return (
    <>
      <Breadcrumb
        pageName={<>All <span className="text-blue-600">Courses</span></>}
        description="Discover a wide range of courses designed to enhance your skills, boost your knowledge, and help you achieve your goals—learn at your own pace anytime, anywhere!"
      />

      <div className="main-container flex flex-col md:flex-row px-4 md:px-10">
        <section
          id="courses"
          className="part-1 w-full mt-4 md:mt-0 md:pb-20 md:pt-8 lg:pb-28"        >
          <div className="container">
            <div className={isGrid ? "grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col w-full"}>
              {isLoading ? (
                // Directly render skeletons in the grid layout
                Array(6).fill(0).map((_, index) => (
                  <div key={index} className="w-full rounded-lg p-4 shadow">
                    {/* Skeleton for Image */}
                    <Skeleton height={200} width="100%" className="rounded-lg dark:bg-gray-800 dark:text-gray-900" />

                    {/* Skeleton for Heading */}
                    <Skeleton height={20} width="80%" className="mt-4 dark:bg-gray-800  dark:text-gray-900" />

                    {/* Skeleton for Tagline */}
                    <Skeleton height={10} width="60%" className="mt-4 dark:bg-gray-800  dark:text-gray-900" />
                    <Skeleton height={10} width="60%" className=" dark:bg-gray-800  dark:text-gray-900" />
                    <Skeleton height={10} width="60%" className=" dark:bg-gray-800 dark:text-gray-900" />

                    {/* Skeleton for Tags */}
                    <div className="flex mt-2">
                      {Array(5).fill(0).map((_, tagIndex) => (
                        <Skeleton key={tagIndex} height={10} width={30} className={`mr-2  dark:bg-gray-800 ${tagIndex === 4 ? 'mr-0' : ''}`} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {displayedCourses.length === 0 ? (
                    <div className="w-full flex items-center justify-center text-base font-medium leading-relaxed text-body-color">
                      Note : Does Not Have Courses To Display In this Category.
                    </div>
                  ) : (
                    // Render actual courses when not loading
                    displayedCourses.map((course) => (
                      <div key={course.id ?? course.courseName} className="w-full lg:mr-6">
                        <SingleCourse course={course} isGrid={isGrid} />
                      </div>
                    ))
                  )}
                </>
              )}
            </div>

            {/* View More Button */}
            {filteredCourses.length > 6 && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="inline-block rounded-sm text-black font-semibold px-8 py-4 text-base transition duration-300 hover:shadow-two dark:bg-white dark:hover:bg-gray-200 bg-white shadow-one dark:shadow-gray-dark"
                >
                  {showMore ? "Show Less" : "View More"}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ASIDE SECTION */}
        <aside className="part-2 w-full md:w-1/3 my-8 mr-8 lg:ml-1 sticky top-20 h-fit">

          {/*TOGGLE BUTTON FOR LIST VIEW */}
          <div className="w-full flex lg:justify-start sm:justify-center">
            <div className="sm:w-fit rounded mb-4 flex p-2 border items-center justify-center sm:justify-start sm:p-1">
              <button
                onClick={toggleDisplayStyle}
                className={`p-2 sm:p-1 rounded ${isGrid ? 'bg-blue-500 text-white' : ''}`}
              >
                <CiGrid41 className="text-2xl" />
              </button>
              <button
                onClick={toggleDisplayStyle}
                className={`p-2 sm:p-1 rounded ${!isGrid ? 'bg-blue-500 text-white' : ''}`}
              >
                <TbLayoutList className="text-2xl" />
              </button>
            </div>
          </div>

          {/* POPULAR CATEGORIES */}
          <div className="shadow-three dark:bg-gray-dark mb-10 mt-12 rounded-sm bg-white dark:shadow-none lg:mt-0 w-full sm:w-auto">
            <h3 className="border-b border-body-color border-opacity-10 px-4 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white text-center sm:text-left sm:px-8 sm:py-4">
              Popular Categories
            </h3>
            <ul className="px-4 py-4 sm:px-8 sm:py-6">
              <li className="text-center sm:text-left">
                <a
                  href="#0"
                  onClick={() => handleCategoryClick(null)}
                  className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                >
                  ALL COURSES
                </a>
              </li>

              {categoryLoading ? (
                <Skeleton count={3} className="dark:bg-gray-800" />
              ) : (
                <>
                  {visibleCategories.map((category) => (
                    <li key={category._id} className="text-center sm:text-left">
                      <a
                        href="#0"
                        onClick={() => handleCategoryClick(category.name)}
                        className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                      >
                        {toTitleCase(category.name)}
                      </a>
                    </li>
                  ))}

                  {categories.length > 4 && (
                    <li className="text-center sm:text-left">
                      <button
                        onClick={() => setShowAll(!showAll)}
                        className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                      >
                        {showAll ? "SHOW LESS" : "SHOW MORE"}
                      </button>
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>

          <div className="shadow-three dark:bg-gray-dark mb-10 rounded-sm bg-white dark:shadow-none w-full sm:w-auto">
            <h3 className="border-b border-body-color border-opacity-10 px-4 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white text-center sm:text-left sm:px-8 sm:py-4">
              Related Courses
            </h3>
            <ul className="p-4 sm:p-8">
              {isLoading ? (
                <>
                  {[...Array(3)].map((_, index) => (
                    <li
                      key={index}
                      className="mb-6 border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Skeleton for course image */}
                        <Skeleton height={60} width={60} className="rounded-md dark:bg-gray-800" />
                        <div className="flex flex-col text-center sm:text-left">
                          {/* Skeleton for course title */}
                          <Skeleton height={20} width={200} className="mb-2 dark:bg-gray-800" />
                          {/* Skeleton for course details */}
                          <Skeleton height={14} width={150} className="dark:bg-gray-800" />
                        </div>
                      </div>
                    </li>
                  ))}
                </>
              ) : (
                // Show actual course data when loaded
                randomCourses.map((course) => (
                  <li
                    key={course.id ?? course.courseName}
                    className="mb-6 border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10"
                  >
                    <RelatedPost
                      title={course.courseName}
                      image={course.image || "/images/blog/blog-01.jpg"}
                      slug={`/${course.slug || "#"}`}
                      level={course.level || "N/A"}
                      duration={course.duration || "Unknown"}
                      certificate={course.certificate || "Unknown"}
                    />
                  </li>
                ))
              )}
            </ul>
          </div>

          {!isGrid && (
            <div className="mt-6">
              <ModelTwo />
              <ModelOne />
            </div>
          )}
        </aside>
      </div>
    </>
  );
};

export default Courses;