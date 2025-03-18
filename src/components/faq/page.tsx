"use client";
import React, { useState } from "react";
import { Search, ChevronDown, ChevronUp, HelpCircle, MessageCircle, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Faq() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data for FAQs - replace with actual API call
  const faqs = [
    {
      id: "faq1",
      question: "How do I reset my password?",
      answer: "To reset your password, click on the 'Forgot Password' link on the login page. You will receive an email with instructions to create a new password.",
      category: "Account",
    },
    {
      id: "faq2",
      question: "Can I download course materials for offline viewing?",
      answer: "Yes, most course materials can be downloaded for offline viewing. Look for the download icon next to videos and documents in your enrolled courses.",
      category: "Courses",
    },
    {
      id: "faq3",
      question: "How do I get a certificate after completing a course?",
      answer: "Certificates are automatically generated once you complete all required modules and pass any assessments. You can find your certificates in the 'Certificates' section of your dashboard.",
      category: "Certificates",
    },
    {
      id: "faq4",
      question: "What payment methods are accepted?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and in some regions, bank transfers and mobile payment options.",
      category: "Billing",
    },
    {
      id: "faq5",
      question: "How do I contact my instructor?",
      answer: "You can contact your instructor through the course discussion forum or by using the messaging feature within the course interface. Instructors typically respond within 24-48 hours.",
      category: "Courses",
    },
  ];

  const categories = ["All", ...new Set(faqs.map(faq => faq.category))];

  const filteredFaqs = faqs.filter(faq => 
    (activeCategory === "All" || faq.category === activeCategory) &&
    (faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
     faq.answer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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

  return (
    <div className="mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
            Find answers to common questions about our platform
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 shadow-sm"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
              activeCategory === category
                ? "bg-blue-600 text-white shadow-md transform scale-105"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
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
          className="space-y-4"
        >
          {[...Array(3)].map((_, index) => (
            <motion.div
              key={index}
              variants={item}
              className="animate-pulse bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 p-6"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700 mt-4"></div>
            </motion.div>
          ))}
        </motion.div>
      ) : filteredFaqs.length === 0 ? (
        // No FAQs Section
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700"
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-full p-8 mb-6">
            <HelpCircle className="w-16 h-16 text-blue-500 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-3">
            No FAQs Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8 text-lg">
            {searchTerm || activeCategory !== "All" 
              ? "Try adjusting your search or filter criteria."
              : "We're currently updating our FAQ section. Please check back later."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                setSearchTerm("");
                setActiveCategory("All");
              }}
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 rounded-lg transition-colors border border-blue-200 dark:border-blue-800/30"
            >
              Reset Filters
            </button>
            <button
              onClick={() => window.open('mailto:support@paarshedu.com', '_blank')}
              className="inline-flex items-center justify-center px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-sm font-medium"
            >
              <MessageCircle size={16} className="mr-2" />
              Contact Support
            </button>
          </div>
        </motion.div>
      ) : (
        // Render FAQs
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              variants={item}
              className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow border-l-4 ${
                openIndex === index 
                  ? "border-blue-500 dark:border-blue-400" 
                  : "border-blue-200 dark:border-blue-800"
              } border border-y-blue-100 dark:border-gray-700 transition-all duration-300`}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="flex justify-between items-center w-full p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </h3>
                </div>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  openIndex === index 
                    ? "bg-blue-100 dark:bg-blue-900/30" 
                    : "bg-gray-100 dark:bg-gray-700"
                }`}>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-0 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mt-4">
                        {faq.answer}
                      </p>
                      <div className="flex items-center mt-6">
                        <span className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300">
                          <Tag size={12} />
                          {faq.category}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {/* Contact Support Section */}
      {filteredFaqs.length > 0 && (
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl overflow-hidden shadow-md border border-blue-100 dark:border-blue-800/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8">
            <div className="flex items-start gap-5">
              <div className="hidden sm:flex bg-white dark:bg-gray-800 rounded-full p-4 shadow-md">
                <MessageCircle size={24} className="text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Still Have Questions?
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 mt-2 max-w-lg">
                  If you couldnt find the answer you were looking for, our support team is here to help you with any questions or concerns.
                </p>
              </div>
            </div>
            <button
              onClick={() => window.open('mailto:support@paarshedu.com', '_blank')}
              className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <MessageCircle size={16} className="mr-2" />
              Contact Support
            </button>
          </div>
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-900/40">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: "30%" }}></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Faq;
