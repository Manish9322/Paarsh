"use client";

import React from "react";
import RelatedPost from "@/components/Blog/RelatedPost";
import SubscribeNewsletter from "@/components/SubscribeStripe/SubscribeStripe";
import TagButton from "@/components/Blog/TagButton";

// Ad Models Are imported here.
import ModelOne from "@/components/View-Models/modelOne";
import ModelTwo from "@/components/View-Models/modelTwo";
import ModelThree from "@/components/View-Models/ModelThree";

// Icons are here
import { FaIndianRupeeSign } from "react-icons/fa6";
import { PiCertificateLight } from "react-icons/pi";
import { IoLanguage } from "react-icons/io5";
import { TbClockHour7 } from "react-icons/tb";
import { LiaSignalSolid } from "react-icons/lia";

import Feedbacks from "@/components/CourseFeedbacks";
import DownloadSyllabus from "@/components/DownloadSyllabus/DownloadSyllabus";

import Image from "next/image";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Purchase from "../../components/Purchase";

import {
  useFetchActiveOffersQuery, // Changed from useFetchActiveOffersMutation
  useFetchCategoriesQuery,
  useFetchCourcebyIdQuery,
  useFetchCourcesQuery,
  useFetchUserCourseQuery,
  useFetchUserQuery,
} from "@/services/api";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { SkeletonThemeProvider } from "@/components/ui/skeleton-theme-provider";
import VideoPlayer from "@/components/VideoPlayer/VideoPlayer";
import debounce from "lodash/debounce";
import { useSelector } from "react-redux";
import { selectRootState } from "@/lib/store";

interface Course {
  slug: string;
  id: number;
  _id: string;
  availability: string;
  certificate: string;
  courseCategory: string;
  courseSubCategory: string;
  courseName: string;
  tagline: string;
  summaryText: string;
  thumbnail: string;
  videoLink: string;
  instructor: string;
  courseType: string;
  duration: string;
  price: string;
  level: string;
  feturedCourse: boolean;
  languages: string[];
  createdAt: string;
  tags: string[];
  finalText: string;
  tagline_in_the_box: string;
  editorContent: string;
  courseIncludes: string[];
  taglineIncludes: string;
  syllabusOverview: string;
  overviewTagline: string;
  activeOffer?: {
    _id: string;
    code: string;
    discountPercentage: number;
    validUntil: string;
  };
}

interface Category {
  id: number;
  _id: string;
  name: string;
  description: string;
  keywords: string[];
  createdAt: string;
}

