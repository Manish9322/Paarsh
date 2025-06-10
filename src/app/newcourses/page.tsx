"use client";

import Link from "next/link";
import SingleCourse from "./SingleCourse";
import Breadcrumb from "@/components/Common/Breadcrumb";
import RelatedPost from "@/components/Blog/RelatedPost";
import { useMemo, useState, useEffect } from "react";
import ModelOne from "@/components/View-Models/modelTwo";
import ModelTwo from "@/components/View-Models/modelOne";

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import { CiGrid41 } from "react-icons/ci";
import { TbLayoutList } from "react-icons/tb";
import { useFetchCategoriesQuery, useFetchCourcesQuery } from "@/services/api";
import { useRouter, useSearchParams } from "next/navigation"; 
import { useTheme } from "next-themes";
import { SkeletonThemeProvider } from "@/components/ui/skeleton-theme-provider";

interface Category {
  id: number;
  _id: string;
  name: string;
  description: string;
  keywords: string[];
  createdAt: string;
}

const PageName = () => {
  return (
    <>
      All <span className="text-blue-600">Courses</span>
    </>
  );
};

const Courses = () => {
  const [isGrid, setIsGrid] = useState(true);
  const [showMore, setShowMore] = useState(false); // State to manage showing more courses
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  const router = useRouter();
  const param = useSearchParams();
  const courseId = param.get("courseId");

  
  // TITLE CASE FUNCTION
  const toTitleCase = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // COURSES SECTION
  const {
    data: coursesData,  
    isLoading,
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

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    // If we have course data, filter based on the search query
    if (coursesData?.data) {
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
      
      const filteredResults = coursesData.data.filter((course) => {
        // Create a string of all searchable content
        const searchableContent = [
          course.courseName,
          course.instructor,
          course.level,
          course.courseCategory,
          course.courseSubCategory,
          course.summaryText,
          course.tagline,
          ...(Array.isArray(course.tags) ? course.tags : []),
          ...(Array.isArray(course.languages) ? course.languages : [])
        ]
          .filter(Boolean)
          .map(item => item.toString().toLowerCase())
          .join(' ');

        // Check if all search terms are found in the searchable content
        return searchTerms.every(term => searchableContent.includes(term));
      });
      
      setSearchResults(filteredResults);
    }
    
    setIsSearching(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Add a debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300); // Wait for 300ms after the user stops typing

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Update filteredCourses to use search results when available
  const filteredCourses = searchResults.length > 0 
    ? searchResults 
    : selectedCategory
      ? (coursesData?.data || []).filter((course: { category: string }) => course.category === selectedCategory) 
      : coursesData?.data || [];

  const displayedCourses = showMore ? filteredCourses : filteredCourses.slice(0, 6);

  const toggleDisplayStyle = () => {
    setIsGrid(!isGrid);
  };

  console.log("Filtered courses: ", filteredCourses);
  console.log("category : ", categories)

  return (
    <SkeletonThemeProvider>
      <Breadcrumb
        pageName={<PageName/>}
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
                  <div key={index} className="w-full rounded-lg p-4 shadow dark:bg-gray-800">
                    {/* Skeleton for Image */}
                    <Skeleton height={200} width="100%" className="rounded-lg" />

                    {/* Skeleton for Heading */}
                    <Skeleton height={20} width="80%" className="mt-4" />

                    {/* Skeleton for Tagline */}
                    <Skeleton height={10} width="60%" className="mt-4" />
                    <Skeleton height={10} width="60%" />
                    <Skeleton height={10} width="60%" />

                    {/* Skeleton for Tags */}
                    <div className="flex mt-2">
                      {Array(5).fill(0).map((_, tagIndex) => (
                        <Skeleton 
                          key={tagIndex} 
                          height={10} 
                          width={30} 
                          className={`mr-2 ${tagIndex === 4 ? 'mr-0' : ''}`}
                        />
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
                  className="inline-block rounded-sm bg-black px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-black/90 dark:bg-white/10 dark:text-white dark:hover:bg-white/50"
                >
                  {showMore ? "Show Less" : "View More"}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ASIDE SECTION */}
        <aside className="part-2 w-full md:w-1/3 my-8 mr-4 lg:ml-1 sticky top-20 h-fit">
          
          <div className="w-full flex lg:justify-start sm:justify-center mb-1">
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

          
          <div className="shadow-three dark:bg-gray-dark mb-6 rounded-sm bg-white dark:shadow-none">
            <div className="px-4 py-4 sm:px-6">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-full rounded-lg border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  aria-label="search button"
                >
                  <svg
                    width="20"
                    height="18"
                    viewBox="0 0 20 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.4062 16.8125L13.9375 12.375C14.9375 11.0625 15.5 9.46875 15.5 7.78125C15.5 5.75 14.7188 3.875 13.2812 2.4375C10.3438 -0.5 5.5625 -0.5 2.59375 2.4375C1.1875 3.84375 0.40625 5.75 0.40625 7.75C0.40625 9.78125 1.1875 11.6562 2.625 13.0937C4.09375 14.5625 6.03125 15.3125 7.96875 15.3125C9.875 15.3125 11.75 14.5938 13.2188 13.1875L18.75 17.6562C18.8438 17.75 18.9688 17.7812 19.0938 17.7812C19.25 17.7812 19.4062 17.7188 19.5312 17.5938C19.6875 17.3438 19.6562 17 19.4062 16.8125ZM3.375 12.3438C2.15625 11.125 1.5 9.5 1.5 7.75C1.5 6 2.15625 4.40625 3.40625 3.1875C4.65625 1.9375 6.3125 1.3125 7.96875 1.3125C9.625 1.3125 11.2812 1.9375 12.5312 3.1875C13.75 4.40625 14.4375 6.03125 14.4375 7.75C14.4375 9.46875 13.7188 11.125 12.5 12.3438C10 14.8438 5.90625 14.8438 3.375 12.3438Z"
                      fill="currentColor"
                      className="fill-body-color dark:fill-body-color-dark"
                    />
                  </svg>
                </button>
              </div>
              {isSearching && (
                <div className="mt-4">
                  <Skeleton count={3} />
                </div>
              )}
              {searchQuery && searchResults.length === 0 && !isSearching && (
                <div className="mt-4 text-center text-body-color">
                  No courses found for {searchQuery}
                </div>
              )}
            </div>
          </div>

          
          <div className="shadow-three dark:bg-gray-dark mb-10 rounded-sm bg-white dark:shadow-none w-full sm:w-auto">
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
                        <Skeleton height={60} width={60} className="rounded-md" />
                        <div className="flex flex-col text-center sm:text-left">
                          <Skeleton height={20} width={200} className="mb-2" />
                          <Skeleton height={14} width={150} />
                        </div>
                      </div>
                    </li>
                  ))}
                </>
              ) : (
                randomCourses.map((course) => (
                  <li
                    key={course.id ?? course.courseName}
                    className="mb-6 border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10"
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => router.push(`/blog-sidebar?courseId=${course._id}`)}
                    >
                      <RelatedPost
                        title={course.courseName}
                        image={course.image || "/images/blog/blog-01.jpg"}
                        slug={`/${course.slug || "#"}`}
                        level={course.level || "N/A"}
                        duration={course.duration || "Unknown"}
                        certificate={course.certificate || "Unknown"}
                        date={""}
                      />
                    </div>
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
    </SkeletonThemeProvider>
  );
};

export default Courses;