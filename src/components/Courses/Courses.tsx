"use client";

import CourseCard from "@/components/TopCources/CourseCard";
import { FaBookOpen, FaUsers, FaChalkboardTeacher } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter

const courses = {
  IT: [
    { id: 1, title: "React for Beginners", instructor: "John Doe", duration: "6 hours", level: "Beginner", image: "/images/brands/next.jpg" },
    { id: 2, title: "Advanced JavaScript", instructor: "Jane Smith", duration: "10 hours", level: "Advanced", image: "/images/brands/next.jpg" },
    { id: 3, title: "Node.js & Express Crash Course", instructor: "Mike Johnson", duration: "8 hours", level: "Intermediate", image: "/images/brands/next.jpg" },
  ],
  NonIT: [
    { id: 4, title: "Business Communication", instructor: "Sarah Lee", duration: "4 hours", level: "Beginner", image: "/images/brands/next.jpg" },
    { id: 5, title: "Digital Marketing 101", instructor: "David Kim", duration: "7 hours", level: "Intermediate", image: "/images/brands/next.jpg" },
    { id: 6, title: "Project Management Basics", instructor: "Emma Watson", duration: "9 hours", level: "Advanced", image: "/images/brands/next.jpg" },
  ],
  Popular: [
    { id: 7, title: "Machine Learning Fundamentals", instructor: "Alice Brown", duration: "12 hours", level: "Advanced", image: "/images/brands/next.jpg" },
    { id: 8, title: "Web Development Bootcamp", instructor: "Chris Evans", duration: "15 hours", level: "Beginner", image: "/images/brands/next.jpg" },
  ],
  Latest: [
    { id: 9, title: "Cybersecurity Basics", instructor: "Robert Downey", duration: "8 hours", level: "Intermediate", image: "/images/brands/next.jpg" },
    { id: 10, title: "Cloud Computing Essentials", instructor: "Tony Stark", duration: "10 hours", level: "Intermediate", image: "/images/brands/next.jpg" },
  ],
};

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof courses>("IT");
  const router = useRouter(); // Initialize router

  return (

    <>

      <div className="Main-container">
        <div className="left-part">
        </div>

        <div className="right-part">
          
        </div>
      </div>

      <div className="container mx-auto flex flex-col gap-12 mt-20 px-6 py-12">
        {/* About Courses Section */}
        <section className="text-center">
          <h1 className="text-4xl font-bold leading-relaxed text-gray-900 dark:text-white">
            What would you like to <span className="text-blue-600">learn?</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-4">
            Explore our courses designed by industry experts to boost your knowledge and career.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <FaBookOpen className="text-blue-600 text-3xl" />
              <span className="text-lg font-medium text-gray-700 dark:text-white">100+ Courses</span>
            </div>
            <div className="flex items-center gap-3">
              <FaUsers className="text-green-600 text-3xl" />
              <span className="text-lg font-medium text-gray-700 dark:text-white">10K+ Students</span>
            </div>
            <div className="flex items-center gap-3">
              <FaChalkboardTeacher className="text-yellow-600 text-3xl" />
              <span className="text-lg font-medium text-gray-700 dark:text-white">Top Instructors</span>
            </div>
          </div>
        </section>

        {/* Category Selection
        <div className="flex justify-center gap-4">
          {Object.keys(courses).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as keyof typeof courses)}
              className={`px-6 py-2 rounded font-medium transition ${selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white"
                }`}
            >
              {category}
            </button>
          ))}
        </div> */}

<div className="flex flex-wrap justify-center gap-4 sm:gap-2">
  {Object.keys(courses).map((category) => (
    <button
      key={category}
      onClick={() => setSelectedCategory(category as keyof typeof courses)}
      className={`px-6 py-2 text-sm sm:text-xs rounded font-medium transition ${
        selectedCategory === category
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white"
      }`}
    >
      {category}
    </button>
  ))}
</div>


        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {courses[selectedCategory].map((course) => (
            <div
              key={course.id}
              onClick={() => router.push(`/coursedetails?id=${course.id}`)} // Navigate to course details
              className="cursor-pointer"
            >
              <CourseCard
                title={course.title}
                instructor={course.instructor}
                duration={course.duration}
                level={course.level}
                imageUrl={course.image}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
