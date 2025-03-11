"use client";
import React, { useState } from "react";
import { List, Grid3x3 } from "lucide-react";
import { useFetchUserCourseQuery } from "@/services/api";
import { useRouter } from "next/navigation";

function OngoingCourses() {
  const [view, setView] = useState("grid");
  const { data, isLoading } = useFetchUserCourseQuery(undefined);
  const ongoingCourses = data?.ongoingCourses || []; // Replace with correct API field
  const router = useRouter();

  return (
    <div className="p-6">
      {/* Toggle Buttons */}
      <div className="mb-4 flex justify-end gap-2">
        <button
          onClick={() => setView("grid")}
          className={`rounded p-2 ${view === "grid" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          <Grid3x3 size={20} />
        </button>
        <button
          onClick={() => setView("list")}
          className={`rounded p-2 ${view === "list" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          <List size={20} />
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className={`flex ${view === "list" ? "flex-row" : "flex-col"} animate-pulse items-center overflow-hidden rounded-lg bg-white p-4 shadow-md`}
            >
              <div
                className={`${view === "list" ? "mr-4 h-24 w-24" : "h-40 w-full"} mb-2 rounded-md bg-gray-300`}
              ></div>
              <div className="flex w-full flex-col space-y-2">
                <div className="h-5 w-3/4 rounded bg-gray-300"></div>
                <div className="h-4 w-1/2 rounded bg-gray-300"></div>
              </div>
            </div>
          ))}
        </div>
      ) : ongoingCourses.length === 0 ? (
        // No Ongoing Courses Section
        <div className="mt-20 flex flex-col items-center justify-center md:mt-28 lg:mt-32">
          {/* Empty Ongoing Courses Image */}
          <img
            src="/images/dashboard-card/ongoing.png" // Replace with actual image path
            alt="No Ongoing Courses"
            className="mb-4 h-44 w-44"
          />
          {/* No Ongoing Courses Message */}
          <p className="text-center text-lg font-semibold text-gray-700">
            You haven't started any courses yet!
          </p>
          {/* View Courses Button */}
          <button
            onClick={() => router.push("/newcourses")}
            className="mt-4 rounded-lg bg-blue-500 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-600"
          >
            View Courses
          </button>
        </div>
      ) : (
        // Render Ongoing Courses
        <div
          className={`grid ${view === "grid" ? "grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3" : "grid-cols-1 gap-4"}`}
        >
          {ongoingCourses.map((course) => (
            <div
              key={course._id}
              className={`flex ${view === "list" ? "flex-row" : "flex-col"} items-center overflow-hidden rounded-lg bg-white p-4 shadow-md transition hover:shadow-xl`}
            >
              <img
                src={course.thumbnail}
                alt={course.courseName}
                className={`${view === "list" ? "mr-4 h-24 w-24" : "h-40 w-full"} rounded-md object-cover`}
              />
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-gray-900">
                  {course.courseName}
                </h3>
                <p className="text-sm text-gray-600">{course.level}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OngoingCourses;
