"use client"
import React, { useState ,useEffect} from "react";
import Image from "next/image";
import { CiGrid41 } from "react-icons/ci";
import { TbLayoutList } from "react-icons/tb";
import { PiCertificateLight } from "react-icons/pi";


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

const certificates = [
  { title: "Web Development", image: "/images/certificates/certificate.jpg" },
  { title: "Data Science", image: "/images/certificates/certificate.jpg" },
  { title: "UI/UX Design", image: "/images/certificates/certificate.jpg" }
];
const billing = [
  "Invoice #12345 - Paid",
  "Subscription renewed",
  "Pending payment for Invoice #12346"
];
const ongoingcourse = [
  "Invoice #12345 - Paid",
  "Subscription renewed",
  "Pending payment for Invoice #12346"
];

const questionbank = [{
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

const cardData = [
  {
    title: "Total Course",
    description: "Manage your personal information and security settings.",
    iconPath: "M18 5h-.7c.229-.467.349-.98.351-1.5...",
    category: "courses",
        image:"/images/dashboard-card/course.png"
  },
  {
    title: "ongoingCourse",
    description: "View and manage your alerts and messages.",
    iconPath: "M12 2a10 10 0 1 1-10 10A10 10 0 0 1 12 2z...",
    category: "ongoingcourse",
    image:"/images/dashboard-card/ongoing.png"
   
  },
  {
    title: "Certificates",
    description: "Check your invoices, payments, and subscriptions.",
    iconPath: "M6 2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z...",
    category: "certificate",
    image:"/images/dashboard-card/certif.png"
  },
  {
    title: "questionbank",
    description: "Get help and find answers to your questions.",
    iconPath: "M3 10h2v2H3v-2zm4 0h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z...",
    category: "questionbank",
   image:"/images/dashboard-card/messages-question.png"
  },
];

function DashboardCards() {
  const [isGridView, setIsGridView] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (category) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  };


   useEffect(() => {
      if (isModalOpen) {
        document.body.style.overflow = "hidden";  // Disable scrolling
      } else {
        document.body.style.overflow = "auto";  // Enable scrolling
      }
    }, [isModalOpen]);

  return (
    <div className="container my-20 px-4 py-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardData.map((card, index) => (
        <div
          key={index}
          className="card-container cursor-pointer p-6 border rounded-md shadow-md hover:shadow-3xl transition-transform transform hover:scale-105 bg-white dark:bg-gray-900 flex flex-col items-center text-center"
          onClick={() => handleCardClick(card.category)}
        >
                <img
        src={card.image}
        alt={card.title}
        className="w-16 h-16 mb-3 object-cover"
      />
          {/* <svg
            className="card-icon w-12 h-12 mb-3 text-blue-500 dark:text-blue-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d={card.iconPath} />
          </svg> */}
          <h5 className="card-title font-bold text-xl text-gray-900 dark:text-white">{card.title}</h5>
          <p className="card-description text-gray-600 dark:text-gray-300 mt-2">{card.description}</p>
        </div>
      ))}
    </div>
  


    {selectedCategory === "courses" && (
  <div className="mt-8 p-6 border rounded-2xl shadow-2xl w-full mx-0 bg-white dark:bg-gray-900">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h3>
      <button
        onClick={() => setIsGridView(!isGridView)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
        {isGridView ? <TbLayoutList size={20} /> : <CiGrid41 size={20} />}
      </button>
    </div>
    
    <div className={isGridView ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4 "}>
      {courses.map((course, index) => (
        <div 
          key={index} 
          className={`w-full bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-4 ${
            isGridView ? "" : "max-w-xxl w-full flex items-center"
          }`}
        >
          {/* Image Section */}
          <img 
            src={course.image} 
            alt={course.coursename} 
            className={`rounded-md object-cover ${
              isGridView ? "w-full h-40 mb-4" : "w-100 h-60 mr-4"
            }`}
          />

          {/* Text Section */}
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{course.coursename}</h4>
            {/* <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{course.description}</p> */}
            <p className="text-gray-700 dark:text-gray-300 text-lg">Duration: {course.duration}</p>
            <p className="text-gray-700 dark:text-gray-300 text-lg">Level: {course.level}</p>
            <p className="text-gray-700 dark:text-gray-300 text-lg">Languages: {course.languages}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

   {/* Conditionally Render ongoing corses */}
      {selectedCategory === "ongoingcourse" && (
        <div className="mt-8 p-4 border rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">ongoing-course</h3>
          <ul className="list-disc pl-5">
            {ongoingcourse.map((ongoingcourse, index) => (
              <li key={index} className="text-gray-700">{ongoingcourse}</li>
            ))}
          </ul>
        </div>
      )}

{selectedCategory === "certificate" && (
  <div className="mt-8 p-4 border rounded-lg shadow-lg bg-white dark:bg-gray-900">
    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Certificates</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {certificates.map((certificate, index) => (
        <div key={index} className="p-4 border rounded-lg shadow-md bg-gray-50 dark:bg-gray-800">
          <img 
            src={certificate.image} 
            alt={`Certificate ${index + 1}`} 
            className="w-full h-auto rounded-lg"
          />
          <p className="text-gray-700 dark:text-gray-300 text-center mt-2">{certificate.title}</p>
        </div>
      ))}
    </div>
  </div>
)}
      {/* Conditionally Render question bank */}
      {selectedCategory === "questionbank" && (
  <div className="mt-8 p-4 border rounded-lg shadow-lg">
    <h3 className="text-xl font-bold mb-4">Question Bank</h3>
    <div className="space-y-4">
      {questionbank.map((course, courseIndex) => (
        <div key={courseIndex} className="border p-4 rounded-lg shadow-md bg-gray-100 dark:bg-gray-800 flex justify-between ">
          <h4 className="text-lg font-semibold mb-2">{course.courseName}</h4>
          <div className="flex justify-between items-center">
          <Image src="/images/questionbank/hourglass.png" alt="Hourglass" width={20} height={20} />
            <span className="text-sm text-gray-600 dark:text-gray-400"> {course.time} mins</span>
            <button 
              className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 ml-3"
              // onClick={() => navigateToQuiz(course.courseId)}
              onClick={() => setIsModalOpen(true)}
            >
              Start Quiz
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* Modal for Quiz Instructions */}
{isModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-96 md:w-[30rem] text-center">
      <h2 className="text-xl font-bold mb-4">Quiz Instructions</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Please read the instructions carefully before starting the quiz.
      </p>
      <ul className="text-left text-gray-700 dark:text-gray-300 space--3 mb-5 list-disc">
        <li>The quiz consists of multiple-choice questions.</li>
        <li>You have a limited time </li>
        <li>Each correct answer awards marks, and wrong answers may have negative marking.</li>
        <li>Ensure you have a stable internet connection before starting.</li>
      </ul>
      <div className="flex justify-end space-x-2">
        <button 
          className="bg-gray-300 dark:bg-gray-700 p-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600" 
          onClick={() => setIsModalOpen(false)}
        >Cancel</button>
        <button 
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          // onClick={() => navigateToQuiz(selectedQuiz?.id)}
        >Start Test</button>
      </div>
    </div>
  </div>
) 
}

    </div>
  );
}

export default DashboardCards;