"use client";
import React, { useState } from "react";
import { List, Grid3x3 } from "lucide-react";

const courses = [
  {
    cousreid:"01",
    coursename:"web designer",
    duration:"2 month",
    level:"diffcult",
    languages:"html/css/bootstrap",
     image:"/images/certificates/certificate.jpg"
  },
  { cousreid:"02",
    coursename:"web designer",
    duration:"2 month",
    level:"diffcult",
    languages:"html/css/bootstrap",
     image:"/images/certificates/certificate.jpg"
  },
  { cousreid:"03",
    coursename:"web designer",
    duration:"2 month",
    level:"diffcult",
    languages:"html/css/bootstrap",
    image:"/images/certificates/certificate.jpg"
  }
 
 
];

function Totalcourses() {
  const [view, setView] = useState("grid"); // "grid" or "list"

  return (
    <div className="p-6">
      {/* Toggle Buttons */}
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => setView("grid")}
          className={`p-2 rounded ${view === "grid" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          <Grid3x3 size={20} />
        </button>
        <button
          onClick={() => setView("list")}
          className={`p-2 rounded ${view === "list" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          <List size={20} />
        </button>
      </div>

      {/* Course Display */}
      <div
        className={`grid ${
          view === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" : "grid-cols-1 gap-4"
        }`}
      >
        {courses.map((course) => (
          <div
            key={course.cousreid}
            className={`flex ${view === "list" ? "flex-row" : "flex-col"} items-center bg-white shadow-md rounded-lg overflow-hidden p-4 hover:shadow-xl transition`}
          >
            {/* Course Image */}
            <img
              src={course.image}
              alt={course.name}
              className={`${
                view === "list" ? "w-24 h-24 mr-4" : "w-full h-40"
              } object-cover rounded-md`}
            />

            {/* Course Details */}
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-gray-900">{course.coursename}</h3>
              <p className="text-sm text-gray-600">{course.level}</p>
              <p className="text-sm text-gray-600">{course.languages}</p>
              <p className="text-sm text-gray-600">{course.duration}</p>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Totalcourses
;
