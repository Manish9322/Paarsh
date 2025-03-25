"use client";
import React, { useState } from "react";
import { List, Grid3x3, Search, Filter, ChevronRight, BookOpen, Clock, Calendar, Users, Award, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { useFetchUserCourseQuery } from "@/services/api";

interface Course {
  _id: string;
  courseName: string;
  duration: string;
  instructor: string;
  level: string;
  price: string;
  thumbnail: string;
  progress:string;
  purchaseDate:string;
  videos: any[];
}

function TotalCourses() {
  const [view, setView] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const { data, error, isLoading } = useFetchUserCourseQuery({});
  const courses: Course[] = data?.purchasedCourses || [];

  const handleStartCourse = (courseId: string) => {
    router.push(`/course-lecture?courseId=${courseId}`);
  };

  console.log("purchased courses : ", courses);


  const exampleCourses = [
    {
      id: "1",
      courseName: "Introduction to Web Development",
      thumbnail: "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      level: "Beginner",
      instructor: "John Smith",
      duration: "8 weeks",
      purchaseDate: "2023-05-15",
      progress: 0
    },
    {
      id: "2",
      courseName: "Advanced JavaScript Concepts",
      thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      level: "Intermediate",
      instructor: "Sarah Johnson",
      duration: "10 weeks",
      purchaseDate: "2023-06-20",
      progress: 45
    },
    {
      id: "3",
      courseName: "React Native for Mobile Development",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      level: "Advanced",
      instructor: "Michael Brown",
      duration: "12 weeks",
      purchaseDate: "2023-07-10",
      progress: 100
    }
  ];

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
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Function to get level badge color
  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case 'intermediate':
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case 'advanced':
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            My Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Browse all your purchased courses
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 shadow-sm"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-700 p-1 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
            <button
              onClick={() => setView("grid")}
              className={`rounded-md p-2 transition-all ${view === "grid"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              aria-label="Grid view"
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded-md p-2 transition-all ${view === "list"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              aria-label="List view"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Example Course Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className={`grid ${view === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
          } gap-6`}
      >
        {courses.map((course) => (
          <motion.div
            key={course._id}
            variants={item}
            className={`flex ${view === "list" ? "flex-row" : "flex-col"
              } bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500`}
            style={{ cursor: 'pointer' }}
          >
            <div className={`${view === "list" ? "w-1/3" : "w-full"} relative`}>
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.courseName}
                  className={`${view === "list" ? "h-full w-full" : "h-48 w-full"
                    } object-cover`}
                />
              ) : (
                <div className={`${view === "list" ? "h-full w-full" : "h-48 w-full"
                  } bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center`}>
                  <BookOpen size={48} className="text-white" />
                </div>
              )}

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <PlayCircle size={48} className="text-white" />
              </div>

              {/* Level badge */}
              <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                <span className={`px-2 py-0.5 rounded-full ${getLevelColor(course.level)}`}>
                  {course.level || "All Levels"}
                </span>
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
                  {course.duration}
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Calendar size={12} className="mr-1" />
                  Purchased: {formatDate(course.purchaseDate)}
                </div>
              </div>

              {/* Course status */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  {Number(course.progress) === 100 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      <Award size={12} className="mr-1" />
                      Completed
                    </span>
                  ) :Number(course.progress) === 100 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      <Clock size={12} className="mr-1" />
                      In Progress
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      <BookOpen size={12} className="mr-1" />
                      Not Started
                    </span>
                  )}
                </div>

                <button
                  className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-sm hover:shadow transition-all duration-300"
                  onClick={() => handleStartCourse(course._id)}
                >
                  {Number(course.progress) === 100 ? "Continue" : "Start"}
                  <ChevronRight size={14} className="ml-1" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default TotalCourses;
