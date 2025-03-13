"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/Layout/DashboardSidebar";
import ReferEarn from "@/components/ReferEarn/page";
import TotalCourses from "@/components/totalcourses/page";
import OngoingCourse from "@/components/ongoingcourses/page";
import QuestionBank from "@/components/questionbank/page";
import Certificates from "@/components/certificate/page";
import Userprofile from "@/components/userprofile/page";

const cardData = [
  {
    title: "Total Course",
    category: "totalcourses",
    image: "/images/dashboard-card/course.png",
  },
  {
    title: "Ongoing Course",
    category: "ongoingcourses",
    image: "/images/dashboard-card/ongoing.png",
  },
  {
    title: "Certificates",
    category: "certificate",
    image: "/images/dashboard-card/certif.png",
  },
  {
    title: "Question Bank",
    category: "questionbank",
    image: "/images/dashboard-card/messages-question.png",
  },
];

const componentsMap = {
  totalcourses: <TotalCourses />,
  ongoingcourses: <OngoingCourse />,
  certificate: <Certificates />,
  questionbank: <QuestionBank />,
  userprofile: <Userprofile />,
  referEarn: <ReferEarn />,
};

export default function UserDashboard() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar Component */}
      <DashboardSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:ml-64">
        <div className="p-4 dark:border-gray-700">
          {selectedCategory ? (
            componentsMap[selectedCategory]
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
              {cardData.map((card, index) => (
                <div
                  key={index}
                  className="card-container hover:shadow-3xl flex transform cursor-pointer flex-col items-center rounded-md border bg-white p-6 text-center shadow-md transition-transform hover:scale-105 dark:bg-gray-900"
                  onClick={() => setSelectedCategory(card.category)}
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="mb-3 h-16 w-16 object-cover"
                  />
                  <h5 className="card-title text-xl font-bold text-gray-900 dark:text-white">
                    {card.title}
                  </h5>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