const BlogSidebarPage = () => {
  const param = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [isSearching, setIsSearching] = useState(false);

    const isAuthenticated = useSelector(
    (state) => selectRootState(state).userAuth.isAuthenticated,
  );

  const courseId = param?.get("courseId");

  const { data: userData, error, isLoading } = useFetchUserQuery(undefined);
   const user = userData?.data;

  // Fetch RTK Queries
  const { data: userCourseData } = useFetchUserCourseQuery(undefined, {
    skip: !isAuthenticated,
  });

  const {
    data: courseData,
    isLoading: courseLoading,
    error: courseError,
  } = useFetchCourcebyIdQuery(courseId, { skip: !courseId });

  const {
    data: categoryData,
    isLoading: categoryLoading,
    error: categoryError,
  } = useFetchCategoriesQuery(courseId, { skip: !courseId });

  const {
    data: coursesData,
    error: coursesError,
  } = useFetchCourcesQuery(undefined);

  // Fetch active offers for the course and user
  const {
    data: activeOffersData,
    isLoading: offersLoading,
  } = useFetchActiveOffersQuery(
    { courseId, userId: user?._id }, // userId can be null for unauthenticated users
    { skip: !courseId } // Only skip if no courseId
  );

  const course = courseData?.data;
  const categories = categoryData?.data || [];
  const activeOffer = activeOffersData?.data?.[0]; // Use the first offer (highest discount)

  // Combine course with active offer
  const courseWithOffer = useMemo(() => {
    if (!course) return null;
    return {
      ...course,
      activeOffer: activeOffer
        ? {
            _id: activeOffer._id,
            code: activeOffer.code,
            discountPercentage: activeOffer.discountPercentage,
            validUntil: activeOffer.validUntil,
          }
        : null,
    };
  }, [course, activeOffer]);

  const getRandomCategories = (categories, count) => {
    if (!Array.isArray(categories) || categories.length === 0) return [];
    const shuffled = [...categories].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Memoize random categories
  const randomCategories = useMemo(
    () => getRandomCategories(categories, 6),
    [categories]
  );

  // Memoize random courses to prevent unnecessary recalculations
  const getRandomCourses = useCallback((courses, count = 3) => {
    if (!courses || courses.length === 0) return [];
    const shuffled = [...courses].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }, []);

  // Memoize search results and random courses
  const displayedCourses = useMemo(() => {
    if (searchResults.length > 0) {
      return searchResults.slice(0, 3);
    }
    return getRandomCourses(coursesData?.data, 3);
  }, [searchResults, coursesData?.data, getRandomCourses]);

  // Optimize search function with debounce
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      if (coursesData?.data) {
        const searchTerms = query
          .toLowerCase()
          .split(" ")
          .filter((term) => term.length > 0);

        const filteredResults = coursesData.data.filter((course) => {
          const searchableContent = [
            course.courseName,
            course.level,
            course.courseCategory,
            course.courseSubCategory,
          ]
            .filter(Boolean)
            .map((item) => item.toString().toLowerCase())
            .join(" ");

          return searchTerms.every((term) => searchableContent.includes(term));
        });

        setSearchResults(filteredResults);
      }

      setIsSearching(false);
    }, 300),
    [coursesData]
  );

  // Handle search input
  const handleSearch = useCallback(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, handleSearch]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const modalOpen = () => {
    if (isAuthenticated) {
      setIsModalOpen(true);
    } else {
      // Construct full path with query parameters
      const queryString = param?.toString();
      const fullPath = queryString ? `${pathname}?${queryString}` : pathname;
      const redirectUrl = encodeURIComponent(fullPath ?? "");
      router.push(`/signin?redirect=${redirectUrl}`);
    }
  };

  const modalClose = () => {
    setIsModalOpen(false);
  };

  const tagsArray = useMemo(() => {
    if (Array.isArray(courseWithOffer?.tags)) {
      return courseWithOffer.tags;
    }
    if (typeof courseWithOffer?.tags === "string") {
      return courseWithOffer.tags.split(",").map((keyword) => keyword.trim());
    }
    return [];
  }, [courseWithOffer?.tags]);

  const isCoursePurchased = useMemo(() => {
    if (!userCourseData?.purchasedCourses || !courseWithOffer?._id) return false;
    return userCourseData.purchasedCourses.some(
      (purchasedCourse) => purchasedCourse._id === courseWithOffer._id
    );
  }, [userCourseData, courseWithOffer]);

  const handleGoToCourse = () => {
    router.push("/total-courses");
  };

  return (
    <SkeletonThemeProvider>
      <section className="overflow-hidden pb-[120px] pt-[180px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4 lg:w-8/12">
              <div>
                <div className="flex flex-col mb-8">
                  <h1 className="mb-3 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight">
                    {courseLoading ? (
                      <Skeleton width={300} />
                    ) : (
                      courseWithOffer?.courseName
                    )}
                  </h1>

                  <p className="mb-6 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
                    {courseLoading ? (
                      <Skeleton count={2} />
                    ) : (
                      courseWithOffer?.tagline
                    )}
                  </p>

                  <div className="mb-8">
                    <div className="inline-flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300 mb-6">
                      <div className="flex items-center gap-1">
                        <TbClockHour7 className="text-blue-600 text-base" />
                        <span>
                          {courseLoading ? (
                            <Skeleton width={60} />
                          ) : (
                            courseWithOffer?.duration
                          )}{" "}
                          days
                        </span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1">
                        <LiaSignalSolid className="text-blue-600 text-base" />
                        <span>
                          {courseLoading ? (
                            <Skeleton width={60} />
                          ) : (
                            courseWithOffer?.level
                          )}
                        </span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1">
                        <IoLanguage className="text-blue-600 text-base" />
                        <span className="truncate">
                          {courseLoading ? (
                            <Skeleton width={60} />
                          ) : Array.isArray(courseWithOffer?.languages) ? (
                            courseWithOffer.languages.join(", ")
                          ) : (
                            courseWithOffer?.languages
                          )}
                        </span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1">
                        <PiCertificateLight className="text-blue-600 text-base" />
                        <span>
                          {courseWithOffer?.certificate
                            ? "Certificate"
                            : "No Certificate"}
                        </span>
                      </div>
                    </div>

                    {/* Original price display for courses without offers */}
                    {!courseWithOffer?.activeOffer && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 rounded-xl p-6">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <FaIndianRupeeSign className="text-3xl text-blue-600 dark:text-blue-400" />
                            <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                              {courseLoading ? (
                                <Skeleton width={100} />
                              ) : (
                                courseWithOffer?.price
                              )}
                            </span>
                          </div>
                          <div className="flex flex-col ml-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              One-time payment
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Lifetime access
                            </span>
                          </div>
                        </div>
                        {courseLoading ? (
                          <Skeleton width={150} height={48} />
                        ) : (
                          <Button
                            onClick={
                              isCoursePurchased ? handleGoToCourse : modalOpen
                            }
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-700 text-white px-10 py-4 text-lg font-semibold rounded transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md"
                          >
                            {isCoursePurchased ? "Go to Course" : "Enroll Now"}
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Special offer UI for courses with active offers */}
                    {courseWithOffer?.activeOffer &&
                      new Date() <=
                        new Date(courseWithOffer.activeOffer.validUntil) && (
                        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 rounded-xl p-6 relative">
                          {/* Offer Tag */}
                          <div className="absolute -top-3 left-6">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium shadow-sm">
                              Special Offer - {courseWithOffer.activeOffer.code}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                              {/* Price Display */}
                              <div className="flex items-center gap-3 mb-1">
                                {/* Original Price */}
                                <div className="flex items-center opacity-60">
                                  <FaIndianRupeeSign className="text-xl text-blue-600 dark:text-blue-400" />
                                  <span className="text-2xl font-semibold text-blue-600 dark:text-blue-400 line-through">
                                    {courseLoading ? (
                                      <Skeleton width={60} />
                                    ) : (
                                      courseWithOffer.price
                                    )}
                                  </span>
                                </div>
                                {/* Discount Badge */}
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                                  {
                                    courseWithOffer.activeOffer
                                      .discountPercentage
                                  }
                                  % OFF
                                </span>
                              </div>

                              {/* Discounted Price */}
                              <div className="flex items-center">
                                <FaIndianRupeeSign className="text-3xl text-blue-600 dark:text-blue-400" />
                                <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                                  {courseLoading || offersLoading ? (
                                    <Skeleton width={100} />
                                  ) : (
                                    Math.round(
                                      parseFloat(courseWithOffer.price) *
                                        (1 -
                                          courseWithOffer.activeOffer
                                            .discountPercentage /
                                            100)
                                    )
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            {courseLoading ? (
                              <Skeleton width={150} height={48} />
                            ) : (
                              <Button
                                onClick={
                                  isCoursePurchased ? handleGoToCourse : modalOpen
                                }
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-700 text-white px-10 py-4 text-lg font-semibold rounded transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md"
                              >
                                {isCoursePurchased
                                  ? "Go to Course"
                                  : "Claim Offer"}
                              </Button>
                            )}
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="text-sm text-gray-600 dark:text-gray-400 pr-1">
                                Limited time offer
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400 pr-1">
                                Offer valid until{" "}
                                {new Date(
                                  courseWithOffer.activeOffer.validUntil
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
                <div>
                  <p className="mb-10 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
                    {courseLoading ? (
                      <Skeleton count={3} />
                    ) : courseWithOffer ? (
                      courseWithOffer.summaryText
                    ) : (
                      "Loading Summary..."
                    )}
                  </p>
                  <div className="mb-10 w-full overflow-hidden rounded">
                    <VideoPlayer
                      thumbnailUrl={
                        courseWithOffer?.thumbnail ||
                        "/images/blog/blog-details-01.jpg"
                      }
                      videoUrl={courseWithOffer?.videoLink || ""}
                      title={courseWithOffer?.courseName || "Course Video"}
                    />
                  </div>
                  <p className="mb-8 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
                    {courseLoading ? (
                      <Skeleton count={3} />
                    ) : courseWithOffer ? (
                      courseWithOffer.editorContent
                    ) : (
                      "Loading Description..."
                    )}
                  </p>
                  <h3 className="font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight">
                    This Course Includes
                  </h3>
                  <p className="mb-10 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
                    {courseLoading ? (
                      <Skeleton width={200} />
                    ) : courseWithOffer ? (
                      courseWithOffer.taglineIncludes
                    ) : (
                      "Loading Tagline..."
                    )}
                  </p>
                  <ul className="mb-10 list-inside list-disc text-body-color">
                    {courseLoading ? (
                      <Skeleton count={3} />
                    ) : courseWithOffer?.courseIncludes?.length > 0 ? (
                      courseWithOffer.courseIncludes.map((item, index) => (
                        <li
                          key={index}
                          className="mb-2 text-base font-medium text-body-color sm:text-lg lg:text-base xl:text-lg"
                        >
                          {item}
                        </li>
                      ))
                    ) : (
                      <li className="text-base font-medium text-body-color">
                        Loading Course Includes...
                      </li>
                    )}
                  </ul>

                  <h3 className="font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight">
                    Syllabus Overview
                  </h3>

                  <p className="mb-10 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
                    {courseLoading ? (
                      <Skeleton width={200} />
                    ) : courseWithOffer ? (
                      courseWithOffer.overviewTagline
                    ) : (
                      "Loading Tagline..."
                    )}
                  </p>

                  <ul className="mb-10 list-inside list-disc text-body-color">
                    {courseLoading ? (
                      <Skeleton count={3} />
                    ) : courseWithOffer?.syllabusOverview?.length > 0 ? (
                      <>
                        {Array.isArray(courseWithOffer.syllabusOverview) ? (
                          courseWithOffer.syllabusOverview
                            .filter((topic) => topic !== "Many More")
                            .map((topic, index) => (
                              <li
                                key={index}
                                className="mb-2 text-base font-medium text-body-color sm:text-lg lg:text-base xl:text-lg"
                              >
                                {topic}
                              </li>
                            ))
                        ) : (
                          <li className="mb-2 text-base font-medium text-body-color sm:text-lg lg:text-base xl:text-lg">
                            {courseWithOffer.syllabusOverview}
                          </li>
                        )}
                        <li className="mb-2 text-base font-medium text-body-color sm:text-lg lg:text-base xl:text-lg">
                          Many More
                        </li>
                      </>
                    ) : (
                      <li className="text-base font-medium text-body-color">
                        Loading Syllabus...
                      </li>
                    )}
                  </ul>

                  <div className="relative z-10 mb-10 overflow-hidden rounded-md bg-primary bg-opacity-10 p-8 md:p-9 lg:p-8 xl:p-9">
                    <p className="text-center text-base font-medium italic text-body-color">
                      {courseLoading ? (
                        <Skeleton width={200} />
                      ) : courseWithOffer ? (
                        courseWithOffer.tagline_in_the_box
                      ) : (
                        "Loading Summary..."
                      )}
                    </p>
                    <span className="absolute left-0 top-0 z-[-1]">
                      <svg
                        width="132"
                        height="109"
                        viewBox="0 0 132 109"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          opacity="0.5"
                          d="M33.0354 90.11C19.9851 102.723 -3.75916 101.834 -14 99.8125V-15H132C131.456 -12.4396 127.759 -2.95278 117.318 14.5117C104.268 36.3422 78.7114 31.8952 63.2141 41.1934C47.7169 50.4916 49.3482 74.3435 33.0354 90.11Z"
                          fill="url(#paint0_linear_111:606)"
                        />
                        <path
                          opacity="0.5"
                          d="M33.3654 85.0768C24.1476 98.7862 1.19876 106.079 -9.12343 108.011L-38.876 22.9988L100.816 -25.8905C100.959 -23.8126 99.8798 -15.5499 94.4164 0.87754C87.5871 21.4119 61.9822 26.677 49.5641 38.7512C37.146 50.8253 44.8877 67.9401 33.3654 85.0768Z"
                          fill="url(#paint1_linear_111:606)"
                        />
                        <defs>
                          <linearGradient
                            id="paint0_linear_111:606"
                            x1="94.7523"
                            y1="82.0246"
                            x2="8.40951"
                            y2="52.0609"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="white" stopOpacity="0.06" />
                            <stop
                              offset="1"
                              stopColor="white"
                              stopOpacity="0"
                            />
                          </linearGradient>
                          <linearGradient
                            id="paint1_linear_111:606"
                            x1="90.3206"
                            y1="58.4236"
                            x2="1.16149"
                            y2="50.8365"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="white" stopOpacity="0.06" />
                            <stop
                              offset="1"
                              stopColor="white"
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>
                      </svg>
                    </span>
                    <span className="absolute bottom-0 right-0 z-[-1]">
                      <svg
                        width="53"
                        height="30"
                        viewBox="0 0 53 30"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          opacity="0.8"
                          cx="37.5"
                          cy="37.5"
                          r="37.5"
                          fill="#4A6CF7"
                        />
                        <mask
                          id="mask0_111:596"
                          style={{ maskType: "alpha" }}
                          maskUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width="75"
                          height="75"
                        >
                          <circle
                            opacity="0.8"
                            cx="37.5"
                            cy="37.5"
                            r="37.5"
                            fill="#4A6CF7"
                          />
                        </mask>
                        <g mask="url(#mask0_111:596)">
                          <circle
                            opacity="0.8"
                            cx="37.5"
                            cy="37.5"
                            r="37.5"
                            fill="url(#paint0_radial_111:596)"
                          />
                          <g opacity="0.8" filter="url(#filter0_f_111:596)">
                            <circle
                              cx="40.8089"
                              cy="19.853"
                              r="15.4412"
                              fill="white"
                            />
                          </g>
                        </g>
                        <defs>
                          <filter
                            id="filter0_f_111:596"
                            x="4.36768"
                            y="-16.5881"
                            width="72.8823"
                            height="72.8823"
                            filterUnits="userSpaceOnUse"
                            colorInterpolationFilters="sRGB"
                          >
                            <feFlood
                              floodOpacity="0"
                              result="BackgroundImageFix"
                            />
                            <feBlend
                              mode="normal"
                              in="SourceGraphic"
                              in2="BackgroundImageFix"
                              result="shape"
                            />
                            <feGaussianBlur
                              stdDeviation="10.5"
                              result="effect1_foregroundBlur_111:596"
                            />
                          </filter>
                          <radialGradient
                            id="paint0_radial_111:596"
                            cx="0"
                            cy="0"
                            r="1"
                            gradientUnits="userSpaceOnUse"
                            gradientTransform="translate(37.5 37.5) rotate(90) scale(40.2574)"
                          >
                            <stop stopOpacity="0.47" />
                            <stop offset="1" stopOpacity="0" />
                          </radialGradient>
                        </defs>
                      </svg>
                    </span>
                  </div>

                  <p className="mb-10 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
                    {courseLoading ? (
                      <Skeleton count={3} />
                    ) : courseWithOffer ? (
                      courseWithOffer.finalText
                    ) : (
                      "Loading Final Text..."
                    )}
                  </p>

                  <div className="items-center justify-between sm:flex">
                    <div className="mb-5">
                      <h4 className="mb-3 text-sm font-medium text-body-color">
                        Popular Tags :
                      </h4>
                      <div className="flex flex-wrap items-center">
                        {courseLoading ? (
                          <Skeleton width={200} count={3} />
                        ) : tagsArray.length > 0 ? (
                          tagsArray.map((keyword, index) => (
                            <TagButton key={index} text={keyword} />
                          ))
                        ) : (
                          <span>No tags available</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full px-4 lg:w-4/12">
              <div className="mb-10 mt-12 rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark dark:shadow-none lg:mt-0">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="Search here..."
                    className="border-stroke mr-4 w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <button
                    aria-label="search button"
                    className="flex h-[50px] w-full max-w-[50px] items-center justify-center rounded-sm bg-primary text-white dark:bg-blue-600"
                    onClick={handleSearch}
                  >
                    <svg
                      width="20"
                      height="18"
                      viewBox="0 0 20 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.4062 16.8125L13.9375 12.375C14.9375 11.0625 15.5 9.46875 15.5 7.78125C15.5 5.75 14.7188 3.875 13.2812 2.4375C10.3438 -0.5 5.5625 -0.5 2.59375 2.4375C1.1875 3.84375 0.40625 5.75 0.40625 7.75C0.40625 9.78125 1.1875 11.6562 2.625 13.0937C4.09375 14.5625 6.03125 15.3125 7.96875 15.3125C9.875 15.3125 11.75 14.5938 13.2188 13.1875L18.75 17.6562C18.8438 17.75 18.9688 17.7812 19.0938 17.7812C19.25 17.7812 19.4062 17.7188 19.5312 17.584C37.584 17.384C38 19.4062 16.8125 19.4062 16Z"
                        fill="white"
                      />
                    </svg>
                  </button>
                </div>
                {isSearching && (
                  <div className="mt-4">
                    <Skeleton count={3} />
                  </div>
                )}
                {searchResults.length > 0 && !isSearching && (
                  <div className="mt-4">
                    <h4 className="mb-3 text-sm font-medium text-body-color">
                      Search Results ({searchResults.length})
                    </h4>
                    <ul className="max-h-60 overflow-y-auto">
                      {searchResults.map((course: Course) => (
                        <li
                          key={course._id || course.id}
                          className="mb-2 border-b border-body-color border-opacity-10 pb-2 dark:border-gray-700"
                        >
                          <a
                            href={`/course?courseId=${
                              course._id || course.id
                            }`}
                            className="text-base font-medium text-body-color hover:text-primary"
                          >
                            {course.courseName}
                          </a>
                          <p className="text-xs text-body-color">
                            {course.level} • {course.duration}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {searchQuery && searchResults.length === 0 && !isSearching && (
                  <div className="mt-4">
                    <p className="text-sm text-body-color">
                      No courses found for {searchQuery}
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-10 rounded-sm bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                <h3 className="border-b border-body-color border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-gray-700 dark:text-white">
                  Related Courses
                </h3>
                <ul className="p-8">
                  {displayedCourses.map((course: Course) => (
                    <li
                      key={course.id ?? course._id ?? course.courseName}
                      className="mb-6 border-b border-body-color border-opacity-10 pb-6 dark:border-gray-700"
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/course?courseId=${course._id || course.id || ""}`
                          )
                        }
                      >
                        <RelatedPost
                          title={course.courseName}
                          image={course.thumbnail || "/images/blog/course-placeholder.jpg"}
                          slug={`/${course.slug || "#"}`}
                          level={course.level || "N/A"}
                          duration={course.duration || "Unknown"}
                          certificate={course.certificate || "Unknown"}
                          date={""}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-10 rounded-sm bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                <h3 className="border-b border-body-color border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-gray-700 dark:text-white">
                  Popular Category
                </h3>
                <ul className="px-8 py-6">
                  {categoryLoading ? (
                    <Skeleton count={3} />
                  ) : (
                    <>
                      {randomCategories.map((category) => (
                        <li key={category._id}>
                          <a
                            href="#0"
                            className="mb-3 inline-block text-base font-medium text-body-color hover:text-blue-600"
                          >
                            {category.name}
                          </a>
                        </li>
                      ))}
                    </>
                  )}
                </ul>
              </div>

              <div className="mb-10 rounded-sm bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                <h3 className="border-b border-body-color border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-gray-700 dark:text-white">
                  Popular Tags
                </h3>
                <div className="flex flex-wrap items-center px-8 py-6">
                  {courseLoading ? (
                    <Skeleton count={3} />
                  ) : tagsArray.length > 0 ? (
                    tagsArray.map((keyword, index) => (
                      <TagButton key={index} text={keyword} />
                    ))
                  ) : (
                    <span className="mb-3 inline-block text-base font-medium text-body-color hover:text-blue-600">
                      No tags available
                    </span>
                  )}
                </div>
              </div>
              <ModelOne />
              <ModelTwo />
            </div>
          </div>
        </div>
        <Feedbacks />
      </section>

      <ModelThree />
      <Purchase
        isOpen={isModalOpen}
        onClose={modalClose}
        course={courseWithOffer}
        activeOffer={
          courseWithOffer?.activeOffer
            ? {
                _id: courseWithOffer.activeOffer._id || "",
                code: courseWithOffer.activeOffer.code,
                discountPercentage:
                  courseWithOffer.activeOffer.discountPercentage,
                validUntil: courseWithOffer.activeOffer.validUntil,
              }
            : undefined
        }
      />
      <SubscribeNewsletter />
      <DownloadSyllabus courseName={courseWithOffer?.courseName || ""} />
    </SkeletonThemeProvider>
  );
};

export default BlogSidebarPage;