"use client";
import React, { useState, useEffect } from "react";
import { List, Grid3x3, Clock, ChevronRight, PlayCircle, BookOpen, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useFetchUserOngoingCoursesQuery } from "../../services/api";

function OngoingCourse() {
  const [view, setView] = useState("grid");
  const [courses, setCourses] = useState([]);
  const router = useRouter();

  // Fetch ongoing courses using RTK Query
  const { data: courseData, isLoading, error } = useFetchUserOngoingCoursesQuery(undefined);

  console.log("courseData", courseData);

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

  // Update courses state when courseData changes
  useEffect(() => {
    if (courseData?.success && courseData?.data) {
      const formattedCourses = courseData.data.map((progress) => ({
        id: progress.courseId,
        courseName: progress.courseName,
        thumbnail: progress.thumbnail,
        level: progress.level,
        instructor: progress.instructor,
        lastAccessed: progress.updatedAt,
        progress: progress.courseProgress,
      }));
      setCourses(formattedCourses);
    }
  }, [courseData]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  // Get level badge color
  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "intermediate":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "advanced":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    }
  };

  // Placeholder for remaining time
  const getRemainingTime = () => {
    return "~3 hours left"; // Replace with actual logic if available
  };

  // Navigate to course details
  const navigateToCourseDetails = (courseId) => {
    router.push(`/course-lecture/${courseId}`);
  };

  // Loading state
  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error: { "Failed to load courses"}
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
        <div className="flex items-center gap-2 bg-white dark:bg-gray-700 p-1 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
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

      {/* Dynamic Ongoing Course Cards */}
      {courses.length === 0 ? (
        <div className="text-center py-10 text-gray-600 dark:text-gray-300">
          No ongoing courses found.
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={`grid ${
            view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          } gap-6`}
        >
          {courses.map((course) => (
            <motion.div
              key={course.id}
              variants={item}
              className={`flex ${
                view === "list" ? "flex-row" : "flex-col"
              } bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500`}
              style={{ cursor: "pointer" }}
              onClick={() => navigateToCourseDetails(course.id)}
            >
              <div className={`${view === "list" ? "w-1/3" : "w-full"} relative`}>
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className={`${view === "list" ? "h-full w-full" : "h-48 w-full"} object-cover`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/fallback-thumbnail.png"; // Fallback image
                    }}
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
                    {Math.round(course.progress)}% Complete
                  </span>
                </div>

                {/* Progress indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-1.5 bg-blue-500"
                    style={{ width: `${course.progress}%` }}
                  ></div>
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
                    Last accessed: {formatDate(course.lastAccessed)}
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock size={12} className="mr-1" />
                    {getRemainingTime()}
                  </div>
                </div>

                {/* Continue button */}
                <button
                  className="w-full mt-2 flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToCourseDetails(course.id);
                  }}
                  aria-label={`Continue learning ${course.courseName}`}
                >
                  Continue Learning
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default OngoingCourse;
