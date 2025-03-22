"use client";
import React, { useState } from "react";
import { Search, Filter, BookOpen, ChevronRight, CheckCircle, Clock, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

function QuestionBank() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Mock data for question sets - replace with actual API call
  const questionSets = [
    {
      id: "qs1",
      title: "JavaScript Fundamentals",
      category: "JavaScript",
      questionCount: 25,
      completedCount: 15,
      timeEstimate: "30 min",
      difficulty: "Beginner",
    },
    {
      id: "qs2",
      title: "React Hooks Deep Dive",
      category: "React",
      questionCount: 20,
      completedCount: 0,
      timeEstimate: "45 min",
      difficulty: "Intermediate",
    },
    {
      id: "qs3",
      title: "Node.js API Development",
      category: "Node.js",
      questionCount: 30,
      completedCount: 10,
      timeEstimate: "60 min",
      difficulty: "Advanced",
    },
    {
      id: "qs4",
      title: "CSS Grid & Flexbox",
      category: "CSS",
      questionCount: 15,
      completedCount: 15,
      timeEstimate: "25 min",
      difficulty: "Beginner",
    },
  ];

  const categories = ["All", ...new Set(questionSets.map(qs => qs.category))];

  const filteredQuestionSets = questionSets.filter(qs => 
    (selectedCategory === "All" || qs.category === selectedCategory) &&
    qs.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case "Beginner": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "Intermediate": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Advanced": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Question Bank
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Practice with sample questions to test your knowledge
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
            placeholder="Search question sets..."
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
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              selectedCategory === category
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
                  <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700 mt-2 flex items-center">
                    <div className="h-3 w-3 rounded bg-gray-300 dark:bg-gray-600 mr-2"></div>
                    <div className="h-3 w-16 rounded bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                </div>
                <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-6 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-6 w-36 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
              
              <div className="h-2.5 w-full rounded bg-gray-200 dark:bg-gray-700 mb-4"></div>
              
              <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700"></div>
            </motion.div>
          ))}
        </motion.div>
      ) : filteredQuestionSets.length === 0 ? (
        // No Question Sets Section
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-12 px-4"
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-6 mb-6">
            <img
              src="/images/dashboard-card/messages-question.png"
              alt="No Question Sets"
              className="w-16 h-16 filter brightness-0 invert-[.25] dark:invert"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
            No Question Sets Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
            {searchTerm || selectedCategory !== "All" 
              ? "Try adjusting your search or filter criteria."
              : "Question sets will appear here as you enroll in courses."}
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
        // Render Question Sets
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {filteredQuestionSets.map((questionSet) => (
            <motion.div
              key={questionSet.id}
              variants={item}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {questionSet.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <Tag size={14} className="mr-1" />
                    <span>{questionSet.category}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDifficultyColor(questionSet.difficulty)}`}>
                  {questionSet.difficulty}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                  <BookOpen size={14} className="mr-1" />
                  {questionSet.questionCount} Questions
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                  <Clock size={14} className="mr-1" />
                  {questionSet.timeEstimate}
                </div>
                {questionSet.completedCount > 0 && (
                  <div className="flex items-center text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded">
                    <CheckCircle size={14} className="mr-1" />
                    {questionSet.completedCount}/{questionSet.questionCount} Completed
                  </div>
                )}
              </div>
              
              {/* Progress Bar for completed questions */}
              {questionSet.completedCount > 0 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2 mb-4">
                  <div 
                    className="bg-blue-500 h-2 rounded" 
                    style={{ width: `${(questionSet.completedCount / questionSet.questionCount) * 100}%` }}
                  ></div>
                </div>
              )}
              
              <button
                onClick={() => router.push(`/question-bank/${questionSet.id}`)}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                {questionSet.completedCount > 0 ? "Continue Practice" : "Start Practice"}
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