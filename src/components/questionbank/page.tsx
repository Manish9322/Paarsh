"use client";
import React, { useState } from "react";
import { Search, BookOpen, ChevronRight, Clock, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useFetchUserCourseQuery, useFetchPracticeTestsQuery } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface PracticeTest {
  _id: string;
  testName: string;
  linkedCourses: string[] | { _id: string; courseName: string }[];
  skill: string;
  level: "Easy" | "Intermediate" | "Difficult";
  questionCount: number;
  duration: string;
  createdAt: string;
  questions: { questionText: string; options: string[]; correctAnswer: string }[];
}

function QuestionBank() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isNavigating, setIsNavigating] = useState<string | null>(null);
  const router = useRouter();

  // Fetch user data (purchased courses)
  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
  } = useFetchUserCourseQuery({});
  const purchasedCourses = userData?.purchasedCourses || [];

  // Fetch practice tests
  const {
    data: practiceTestsData,
    isLoading: isTestsLoading,
    error: testsError,
  } = useFetchPracticeTestsQuery({});
  const practiceTests: PracticeTest[] = practiceTestsData?.data || [];

  // Debug logs
  console.log("User Data:", userData);
  console.log("Purchased Courses:", purchasedCourses);
  console.log("Practice Test D  ata:", practiceTests);

  // Filter practice tests based on purchased courses
  const filteredPracticeTests = practiceTests.filter((test) => {
    const linkedCourseIds = Array.isArray(test.linkedCourses)
      ? test.linkedCourses.map((course) => String(course._id).trim())
      : [];
    const normalizedPurchasedCourses = purchasedCourses.map((course) =>
      typeof course === "string" ? String(course).trim() : String(course._id).trim()
    );
    console.log("Linked Course IDs:", linkedCourseIds);
    console.log("Normalized Purchased Courses:", normalizedPurchasedCourses);
    const hasMatch = linkedCourseIds.some((courseId) => {
      const isMatch = normalizedPurchasedCourses.includes(courseId);
      console.log(
        `Comparing Course ID: ${courseId} with Purchased Courses:`,
        normalizedPurchasedCourses,
        `Match: ${isMatch}`
      );
      return isMatch;
    });
    console.log(
      `Test: ${test.testName}, Linked Courses:`,
      linkedCourseIds,
      `Match: ${hasMatch}`
    );
    return hasMatch;
  });

  console.log("Filtered Practice Tests:", filteredPracticeTests);

  // Ensure no duplicates (safeguard)
  const uniquePracticeTests = Array.from(
    new Map(filteredPracticeTests.map((test) => [test._id, test])).values()
  );

  // Categories for filter (based on skills)
  const categories = [
    "All",
    ...new Set(uniquePracticeTests.map((test) => test.skill)),
  ];

  // Filter by search term and category
  const displayedTests = uniquePracticeTests.filter(
    (test) =>
      (selectedCategory === "All" || test.skill === selectedCategory) &&
      test.testName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Displayed Tests:", displayedTests);

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

  // Map difficulty to colors
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Difficult":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Loading state
  const isLoading = isUserLoading || isTestsLoading;

  // Check if user is logged in
  const isLoggedIn =
    typeof window !== "undefined" &&
    (localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"));

  // Error state or not logged in
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <BookOpen className="h-12 w-12 text-red-400" />
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mt-2">
          Please Log In
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          You need to log in to view your practice tests.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 inline-flex items-center px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          Go to Login
          <ChevronRight size={18} className="ml-2" />
        </button>
      </div>
    );
  }

  if (userError || testsError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <BookOpen className="h-12 w-12 text-red-400" />
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mt-2">
          Error Loading Practice Tests
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Please try again later or contact support.
        </p>
      </div>
    );
  }

  const handleStartPractice = (testId: string) => {
    setIsNavigating(testId);
    router.push(`/question-bank/${testId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Practice Test Bank
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Practice with tests from your purchased courses
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 shadow-sm"
            placeholder="Search practice tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${selectedCategory === category
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {[...Array(4)].map((_, index) => (
            <motion.div
              key={index}
              variants={item}
              className="animate-pulse bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Skeleton className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-700" />
                  <Skeleton className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700 mt-2" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="flex flex-wrap gap-3 mb-4">
                <Skeleton className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-6 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            </motion.div>
          ))}
        </motion.div>
      ) : displayedTests.length === 0 ? (
        // No Practice Tests Section
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-12 px-4"
        >
          <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
            No Practice Tests Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
            {searchTerm || selectedCategory !== "All"
              ? "Try adjusting your search or filter criteria."
              : "No practice tests are available for your purchased courses."}
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
            }}
            className="inline-flex items-center px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            Reset Filters
            <ChevronRight size={18} className="ml-2" />
          </button>
        </motion.div>
      ) : (
        // Render Practice Tests
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {displayedTests.map((test) => (
            <motion.div
              key={test._id}
              variants={item}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {test.testName}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <Tag size={14} className="mr-1" />
                    <span>{test.skill}</span>
                  </div>
                </div>
                <Badge className={getDifficultyColor(test.level)}>{test.level}</Badge>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                  <BookOpen size={14} className="mr-1" />
                  {test.questionCount} Questions
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                  <Clock size={14} className="mr-1" />
                  {test.duration}
                </div>
              </div>

              <button
                onClick={() => handleStartPractice(test._id)}
                disabled={isNavigating === test._id}
                className={`w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${isNavigating === test._id ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {isNavigating === test._id ? "Loading..." : "Start Practice"}
                <ChevronRight size={16} className="ml-1" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default QuestionBank;