"use client";
import React, { useState } from "react";
import {
  List,
  Frown,
  Grid3x3,
  Search,
  Filter,
  ChevronRight,
  BookOpen,
  Clock,
  Calendar,
  Users,
  Award,
  PlayCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { useFetchUserCourseQuery } from "@/services/api";

// Updated interface to match the actual data structure
interface PurchasedCourse {
  _id: string;
  course: {
    _id: string;
    courseName: string;
    price: string;
    duration: number;
    level: string;
    thumbnail: string;
    instructor: string;
  };
  purchaseDate: string;
  expiryDate: string;
  isExpired: boolean;
  videos: any[];
  progress?: string; // This might come from elsewhere or be calculated
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

function TotalCourses() {
  const [view, setView] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const {
    data,
    error: courseError,
    isLoading: isCourseLoading,
    refetch: refetchCourses,
  } = useFetchUserCourseQuery({});

  const courses: PurchasedCourse[] = data?.purchasedCourses || [];

  const handleStartCourse = (courseId: string) => {
    router.push(`/course-lecture/${courseId}`);
  };


  const getTotalVideoCount = (purchasedCourse: PurchasedCourse) => {
    return purchasedCourse.videos.reduce((total: number, topic: any) => {
      return total + (topic.videos?.length || 0);
    }, 0);
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter((purchasedCourse) =>
    purchasedCourse.course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchasedCourse.course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Function to format duration
  const formatDuration = (duration: number) => {
    if (duration === 1) return "1 month";
    return `${duration} months`;
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
            My Courses
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Browse all your purchased courses ({courses.length} courses)
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
      {isCourseLoading ? (
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
      ) : courseError ? (
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
              onClick={() => refetchCourses()}
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
            {searchTerm ? "No courses found" : "No courses available"}
          </h2>
          <p className="mb-6 max-w-md text-center text-gray-600 dark:text-gray-400">
            {searchTerm 
              ? `No courses match "${searchTerm}". Try adjusting your search.`
              : "You haven't purchased any courses yet. Browse our catalog to get started!"
            }
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
          {filteredCourses.map((purchasedCourse) => (
            <motion.div
              key={purchasedCourse.course._id}
              variants={item}
              className={`flex ${
                view === "list" ? "flex-row" : "flex-col"
              } overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500`}
              style={{ cursor: "pointer" }}
               onClick={() => {
                if (!purchasedCourse.isExpired) {
                  navigateToCourseDetails(purchasedCourse.course._id);
                }
              }}
            >
              <div
                className={`${view === "list" ? "w-1/3" : "w-full"} relative`}
              >
                {purchasedCourse.course.thumbnail ? (
                  <img
                    src={purchasedCourse.course.thumbnail}
                    alt={purchasedCourse.course.courseName}
                    className={`${
                      view === "list" ? "h-full w-full" : "h-48 w-full"
                    } object-cover`}
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

                {/* Level badge */}
                <div className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 text-xs font-bold shadow-sm dark:bg-gray-800">
                  <span
                    className={`rounded-full px-2 py-0.5 ${getLevelColor(purchasedCourse.course.level)}`}
                  >
                    {purchasedCourse.course.level || "All Levels"}
                  </span>
                </div>

                {/* Expiry status badge */}
                {purchasedCourse.isExpired && (
                  <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-sm">
                    Expired
                  </div>
                )}
              </div>

              <div className={`${view === "list" ? "w-2/3" : "w-full"} p-4`}>
                <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">
                  {purchasedCourse.course.courseName}
                </h3>

                {/* Course metadata */}
                <div className="mb-3 flex flex-wrap gap-2">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Users size={12} className="mr-1" />
                    {purchasedCourse.course.instructor}
                  </div>

                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={12} className="mr-1" />
                    {formatDuration(purchasedCourse.course.duration)}
                  </div>

                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <PlayCircle size={12} className="mr-1" />
                    {getTotalVideoCount(purchasedCourse)} Lectures
                  </div>

                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar size={12} className="mr-1" />
                    Purchased: {formatDate(purchasedCourse.purchaseDate)}
                  </div>
                </div>

                {/* Price and expiry info */}
                <div className="mb-3 flex items-center justify-between text-sm">
                  {/* <span className="font-semibold text-green-600 dark:text-green-400">
                    ₹{purchasedCourse.course.price}
                  </span> */}
                  <span className={`text-xs ${
                    purchasedCourse.isExpired 
                      ? "text-red-500 dark:text-red-400" 
                      : "text-gray-500 dark:text-gray-400"
                  }`}>
                    Expires: {formatDate(purchasedCourse.expiryDate)}
                  </span>
                </div>

                {/* Course status */}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center">
                    {purchasedCourse.progress && Number(purchasedCourse.progress) === 100 ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <Award size={12} className="mr-1" />
                        Completed
                      </span>
                    ) : purchasedCourse.progress && Number(purchasedCourse.progress) > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        <Clock size={12} className="mr-1" />
                        In Progress ({purchasedCourse.progress}%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        <BookOpen size={12} className="mr-1" />
                        Not Started
                      </span>
                    )}
                  </div>

                  {purchasedCourse.isExpired ? (
                    <span className="inline-flex cursor-not-allowed items-center justify-center rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm dark:bg-red-900/30 dark:text-red-300">
                      <AlertCircle size={14} className="mr-1" />
                      Expired
                    </span>
                  ) : (
                    <button
                      className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow"
                      onClick={() => handleStartCourse(purchasedCourse.course._id)}
                    >
                      {purchasedCourse.progress && Number(purchasedCourse.progress) > 0 ? "Continue" : "Start"}
                      <ChevronRight size={14} className="ml-1" />
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

export default TotalCourses;