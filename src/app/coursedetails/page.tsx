"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FaAward,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaGlobe,
} from "react-icons/fa";
import { courseList, instructors } from "@/Constants/coursesData";
import Image from "next/image";
import { LiaCertificateSolid } from "react-icons/lia";

const BuyCourseCard = () => (
  <div className="flex min-h-[400px] w-full max-w-sm flex-col rounded-xl p-6 shadow-md dark:bg-gray-800 dark:text-white lg:absolute lg:top-[28%] lg:w-80">
    <div className="mx-auto h-[190px] w-full">
      <Image
        src="/images/brands/next.jpg"
        alt="Checkout"
        className="rounded-lg"
        width={500}
        height={300}
      />
    </div>
    <h2 className="mb-4 text-center text-2xl font-bold dark:text-white">
      Purchase Course
    </h2>
    <p className="mb-2 text-center text-lg text-gray-700 dark:text-white">
      <span className="font-semibold">Price:</span> $99
    </p>
    <p className="mb-4 text-center text-gray-600 dark:text-white">
      Get lifetime access, course updates, and support.
    </p>
    <button className="w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
      Buy Now
    </button>
  </div>
);

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params._id;
  const course = courseList.find((course) => String(course.id) === String(id));
  const relatedCourses = courseList.filter((c) => c.id !== id).slice(0, 3);
  const [currentInstructor, setCurrentInstructor] = useState(0);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const displayedCourses = showAllCourses
    ? relatedCourses
    : relatedCourses.slice(0, 3);

  const [isAtFooter, setIsAtFooter] = useState(false);
  const footerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleScroll = () => {
      if (footerRef.current) {
        const footerPosition = footerRef.current.getBoundingClientRect().top;
        const viewportHeight = window.innerHeight;

        if (footerPosition < viewportHeight) {
          setIsAtFooter(true);
        } else {
          setIsAtFooter(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInstructor((prev) => (prev + 1) % instructors.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!course) {
    return <p className="dark:text-white">Loading...</p>;
  }

  const toggleModule = (title: string) => {
    setExpandedModule((prev) => (prev === title ? null : title));
  };



  return (
    <div className="container mx-auto flex flex-col px-4 pt-28 dark:text-white">
      {/* Course Header */}
      <div className="flex flex-col  gap-2 bg-gray-100 px-6 py-12 dark:bg-gray-800 lg:px-20">
        <h1 className="mb-2 text-3xl font-bold dark:text-white">
          {course.title}
        </h1>
        <h2 className="mb-4 text-lg text-gray-600 dark:text-white">
          {course.subtitle}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <FaClock className="text-green-900" />
            <span>{course.duration}</span>
          </div>
          <div className="hidden h-5 w-[1px] bg-gray-400 md:block"></div>
          <div className="flex items-center gap-2">
            <FaGlobe className="text-blue-700" />
            <span>{course.language}</span>
          </div>
          <div className="hidden h-5 w-[1px] bg-gray-400 md:block"></div>
          <div className="flex items-center gap-2">
            <FaAward className="text-yellow-500" />
            <span className="font-bold">Certification:</span>
            <span>{course.certification ? "Yes" : "No"}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row lg:gap-10 lg:px-20">
        {/* Left Section - Course Details */}
        <div className="w-full px-6 py-6 lg:w-3/4">
          <h2 className="text-3xl  font-bold dark:text-white">About Course</h2>
          <p className="mb-4 py-3 text-gray-700 dark:text-white">
            {course.aboutCourse}
          </p>

          <h2 className="mb-4 text-3xl font-bold dark:text-white">
            Course Includes
          </h2>
          <div className="mb-6 rounded-lg bg-gray-100 p-4 shadow dark:bg-gray-800">
            <ul className="flex list-disc flex-col gap-4 pl-5 text-gray-700 dark:text-white">
              {course.courseIncludes.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <button className="ml-5 mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
              Download Syllabus PDF
            </button>
          </div>

          <h2 className="mb-4 text-3xl font-bold dark:text-white">
            Course Prerequisite
          </h2>
          <div className="mb-6 rounded-lg bg-gray-100 p-4 shadow dark:bg-gray-800">
            <ul className="flex list-disc flex-col gap-5 pl-5 text-gray-700 dark:text-white">
              {course.prerequisites.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Comprehensive Course Modules */}
          <h2 className="mb-4 text-3xl font-bold">
            Comprehensive Course Modules
          </h2>
          <div className="mb-6 rounded-lg bg-gray-100 p-4 shadow  dark:bg-gray-800 dark:text-white">
            {course.courseModules.map((module, index) => (
              <div key={index} className="mb-4">
                <button
                  onClick={() => toggleModule(module.title)}
                  className="flex w-full items-center justify-between border-b border-gray-200 p-3 text-lg font-semibold transition hover:bg-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  {module.title}
                  {expandedModule === module.title ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </button>
                {expandedModule === module.title && (
                  <div className="mt-2 rounded-lg bg-white p-3  dark:bg-gray-800">
                    <ul className="flex list-inside list-disc flex-col gap-4 text-gray-700 dark:text-white">
                      {module.topics?.map((topic, idx) => (
                        <li key={idx}>{topic}</li>
                      ))}
                      {module.projects?.map((project, idx) => (
                        <li key={idx}>{project}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Our Instructor */}
          <h2 className="mb-6 text-3xl font-bold">Our Instructor</h2>
          <div className="mb-6 flex flex-col items-center gap-4 rounded-lg bg-gray-100 px-8 py-10 shadow dark:bg-gray-800">
            <h3 className="text-3xl font-semibold dark:text-white">
              {instructors[currentInstructor].name}
            </h3>
            <p className="text-gray-700 dark:text-white">
              {instructors[currentInstructor].bio}
            </p>
            <p className="text-gray-700 dark:text-white">
              {instructors[currentInstructor].experience}
            </p>
            <Image
              src={instructors[currentInstructor].image}
              alt={instructors[currentInstructor].name}
              width={400}
              height={250}
              className="mx-auto rounded-full"
            />
          </div>
          <h2 className="mb-6 text-3xl font-bold dark:text-white">
            Certificate
          </h2>
          <div className="mb-6 flex h-auto flex-col items-center gap-4 rounded-lg bg-gray-100 px-6 py-8 shadow dark:bg-gray-800 md:flex-row">
            <div className="flex flex-col gap-4 text-center md:text-left">
              <p className="flex flex-col items-center text-gray-700 dark:text-white md:flex-row md:items-start">
                <span className="relative text-2xl font-extrabold sm:mb-2 md:text-3xl">
                  Course Completion Certificate
                  <LiaCertificateSolid className="absolute left-1/2 -translate-x-1/2 text-yellow md:left-[11rem] md:top-10" />
                </span>
              </p>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Make your resume stand out among others.
              </span>
            </div>

            <Image
              src="/images/certificate.jpg"
              alt="Course Completion Certificate"
              width={400}
              height={150}
              className="h-auto w-full max-w-[400px] rounded-lg md:h-56"
            />
          </div>
        </div>

        {/* Right Sidebar (Buy Card + Related Courses) */}
        <div className="flex w-full flex-col items-center lg:w-1/4">
          {/* Purchase Card */}
          <BuyCourseCard />

          {/* Related Courses Section */}
          <div className="mt-12 w-full lg:mt-80">
            <h2 className="mb-4 text-2xl font-bold">Related Courses</h2>
            <div className="flex flex-col gap-6 ">
              {relatedCourses.map((related) => (
                <div
                  key={related.id}
                  className="rounded-lg p-4 shadow-md dark:bg-gray-800"
                >
                  <Image
                    src={related.image}
                    alt={related.title}
                    width={500}
                    height={300}
                    className="rounded-lg"
                  />
                  <h3 className="mt-2 text-lg font-semibold dark:text-white">
                    {related.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-white">
                    {related.subtitle}
                  </p>
                  <button
                    onClick={() =>
                      router.push(`/coursedetails?id=${related.id}`)
                    }
                    className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    View Course
                  </button>
                </div>
              ))}
            </div>
            {relatedCourses.length > 2 && (
              <button
                onClick={() => setShowAllCourses(!showAllCourses)}
                className=" mb-12 mt-4 w-full text-center text-blue-500 hover:underline"
              >
                {showAllCourses ? "View Less" : "View More"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
