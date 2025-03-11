"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import  ThemeToggler  from "@/components/Header/ThemeToggler";
import {
  
  X,
  LayoutDashboard,
  Home, 
  User,
  Video,
  Gift,
  Bell,
  HelpCircle,
  LogOut,
  Menu,
} from "lucide-react";
import ReferEarn from "@/components/ReferEarn/page";
import TotalCourses from "@/components/totalcourses/page";
import OngoingCourse from "@/components/ongoingcourses/page";
import QuestionBank from "@/components/questionbank/page";
import Certificates from "@/components/certificate/page";
import Userprofile from "@/components/userprofile/page";
import { logout } from "../../lib/slices/userAuthSlice"
import { useDispatch } from "react-redux";
import { on } from "events";

const cardData = [
  {
    title: "Total Course",
    description: "Manage your personal information and security settings.",
    iconPath: "M18 5h-.7c.229-.467.349-.98.351-1.5...",
    category: "totalcourses",
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

const componentsMap = {
  totalcourses: <TotalCourses />,
  ongoingcourses: <OngoingCourse />,
  certificate: <Certificates />,
  questionbank: <QuestionBank />,
  userprofile: <Userprofile />,
  referEarn: <ReferEarn />,
};

function Userdashboard() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
const handleLogout = () => {
    dispatch(logout()); // Redux  logout
    router.push("/"); // Redirect to Sign In page
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 left-4 z-50 sm:hidden bg-gray-200 p-2 rounded-md"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 bg-gray-50 dark:bg-gray-800 transition-transform shadow-lg border-r border-gray-200 dark:border-gray-700 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
      >
        <div className="relative h-full overflow-y-auto p-5">
          {/* Sidebar Header with Close Button */}
          <div className="flex justify-between items-center mb-6">
            <img src="/images/logo/PAARSHEDU_LOGO.PNG" className="h-8" alt="Logo" />
            <div>
                  <ThemeToggler />
                </div>

            <button
              className="sm:hidden text-gray-900 dark:text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          {/* Sidebar Menu Items */}
          <ul className="space-y-4">
            {[
              { name: "Dashboard", icon: <LayoutDashboard size={20} />, onClick: () => setSelectedCategory(null) },
              { name: "Home", icon: <Home size={20} />, onClick: () => router.push("/") },
              { name: "User Profile", icon: <User size={20} />, onClick: () => setSelectedCategory("userprofile") },
              { name: "Meeting Links", icon: <Video size={20} />, link: "#" },
              { name: "Refer & Earn", icon: <Gift size={20} />, link: "#" ,onClick: () => setSelectedCategory("referEarn") },
              { name: "Notifications", icon: <Bell size={20} />, link: "#" },
              { name: "FAQ", icon: <HelpCircle size={20} />, link: "#" },
              { name: "Log Out", icon: <LogOut size={20} />, onClick: handleLogout
              },
            ].map((item, index) => (
              <li key={index}>
                <a
                  href={item.link || "#"}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.onClick) item.onClick(); // Execute onClick function if present
                    setIsSidebarOpen(false); // Close sidebar on mobile
                  }}
                  className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.name}</span>
                </a>
                {index !== 7 && <hr className="border-gray-200 dark:border-gray-700" />}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 sm:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="p-4 sm:ml-64">
        <div className="p-4 dark:border-gray-700">
          {selectedCategory ? (
            componentsMap[selectedCategory] // Dynamically renders the selected component
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
              {cardData.map((card, index) => (
                <div
                  key={index}
                  className="card-container hover:shadow-3xl flex transform cursor-pointer flex-col items-center rounded-md border bg-white p-6 text-center shadow-md transition-transform hover:scale-105 dark:bg-gray-900"
                  onClick={() => setSelectedCategory(card.category)}
                >
                  <img src={card.image} alt={card.title} className="mb-3 h-16 w-16 object-cover" />
                  <h5 className="card-title text-xl font-bold text-gray-900 dark:text-white">{card.title}</h5>
                  <p className="card-description mt-2 text-gray-600 dark:text-gray-300">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Userdashboard;
