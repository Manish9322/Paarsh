"use client";
import React, { useState } from "react";
import { Download, Eye, Calendar, Award, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useFetchCourseProgressQuery } from "@/services/api";

// Define types
interface Certificate {
  id: string;
  title: string;
  issueDate: string;
  courseId: string;
  level:string;
  duration:string;
  thumbnail: string;
}

interface Course {
  courseId: string;
  courseProgress: number;
  courseName: string;
  courseDuration: string;
  courseLevel: string;
}

interface CourseProgressData {
  success: boolean;
  completedCourses?: Course[];
}

function Certificates() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: progressData } = useFetchCourseProgressQuery(undefined);

  console.log("Progress Data:", progressData);

  // Define certificates based on progressData
  const certificates: Certificate[] = progressData?.success && progressData?.completedCourses
    ? progressData.completedCourses
      .filter((course: Course) => course.courseProgress >= 80)
      .map((course: Course) => ({
        id: `cert-${course.courseId}`,
        title: course.courseName,
        issueDate: "2023-05-15", // Replace with actual issue date if available
        courseId: course.courseId,
        thumbnail: "/images/dashboard-card/certif.png",
        duration: course.courseDuration,
        level: course.courseLevel,
      }))
    : [];

  const filteredCertificates: Certificate[] = certificates.filter((cert: Certificate) =>
    cert.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Filtered Certificates:", filteredCertificates);

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

  const handleDownload = (id: string) => {
    console.log(`Downloading certificate ${id}`);
  };

  const handleView = (id: string) => {
    console.log(`Viewing certificate ${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            My Certificates
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            View and download your achievement certificates
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
            placeholder="Search certificates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Render Certificates */}
      {filteredCertificates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-12 px-4"
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-6 mb-6">
            <Award className="w-16 h-16 text-blue-500 dark:text-blue-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
            No Certificates Yet
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
            Complete courses to earn certificates that showcase your achievements.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCertificates.map((certificate) => (
            <div
              key={certificate.id}
              className="bg-white dark:bg-gray-800 rounded overflow-hidden shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300"
            >
              <div className="relative">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 flex items-center justify-center">
                  <img
                    src={certificate.thumbnail}
                    alt={certificate.title}
                    className="h-24 w-auto filter brightness-0 invert-[.25] dark:invert"
                  />
                </div>
                <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                  <Award size={12} className="mr-1" />
                  {certificate.level}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {certificate.title}
                </h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <Calendar size={14} className="mr-1" />
                  <span>Course Duration : {certificate.duration}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleView(certificate.id)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 rounded transition-colors"
                  >
                    <Eye size={16} className="mr-2" />
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(certificate.id)}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Download Certificate
                    <Download size={16} className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default Certificates;