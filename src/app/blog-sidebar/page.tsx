"use client";

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

import { useFetchCategoriesQuery, useFetchCourcebyIdQuery, useFetchCourcesQuery } from "@/services/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";


// import NewsLatterBox from "@/components/Cont act/NewsLatterBox";
// import SharePost from "@/components/Blog/SharePost";

interface Course {
  id: number;
  _id: string;
  availability: string;
  certificate: string;
  courseCategory: string;
  courseSubCategory: string;
  courseName: string;
  tagline: string;
  summaryText: string;

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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const modalOpen = () => {
    setIsModalOpen(true);
  };

  const modalClose = () => {
    setIsModalOpen(false);
  };

  const courseId = param.get("courseId");
  const {
    data: courseData,
    isLoading,
    error,
  } = useFetchCourcebyIdQuery(courseId);
  const course: Course = courseData?.data;


  const {
    data: categoryData,
    isLoading: categoryLoading,
    error: categoryError,
  } = useFetchCategoriesQuery(courseId);

  const categories = categoryData?.data || [];

  const category: Category = categoryData?.data;
  console.log("Categories : ", category);


  const getRandomCategories = (categories, count) => {
    if (!Array.isArray(categories) || categories.length === 0) return [];
    const shuffled = [...categories].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const tagsArray = Array.isArray(course?.tags)
    ? course.tags
    : typeof course?.tags === "string"
      ? (course.tags as string).split(",").map((keyword) => keyword.trim())
      : [];

  console.log("Course Data : ", course);
  console.log("Editor Content:", course?.editorContent);

  const {
    data: coursesData,
    error: courseError,
  } = useFetchCourcesQuery(undefined);


  const getRandomCourses = (courses, count = 3) => {
    if (!courses || courses.length === 0) return [];
    const shuffled = [...courses].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const randomCourses = useMemo(
    () => getRandomCourses(coursesData?.data, 3),
    [coursesData],
  );

  return (
    <>
      <section className="overflow-hidden pb-[120px] pt-[180px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4 lg:w-8/12">
              <div>
                {/* <h1 className="mb-2 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight">
                  Mastering JavaScript
                </h1> */}
                <div className="flex justify-between">
                  <div className="w-4/5">
                    <h1 className="mb-2 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight">
                      {isLoading ? <Skeleton width={300} /> : course?.courseName}
                    </h1>

                    <p className="mb-10 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
                      {isLoading ? <Skeleton count={2} /> : course?.tagline}
                    </p>
                  </div>

                  <div className="w-fit">
                    <p className="mr-5 flex items-start text-5xl font-extrabold text-blue-600 hover:text-blue-400 transition duration-300 tracking-wide uppercase bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">

                      <span className="text-xl">
                        <FaIndianRupeeSign className="text-blue-400 transition duration-300  tracking-wide uppercase bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text" />

                      </span>
                      {isLoading ? (
                        <Skeleton width={100} />
                      ) : course ? (
                        course.price
                      ) : (
                        "Loading Course Fees..."
                      )}
                    </p>
                  </div>

                </div>
                <div className="mb-10 flex flex-wrap items-center justify-between border-b border-body-color border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
                  <div className="flex flex-wrap items-center">
                    <div className="mb-5 flex items-center">
                      <p className="mr-5 flex items-center text-base font-medium text-body-color">
                        <span className="mr-2 text-xl">
                          <PiCertificateLight />
                        </span>

                        {isLoading ? <Skeleton width={100} /> : `${course?.certificate ? "Certificate" : "No Certificate"}`}
                      </p>


                      <p className="mr-5 flex items-center text-base font-medium text-body-color">
                        <span className="mr-2 text-xl">
                          <LiaSignalSolid />
                        </span>

                        {isLoading ? <Skeleton width={100} /> : course?.level}
                      </p>
                      <p className="mr-5 flex items-center text-base font-medium text-body-color">
                        <span className="mr-2 text-xl">
                          <TbClockHour7 />
                        </span>
                        {isLoading ? (
                          <Skeleton width={100} />
                        ) : (
                          course?.duration
                        )}
                      </p>

                      <p className="mr-5 flex items-center text-base font-medium text-body-color">
                        <span className="mr-2 text-xl">
                          <IoLanguage />
                        </span>
                        {isLoading ? (
                          <Skeleton width={100} />
                        ) : course ? (
                          course.languages
                        ) : (
                          "Loading Languages..."
                        )}
                      </p>

                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mb-5 mr-4">
                      <Button
                        onClick={modalOpen}
                        className="inline-flex items-center justify-center rounded bg-blue-600 hover:bg-blue-700 transition px-4 py-2 text-base font-medium text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        Purchase Now
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-10 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
                    {/* <span className="text-blue-600 font-bold"> JavaScript </span> plays a crucial role in front-end development by making web pages interactive and user-friendly. With JavaScript, developers can create dynamic UI elements and many more. */}
                    {isLoading ? (
                      <Skeleton count={3} />
                    ) : course ? (
                      course.summaryText
                    ) : (
                      "Loading Summary..."
                    )}
                  </p>
                  <div className="mb-10 w-full overflow-hidden rounded">
                    <div className="relative aspect-[97/60] w-full sm:aspect-[97/44]">
                      <Image
                        src="/images/blog/blog-details-01.jpg"
                        alt="image"
                        fill
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                  </div>
                  <p className="mb-8 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
                    {isLoading ? (
                      <Skeleton count={3} />
                    ) : course ? (
                      course.editorContent
                    ) : (
                      "Loading Description..."
                    )}
                  </p>
                  <h3 className="font-xl mb-2 font-bold leading-tight text-black dark:text-white sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight">
                    This Course Includes
                  </h3>
                  <p className="mb-10 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
                    {isLoading ? (
                      <Skeleton width={200} />
                    ) : course ? (
                      course.taglineIncludes
                    ) : (
                      "Loading Tagline..."
                    )}
                  </p>
                  <ul className="mb-10 list-inside list-disc text-body-color">
                    {isLoading ? (
                      <Skeleton count={3} />
                    ) : course?.courseIncludes?.length > 0 ? (
                      course.courseIncludes.map((item, index) => (
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
                    {isLoading ? (
                      <Skeleton width={200} />
                    ) : course ? (
                      course.overviewTagline
                    ) : (
                      "Loading Tagline..."
                    )}
                  </p>

                  <ul className="mb-10 list-inside list-disc text-body-color">
                    {isLoading ? (
                      <Skeleton count={3} />
                    ) : course?.syllabusOverview?.length > 0 ? (
                      <>
                        {Array.isArray(course.syllabusOverview) ? ( course.syllabusOverview
                          .filter((topic) => topic !== "Many More") // Exclude 'Many More' if it exists
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
                            {course.syllabusOverview}
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
                      {isLoading ? (
                        <Skeleton width={200} />
                      ) : course ? (
                        course.tagline_in_the_box
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
                    {isLoading ? (
                      <Skeleton count={3} />
                    ) : course ? (
                      course.finalText
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
                        {isLoading ? (
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
                  />
                  <button
                    aria-label="search button"
                    className="flex h-[50px] w-full max-w-[50px] items-center justify-center rounded-sm bg-primary text-white dark:bg-blue-600"
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
                        fill="white"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mb-10 rounded-sm bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                <h3 className="border-b border-body-color border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
                  Related Courses
                </h3>
                <ul className="p-8">
                  {randomCourses.map((course) => (
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
                          certificate={course.certificate || "Unknown"} date={""}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-10 rounded-sm bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                <h3 className="border-b border-body-color border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
                  Popular Category
                </h3>
                <ul className="px-8 py-6">
                  {categoryLoading ? (
                    <Skeleton count={3} />
                  ) : (
                    <>
                      {getRandomCategories(categoryData?.data, 6).map((category) => (
                        <li key={category._id}>
                          <a
                            href="#0"
                            className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
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
                <h3 className="border-b border-body-color border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
                  Popular Tags
                </h3>
                <div className="flex flex-wrap items-center px-8 py-6">
                  {isLoading ? (
                    <Skeleton count={3} />
                  ) : tagsArray.length > 0 ? (
                    tagsArray.map((keyword, index) => (
                      <TagButton key={index} text={keyword} />
                    ))
                  ) : (
                    <span className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary">
                      No tags available
                    </span>
                  )}
                </div>
              </div>
              {/* <NewsLatterBox /> */}
              <ModelOne />
              <ModelTwo />
            </div>
          </div>
        </div>
        <Feedbacks />
      </section >

      <ModelThree />
      <Purchase isOpen={isModalOpen} onClose={modalClose} course={course} />

      <SubscribeNewsletter />
      <DownloadSyllabus />
    </>
  );
};

export default BlogSidebarPage;
