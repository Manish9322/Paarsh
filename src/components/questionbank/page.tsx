import React from 'react'
import Image from "next/image";

const questionbanks = [{
  courseId: 101,
  courseName:"web devlopment quiz",
  time:"40"
},
{
  courseId: 102,
courseName:"sql quiz",
  time:"20"
},
{
  courseId: 103,
  courseName:"React quiz",
    time:"20"
  },
  {
    courseId: 104,
    courseName:"web devlopment quiz",
      time:"60"
    }
];
function questionbank() {
  return (
   
    <>
    
       {/* Conditionally Render question bank */}
          
      <div className="mt-8 p-4 border rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">Question Bank</h3>
        <div className="space-y-4">
          {questionbanks.map((course, courseIndex) => (
            <div key={courseIndex} className="border p-4 rounded-lg shadow-md bg-gray-100 dark:bg-gray-800 flex justify-between ">
              <h4 className="text-lg font-semibold mb-2">{course.courseName}</h4>
              <div className="flex justify-between items-center">
              <Image src="/images/questionbank/hourglass.png" alt="Hourglass" width={20} height={20} />
                <span className="text-sm text-gray-600 dark:text-gray-400"> {course.time} mins</span>
                <button 
                  className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 ml-3"
                  // onClick={() => navigateToQuiz(course.courseId)}
                  // onClick={() => setIsModalOpen(true)}
                >
                  Start Quiz
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
   
    </>
  )
}

export default questionbank