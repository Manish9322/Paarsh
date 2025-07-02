"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaPencilRuler } from "react-icons/fa";
import { LiaCertificateSolid } from "react-icons/lia";

import {
  useFetchUserOngoingCoursesQuery,
  useFetchUserCourseQuery,
  useFetchTransactionsQuery,
  useFetchUserQuery,
  useFetchCourseProgressQuery,
  useFetchPracticeTestsQuery,
} from "@/services/api";

const cardData = [
  {
    title: "Total Courses",
    path: "/total-courses",
    image: "/images/dashboard-card/course.png",
    description: "Browse all available courses",
    color: "from-blue-500 to-blue-600",
    hoverColor: "hover:from-blue-600 hover:to-blue-700",
  },
  {
    title: "Ongoing Courses",
    path: "/ongoing-courses",
    image: "/images/dashboard-card/ongoing.png",
    description: "Continue your learning journey",
    color: "from-green-500 to-green-600",
    hoverColor: "hover:from-green-600 hover:to-green-700",
  },
  {
    title: "Certificates",
    path: "/certificates",
    image: "/images/dashboard-card/certif.png",
    description: "View your achievements",
    color: "from-purple-500 to-purple-600",
    hoverColor: "hover:from-purple-600 hover:to-purple-700",
  },
  {
    title: "Practice Tests",
    path: "/question-bank",
    image: "/images/dashboard-card/messages-question.png",
    description: "Practice with sample tests",
    color: "from-orange-500 to-orange-600",
    hoverColor: "hover:from-orange-600 hover:to-orange-700",
  },
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

export default function UserDashboard() {
  const { data: practiceTestsData, isLoading: isLoadingPracticeTests } = useFetchPracticeTestsQuery(undefined);
  const { data: ongoingCourses, isLoading: isLoadingOngoingCourses } = useFetchUserOngoingCoursesQuery(undefined);
  const { data: progressData, isLoading: isLoadingProgress } = useFetchCourseProgressQuery(undefined);
  const { data: totalCourses, isLoading: isLoadingTotalCourses } = useFetchUserCourseQuery(undefined);
  const { data: userData, isLoading: isLoadingUser } = useFetchUserQuery(undefined);
  const { data: transactions, isLoading: isLoadingTransactions } = useFetchTransactionsQuery(undefined);

  // Check if any query is still loading
  const isLoading = isLoadingPracticeTests || isLoadingOngoingCourses || isLoadingProgress || isLoadingTotalCourses || isLoadingUser || isLoadingTransactions;


  const latestTransaction = transactions?.data
    ?.filter(
      (transaction) =>
        transaction?.userId?._id === userData?.data?._id &&
        transaction.status === "SUCCESS"
    )
    ?.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

  const purchaseTime = latestTransaction?.createdAt;

  function timeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diff < 60) return `${diff} seconds ago`;
    else if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    else if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    else return `${Math.floor(diff / 86400)} days ago`;
  }

  const timeSincePurchase = purchaseTime ? timeAgo(purchaseTime) : "Loading...";

  const purchasedCourseIds = userData?.data?.purchasedCourses
    ?.filter((course) => !course.isExpired)
    ?.map((course) => course.course) || [];

  const availableTests = practiceTestsData?.data?.filter((test) =>
    test.linkedCourses.some((linkedCourse) =>
      purchasedCourseIds.includes(linkedCourse._id)
    )
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Welcome Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 w-48 bg-blue-100 dark:bg-blue-900/30 rounded-md animate-pulse"></div>
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-48 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          ))}
        </div>

        {/* Recent Activity and Upcoming Classes Skeleton */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse mr-3"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Classes Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse mr-3"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Welcome to Your Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your courses and track your progress
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Pro Tip:</span> Click on any card to explore more
          </p>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {cardData.map((card, index) => (
          <motion.div key={index} variants={item} className="h-full">
            <Link
              href={card.path}
              className={`group flex flex-col h-full rounded-md overflow-hidden bg-gradient-to-br ${card.color} ${card.hoverColor} shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="p-6 flex-grow flex flex-col items-center text-center">
                <div className="w-12 h-12 mb-4 bg-white/20 rounded-full p-2 backdrop-blur-sm">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-8 h-7 flex justify-center items-center object-contain filter brightness-0 invert"
                  />
                </div>
                <h1 className="text-xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                  {card.title}
                </h1>
                <p className="text-white/80 text-sm">
                  {card.description}
                </p>
              </div>
              <div className="bg-white/10 py-3 px-4 text-center">
                <span className="text-white text-sm font-medium">
                  Explore →
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Recent Activities
          </h1>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                <BookIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {(() => {
                    if (timeSincePurchase === "Loading...") {
                      return "New Course: Loading...";
                    }
                    const match = timeSincePurchase.match(/^(\d+)\s+(\w+)\s+ago$/);
                    if (!match) {
                      return "New Course: Loading...";
                    }
                    const [, value, unit] = match;
                    const numValue = parseInt(value);

                    // Check if time exceeds 5 days
                    const isOverFiveDays =
                      (unit === "days" && numValue > 5) ||
                      (unit === "hours" && numValue > 5 * 24) ||
                      (unit === "minutes" && numValue > 5 * 24 * 60) ||
                      (unit === "seconds" && numValue > 5 * 24 * 60 * 60);

                    return isOverFiveDays
                      ? "No new course available."
                      : `New Course: ${totalCourses?.purchasedCourses[totalCourses?.purchasedCourses.length - 1]?.courseName || "Loading..."}`;
                  })()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(() => {
                    if (timeSincePurchase === "Loading...") {
                      return "Loading...";
                    }
                    const match = timeSincePurchase.match(/^(\d+)\s+(\w+)\s+ago$/);
                    if (!match) {
                      return "Loading...";
                    }
                    const [, value, unit] = match;
                    const numValue = parseInt(value);

                    // Check if time exceeds 5 days
                    const isOverFiveDays =
                      (unit === "days" && numValue > 5) ||
                      (unit === "hours" && numValue > 5 * 24) ||
                      (unit === "minutes" && numValue > 5 * 24 * 60) ||
                      (unit === "seconds" && numValue > 5 * 24 * 60 * 60);

                    return isOverFiveDays ? "Purchase new course" : timeSincePurchase;
                  })()}
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {ongoingCourses?.data?.length > 0 ? ongoingCourses?.data?.length : "0"} Total Ongoing Courses.
                </p>
                {(() => {
                  const count = ongoingCourses?.data?.filter(
                    (course) => course.courseProgress >= 70 && course.courseProgress <= 99
                  )?.length;

                  return (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {count != null
                        ? `${count > 0 ? count : "No"} ${count === 1 ? 'Course is' : 'Courses are'} About to Complete`
                        : "Loading..."}
                    </p>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Downloadables and Practice Tests
          </h1>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                <LiaCertificateSolid className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {progressData?.completedCourses?.length > 0 ? progressData?.completedCourses?.length : "No"} Certificates are available for download.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate lg:max-w-full max-w-[150px]">
                  {progressData?.completedCourses?.length > 0
                    ? progressData?.completedCourses?.map(course => course.courseName).join(", ")
                    : "No certificates available"}
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3">
                <FaPencilRuler className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {availableTests.length > 0 ? availableTests.length : "No"} Practice Tests are available.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate lg:max-w-full max-w-[150px]">
                  {availableTests.length > 0
                    ? availableTests.map((test) => test.testName).join(", ")
                    : "No practice tests available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17h10"></path>
      <path d="M6.5 2h10v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

function CalendarIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}