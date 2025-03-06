"use client"

import Link from "next/link";
import SingleCourse from "./SingleCourse";
import courseData from "./CourseData";
import Breadcrumb from "@/components/Common/Breadcrumb";
import RelatedPost from "@/components/Blog/RelatedPost";
import { useState } from "react";
import ModelOne from "@/components/View-Models/modelTwo";
import ModelTwo from "@/components/View-Models/modelOne";

import { CiGrid41 } from "react-icons/ci";
import { TbLayoutList } from "react-icons/tb";
import { useFetchCourcesQuery } from "@/services/api";
const Courses = () => {
  const [isGrid, setIsGrid] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    data: coursesData,
    isLoading,
    error,
  } = useFetchCourcesQuery(undefined);

  console.log("coursessssssw Dataaaa", coursesData);
  console.log(courseData.data);

  const toggleDisplayStyle = () => {
    setIsGrid(!isGrid);
  };

  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category);
  };

  const filteredCourses = selectedCategory
    ? coursesData?.data?.filter(course => course.tags.includes(selectedCategory))
    : coursesData?.data || [];


  return (
    <>
      <Breadcrumb
        pageName={<>All <span className="text-blue-600">Courses</span></>}
        description="Discover a wide range of courses designed to enhance your skills, boost your knowledge, and help you achieve your goals—learn at your own pace anytime, anywhere!"
      />

      <div className="main-container flex px-10">
        <section
          id="courses"
          className="part-1 w-full md:pb-20 md:pt-8 lg:pb-28"
        >
          <div className="container">
            <div className={isGrid ? "grid grid-cols-1 gap-x-2 gap-y-10 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col w-full"}>
              {filteredCourses?.map((course) => (
                <div key={course.id ?? course.courseName} className="w-full">
                  <SingleCourse course={course} isGrid={isGrid} />
                </div>
              ))}
            </div>
          </div>

          {/* <div className="mt-8 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link
              href="/courses"
              className="inline-block rounded-sm text-black font-semibold px-8 py-4 text-base transition duration-300 hover:shadow-two dark:hover:shadow-gray-dark bg-white dark:bg-dark shadow-one dark:shadow-gray-dark"
            >
              View More
            </Link>
          </div> */}
        </section>

        <aside className="part-2 w-1/3 my-8 mr-8">

          <div className="rounded mb-4 flex w-fit p-1 px-1 border">
            <button
              onClick={toggleDisplayStyle}
              className={`p-1 mr-1 rounded ${isGrid ? 'bg-blue-500 text-white' : ''}`}
            >
              <CiGrid41 className="text-2xl" />
            </button>
            <button
              onClick={toggleDisplayStyle}
              className={`p-1 rounded ${!isGrid ? 'bg-blue-500 text-white' : ''}`}
            >
              <TbLayoutList className="text-2xl" />
            </button>
          </div>

          <div className="shadow-three dark:bg-gray-dark mb-10 mt-12 rounded-sm bg-white dark:shadow-none lg:mt-0">
            <h3 className="border-b border-body-color border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
              Popular Categories
            </h3>
            <ul className="px-8 py-6">
              <li>
                <a
                  href="#0"
                  onClick={() => handleCategoryClick(null)}
                  className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                >
                  All Courses
                </a>
              </li>
              {["Cloud", "Computer / IT", "Graphic Design", "Framework", "Database"].map(category => (
                <li key={category}>
                  <a
                    href="#0"
                    onClick={() => handleCategoryClick(category)}
                    className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="shadow-three dark:bg-gray-dark mb-10 rounded-sm bg-white dark:shadow-none">
            <h3 className="border-b border-body-color border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
              Related Courses
            </h3>
            <ul className="p-8">
              <li className="mb-6 border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10">
                <RelatedPost
                  title="Node.js Essentials"
                  image="/images/blog/post-01.jpg"
                  slug="#"
                  level="Beginner"
                  duration="2 Months"
                />
              </li>
              <li className="mb-6 border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10">
                <RelatedPost
                  title="Master Angular.js"
                  image="/images/blog/post-02.jpg"
                  slug="#"
                  level="Intermediate"
                  duration="2 Weeks"
                />
              </li>
              <li>
                <RelatedPost
                  title="Learning Power BI"
                  image="/images/blog/post-03.jpg"
                  slug="#"
                  level="Difficult"
                  duration="1 Month"
                />
              </li>
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