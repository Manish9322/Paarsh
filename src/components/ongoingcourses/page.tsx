"use client";
import React, { useState } from "react";
import {
  List,
  Grid3x3,
  Clock,
  ChevronRight,
  PlayCircle,
  BookOpen,
  Users,
  PlayCircle as VideoIcon,
  AlertCircle,
  Search,
  Frown,
  Calendar,
  Award,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  useFetchUserCourseQuery,
  useFetchCourseProgressQuery,
} from "@/services/api";

interface Course {
  _id: string;
  courseName: string;
  duration: string;
  instructor: string;
  level: string;
  price: string;
  thumbnail: string;
  progress: string;
  purchaseDate: string;
  expiryDate: string;
  isExpired: boolean;
  videos: any[];
  course?: {
    videos: any[];
    _id: string;
    courseName: string;
    duration: string;
    instructor: string;
    level: string;
    price: string;
    thumbnail: string;
  };
}

interface ProgressCourse {
  courseId: string;
  courseProgress: number;
  courseCompleted: boolean;
  courseName: string;
  courseDuration: string;
  courseLevel: string;
}

// Skeleton Card Component
const SkeletonCard = ({ view }: { view: string }) => {
  return (
    <div
      className={`flex ${
        view === "list" ? "flex-row" : "flex-col"
      } animate-pulse overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800`}
    >
      <div className={`${view === "list" ? "w-1/3" : "w-full"} relative`}>
        <div
          className={`${
            view === "list" ? "h-full w-full" : "h-48 w-full"
          } bg-gray-200 dark:bg-gray-700`}
        />
      </div>
      <div className={`${view === "list" ? "w-2/3" : "w-full"} space-y-3 p-4`}>
        <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-2">
          <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-8 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
};

function OngoingCourse() {
  const [view, setView] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Fetch course progress data
  const {
    data: progressData,
    isLoading: isProgressLoading,
    error: progressError,
    refetch: refetchProgress,
  } = useFetchCourseProgressQuery(undefined);
  console.log("Course Progress Data on Ongoing Course Page: ", progressData);

  // Fetch user courses
  const {
    data,
    error: courseError,
    isLoading: isCourseLoading,
    refetch: refetchCourses,
  } = useFetchUserCourseQuery({});
  const courses: Course[] = data?.purchasedCourses || [];

  // Filter ongoing courses (0 < progress < 100)
  const ongoingCourses =
    progressData?.allCoursesProgress?.filter(
      (progressCourse: ProgressCourse) =>
        progressCourse.courseProgress > 0 &&
        progressCourse.courseProgress < 100,
    ) || [];

  // Merge course details with progress data
  const enrichedOngoingCourses = ongoingCourses.map(
    (progressCourse: ProgressCourse) => {
      const purchasedCourse = courses.find(
        (c) =>
          c.course?._id === progressCourse.courseId ||
          c._id === progressCourse.courseId,
      );

      // Handle both direct course object and nested course structure
      const courseData = purchasedCourse?.course || purchasedCourse;

      return {
        _id: progressCourse.courseId,
        courseName:
          progressCourse.courseName ||
          courseData?.courseName ||
          "Unknown Course",
        duration:
          progressCourse.courseDuration || courseData?.duration || "Unknown",
        level: progressCourse.courseLevel || courseData?.level || "All Levels",
        progress: progressCourse.courseProgress.toFixed(2), // Round to 2 decimal places
        instructor: courseData?.instructor || "Unknown Instructor",
        thumbnail: courseData?.thumbnail || "",
        price: courseData?.price || "N/A",
        purchaseDate: purchasedCourse?.purchaseDate || "",
        expiryDate: purchasedCourse?.expiryDate || "",
        isExpired: purchasedCourse?.isExpired || false,
        videos: purchasedCourse?.videos || courseData?.videos || [], // Ensure videos is an array or empty
      };
    },
  );

  // Filter courses based on search term
  const filteredCourses = enrichedOngoingCourses.filter(
    (course) =>
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Function to get level badge color
  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "advanced":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    }
  };

  // Function to get total video count
  const getTotalVideoCount = (course: any) => {
    if (!course.videos || !Array.isArray(course.videos)) {
      return 0;
    }
    return course.videos.reduce((total: number, topic: any) => {
      if (topic.videos && Array.isArray(topic.videos)) {
        return total + topic.videos.length;
      }
      return total;
    }, 0);
  };

  // Function to format duration
  const formatDuration = (duration: string | number) => {
    if (!duration) return "Unknown Duration";

    // If duration is a number, treat as months
    if (typeof duration === "number") {
      if (duration === 1) return "1 month";
      return `${duration} months`;
    }

    // If duration is already formatted string, return as is
    if (typeof duration === "string") {
      if (duration.includes("month")) return duration;
      const num = parseInt(duration);
      if (isNaN(num)) return duration;
      if (num === 1) return "1 month";
      return `${num} months`;
    }

    return "Unknown Duration";
  };

  // Navigate to course lecture page
  const navigateToCourseDetails = (courseId: string) => {
    router.push(`/course-lecture/${courseId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white sm:text-3xl">
            Ongoing Courses
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Continue your learning journey ({ongoingCourses.length} courses)
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <div className="relative w-full sm:w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-10 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-600 dark:bg-gray-700">
            <button
              onClick={() => setView("grid")}
              className={`rounded-md p-2 transition-all ${
                view === "grid"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
              aria-label="Grid view"
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded-md p-2 transition-all ${
                view === "list"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
              aria-label="List view"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isProgressLoading || isCourseLoading ? (
        <div
          className={`grid ${
            view === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          } gap-6`}
        >
          {[...Array(6)].map((_, index) => (
            <SkeletonCard key={index} view={view} />
          ))}
        </div>
      ) : progressError || courseError ? (
        // Improved Error View
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center rounded bg-white px-4 py-12 dark:bg-gray-800"
        >
          <AlertCircle className="mb-4 h-16 w-16 text-blue-600" />
          <h2 className="mb-2 text-xl font-bold text-gray-800 dark:text-white sm:text-2xl">
            Unable to Load Courses
          </h2>
          <p className="mb-6 max-w-md text-center text-gray-600 dark:text-gray-400">
            We encountered an issue while fetching your courses. Please try
            again or contact support if the issue persists.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                refetchProgress();
                refetchCourses();
              }}
              className="inline-flex transform items-center rounded bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg"
            >
              Retry
              <ChevronRight size={18} className="ml-2" />
            </button>
            <button
              onClick={() => router.push("/contact")}
              className="inline-flex transform items-center rounded bg-gray-100 px-6 py-3 text-gray-700 shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-gray-200 hover:shadow-lg dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Contact Support
            </button>
          </div>
        </motion.div>
      ) : filteredCourses.length === 0 ? (
        // Empty state when no courses match search
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center rounded bg-white px-4 py-12 dark:bg-gray-800"
        >
          <Frown className="mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-xl font-bold text-gray-800 dark:text-white sm:text-2xl">
            {searchTerm ? "No courses found" : "No ongoing courses"}
          </h2>
          <p className="mb-6 max-w-md text-center text-gray-600 dark:text-gray-400">
            {searchTerm
              ? `No courses match "${searchTerm}". Try adjusting your search.`
              : "You don't have any courses in progress. Start a course to see it here!"}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="inline-flex items-center rounded bg-blue-500 px-6 py-3 text-white shadow-md transition-all duration-300 hover:bg-blue-600 hover:shadow-lg"
            >
              Clear Search
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={`grid ${
            view === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          } gap-6`}
        >
          {filteredCourses.map((course: any) => (
            <motion.div
              key={course._id}
              variants={item}
              className={`flex ${
                view === "list" ? "flex-row" : "flex-col"
              } overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500`}
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (!course.isExpired) {
                  navigateToCourseDetails(course._id);
                }
              }}
            >
              <div
                className={`${view === "list" ? "w-1/3" : "w-full"} relative`}
              >
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className={`${view === "list" ? "h-full w-full" : "h-48 w-full"} object-cover`}
                  />
                ) : (
                  <div
                    className={`${
                      view === "list" ? "h-full w-full" : "h-48 w-full"
                    } flex items-center justify-center bg-gradient-to-r from-blue-400 to-indigo-500`}
                  >
                    <BookOpen size={48} className="text-white" />
                  </div>
                )}

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 hover:opacity-100">
                  <PlayCircle size={48} className="text-white" />
                </div>

                {/* Level badge and Expiry status */}
                <div className="absolute right-2 top-2 flex flex-col gap-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold shadow-sm ${getLevelColor(course.level)}`}
                  >
                    {course.level || "All Levels"}
                  </span>
                  {course.isExpired && (
                    <div className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-sm">
                      Expired
                    </div>
                  )}
                </div>

                {/* Progress indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-1.5 bg-blue-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              <div className={`${view === "list" ? "w-2/3" : "w-full"} p-4`}>
                <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">
                  {course.courseName}
                </h3>

                {/* Course metadata */}
                <div className="mb-3 flex flex-wrap gap-2">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Users size={12} className="mr-1" />
                    {course.instructor}
                  </div>

                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={12} className="mr-1" />
                    {formatDuration(course.duration)}
                  </div>

                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <VideoIcon size={12} className="mr-1" />
                    {getTotalVideoCount(course)} Lectures
                  </div>

                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar size={12} className="mr-1" />
                    Started: {formatDate(course.purchaseDate)}
                  </div>

                  {course.expiryDate && (
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar size={12} className="mr-1" />
                      Expires: {formatDate(course.expiryDate)}
                    </div>
                  )}
                </div>

                {/* Price and Progress status */}
                <div className="mb-3 flex items-center justify-between text-sm">
                  {/* {course.price && course.price !== "N/A" && (
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ₹{course.price}
                    </span>
                  )} */}
                  <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                    <Clock size={12} className="mr-1" />
                    In Progress ({course.progress}%)
                  </span>
                </div>

                {/* Continue button or Expired status */}
                <div className="mt-2 flex items-center justify-between">
                  {course.isExpired ? (
                    <span className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 shadow-sm dark:bg-red-900/30 dark:text-red-300">
                      <AlertCircle size={14} className="mr-1" />
                      Course Expired
                    </span>
                  ) : (
                    <button
                      className="inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToCourseDetails(course._id);
                      }}
                    >
                      Continue Learning
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default OngoingCourse;
