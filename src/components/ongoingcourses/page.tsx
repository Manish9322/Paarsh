"use client";
import React, { useState } from "react";
import { List, Grid3x3, Clock, ChevronRight, PlayCircle, BookOpen, Users, PlayCircle as VideoIcon, Frown } from "lucide-react";
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
  videos: any[];
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
      } bg-white dark:bg-gray-800 rounded-md overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse`}
    >
      <div className={`${view === "list" ? "w-1/3" : "w-full"} relative`}>
        <div
          className={`${
            view === "list" ? "h-full w-full" : "h-48 w-full"
          } bg-gray-200 dark:bg-gray-700`}
        />
      </div>
      <div className={`${view === "list" ? "w-2/3" : "w-full"} p-4 space-y-3`}>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
      </div>
    </div>
  );
};

function OngoingCourse() {
  const [view, setView] = useState("grid");
 
  const router = useRouter();

  // Fetch course progress data
  const { data: progressData, isLoading: isProgressLoading, error: progressError, refetch: refetchProgress } = useFetchCourseProgressQuery(undefined);
  console.log("Course Progress Data on Ongoing Course Page: ", progressData);

  // Fetch user courses
  const { data, error: courseError, isLoading: isCourseLoading, refetch: refetchCourses } = useFetchUserCourseQuery({});
  const courses: Course[] = data?.purchasedCourses || [];

  // Filter ongoing courses (0 < progress < 100)
  const ongoingCourses = progressData?.allCoursesProgress?.filter(
    (progressCourse: ProgressCourse) => progressCourse.courseProgress > 0 && progressCourse.courseProgress < 100
  ) || [];

  // Merge course details with progress data
  const enrichedOngoingCourses = ongoingCourses.map((progressCourse: ProgressCourse) => {
    const course = courses.find((c) => c._id === progressCourse.courseId);
    return {
      _id: progressCourse.courseId,
      courseName: progressCourse.courseName,
      duration: progressCourse.courseDuration,
      level: progressCourse.courseLevel,
      progress: progressCourse.courseProgress.toFixed(2), // Round to 2 decimal places
      instructor: course?.instructor || "Unknown",
      thumbnail: course?.thumbnail || "",
      purchaseDate: course?.purchaseDate || "",
      videos: course?.videos || [], // Ensure videos is an array or empty
    };
  });

  

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
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  // Function to get level badge color
  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "intermediate":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "advanced":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    }
  };

  // Function to get total video count
  const getTotalVideoCount = (course: any) => {
    if (!Array.isArray(course.videos)) {
      return 0;
    }
    return course.videos.reduce((total: number, topic: any) => {
      return total + (topic.videos?.length || 0);
    }, 0);
  };

  // Navigate to course lecture page
  const navigateToCourseDetails = (courseId: string) => {
    router.push(`/course-lecture/${courseId}`);
  };

  // Handle loading state
  if (isProgressLoading || isCourseLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mt-2 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-700 p-1 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
          </div>
        </div>
        <div
          className={`grid ${
            view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          } gap-6`}
        >
          {[...Array(6)].map((_, index) => (
            <SkeletonCard key={index} view={view} />
          ))}
        </div>
      </div>
    );
  }

  // Handle error state
  if (progressError || courseError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Frown size={48} className="text-red-600 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Oops! We couldn’t load your courses.
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
          Something went wrong while fetching your ongoing courses. Please check your connection or try again.
        </p>
        <button
          onClick={() => {
            refetchProgress();
            refetchCourses();
          }}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
        >
          Retry
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  // Handle empty state
  if (enrichedOngoingCourses.length === 0) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-300 py-12">
        No ongoing courses. Start a course to see it here!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Ongoing Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Continue your learning journey
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-700 p-1 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm">
          <button
            onClick={() => setView("grid")}
            className={`rounded-md p-2 transition-all ${
              view === "grid"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
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
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
            aria-label="List view"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Ongoing Course Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className={`grid ${
          view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        } gap-6`}
      >
        {enrichedOngoingCourses.map((course: any) => (
          <motion.div
            key={course._id}
            variants={item}
            className={`flex ${
              view === "list" ? "flex-row" : "flex-col"
            } bg-white dark:bg-gray-800 rounded-md overflow-hidden shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500`}
            style={{ cursor: "pointer" }}
            onClick={() => navigateToCourseDetails(course._id)}
          >
            <div className={`${view === "list" ? "w-1/3" : "w-full"} relative`}>
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
                  } bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center`}
                >
                  <BookOpen size={48} className="text-white" />
                </div>
              )}

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <PlayCircle size={48} className="text-white" />
              </div>

              {/* Progress badge */}
              <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {course.progress}% Complete
                </span>
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {course.courseName}
              </h3>

              {/* Course metadata */}
              <div className="flex flex-wrap gap-2 mb-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Users size={12} className="mr-1" />
                  {course.instructor}
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock size={12} className="mr-1" />
                  Duration: {course.duration}
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <VideoIcon size={12} className="mr-1" />
                  {getTotalVideoCount(course)} Lectures
                </div>
              </div>

              {/* Continue button */}
              <button
                className="w-full mt-2 flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 py-2 px-3 rounded text-sm font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToCourseDetails(course._id);
                }}
              >
                Continue Learning
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default OngoingCourse;