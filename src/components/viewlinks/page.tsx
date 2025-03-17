"use client";
import React, { useState, useEffect } from "react";
import { Search, Video, Calendar, Clock, ExternalLink, Copy, Check, ChevronRight, User, AlertCircle, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function ViewLinks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const router = useRouter();
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Mock data for meeting links - replace with actual API call
  const meetingLinks = [
    {
      id: "ml1",
      title: "JavaScript Fundamentals - Week 1",
      date: "2023-08-15",
      time: "10:00 AM - 11:30 AM",
      link: "https://meet.google.com/abc-defg-hij",
      platform: "Google Meet",
      instructor: "John Doe",
      status: "upcoming",
      description: "Introduction to JavaScript variables, functions, and control flow",
    },
    {
      id: "ml2",
      title: "React Components Workshop",
      date: "2023-08-17",
      time: "2:00 PM - 4:00 PM",
      link: "https://zoom.us/j/123456789",
      platform: "Zoom",
      instructor: "Jane Smith",
      status: "upcoming",
      description: "Hands-on workshop on building reusable React components",
    },
    {
      id: "ml3",
      title: "Node.js API Development",
      date: "2023-08-20",
      time: "11:00 AM - 12:30 PM",
      link: "https://teams.microsoft.com/l/meetup-join/abc123",
      platform: "Microsoft Teams",
      instructor: "Robert Johnson",
      status: "upcoming",
      description: "Building RESTful APIs with Node.js and Express",
    },
    {
      id: "ml4",
      title: "CSS Grid & Flexbox Masterclass",
      date: "2023-07-10",
      time: "1:00 PM - 2:30 PM",
      link: "https://zoom.us/j/987654321",
      platform: "Zoom",
      instructor: "Sarah Williams",
      status: "past",
      description: "Deep dive into modern CSS layout techniques",
      recording: "https://example.com/recordings/css-masterclass",
    },
    {
      id: "ml5",
      title: "TypeScript Fundamentals",
      date: "2023-07-05",
      time: "10:00 AM - 11:30 AM",
      link: "https://meet.google.com/xyz-abcd-efg",
      platform: "Google Meet",
      instructor: "Michael Brown",
      status: "past",
      description: "Introduction to TypeScript types, interfaces, and generics",
      recording: "https://example.com/recordings/typescript-fundamentals",
    },
  ];

  const filteredLinks = meetingLinks
    .filter(link => 
      (link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.instructor.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeFilter === "all" || 
       (activeFilter === "upcoming" && link.status === "upcoming") ||
       (activeFilter === "past" && link.status === "past"))
    )
    .sort((a, b) => {
      // Sort by date (upcoming first, then past)
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (a.status === "upcoming" && b.status === "past") return -1;
      if (a.status === "past" && b.status === "upcoming") return 1;
      return dateB - dateA; // Most recent first
    });

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

  const handleCopyLink = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleJoinMeeting = (link: string) => {
    window.open(link, '_blank');
  };

  const getPlatformColor = (platform: string) => {
    switch(platform) {
      case "Google Meet": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30";
      case "Zoom": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30";
      case "Microsoft Teams": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800/30";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600";
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch(platform) {
      case "Google Meet": return "https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon.svg";
      case "Zoom": return "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Zoom_Communications_Logo.svg/1200px-Zoom_Communications_Logo.svg.png";
      case "Microsoft Teams": return "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/1200px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png";
      default: return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const isUpcoming = (dateStr: string) => {
    const meetingDate = new Date(dateStr);
    const today = new Date();
    return meetingDate >= today;
  };

  const getStatusBadge = (status: string, date: string) => {
    if (status === "upcoming") {
      const meetingDate = new Date(date);
      const today = new Date();
      const diffTime = Math.abs(meetingDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        return (
          <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs px-3 py-1 rounded-full border border-red-200 dark:border-red-800/30 font-medium">
            Today
          </span>
        );
      } else if (diffDays <= 3) {
        return (
          <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-800/30 font-medium">
            Soon
          </span>
        );
      } else {
        return (
          <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs px-3 py-1 rounded-full border border-green-200 dark:border-green-800/30 font-medium">
            Upcoming
          </span>
        );
      }
    } else {
      return (
        <span className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600 font-medium">
          Past
        </span>
      );
    }
  };
  
    return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Meeting Links
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Access your class meeting links and recordings
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
            placeholder="Search by title or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveFilter("all")}
          className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeFilter === "all"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          All Meetings
        </button>
        <button
          onClick={() => setActiveFilter("upcoming")}
          className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeFilter === "upcoming"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveFilter("past")}
          className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeFilter === "past"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Past Meetings
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4"
        >
          {[...Array(3)].map((_, index) => (
            <motion.div
              key={index}
              variants={item}
              className="animate-pulse bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 p-5"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="w-full md:w-2/3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-3">
                    <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700 flex items-center">
                      <div className="h-3 w-3 rounded bg-gray-300 dark:bg-gray-600 mr-2"></div>
                      <div className="h-3 w-24 rounded bg-gray-300 dark:bg-gray-600"></div>
                    </div>
                    <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-700 flex items-center">
                      <div className="h-3 w-3 rounded bg-gray-300 dark:bg-gray-600 mr-2"></div>
                      <div className="h-3 w-16 rounded bg-gray-300 dark:bg-gray-600"></div>
                    </div>
                    <div className="h-5 w-28 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  
                  <div className="h-4 w-36 rounded bg-gray-200 dark:bg-gray-700 mt-3"></div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 min-w-[200px]">
                  <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : filteredLinks.length === 0 ? (
        // No Meeting Links Section
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-12 px-4"
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-6 mb-6">
            <Video className="w-16 h-16 text-blue-500 dark:text-blue-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
            No Meeting Links Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
            {searchTerm || activeFilter !== "all"
              ? "Try adjusting your search criteria or filter selection."
              : "You don't have any upcoming meetings scheduled. Check back later for updates."}
          </p>
          {(searchTerm || activeFilter !== "all") && (
            <div className="flex flex-col sm:flex-row gap-3">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 rounded-lg transition-colors border border-blue-200 dark:border-blue-800/30"
                >
                  Clear Search
                </button>
              )}
              {activeFilter !== "all" && (
                <button
                  onClick={() => setActiveFilter("all")}
                  className="inline-flex items-center justify-center px-5 py-2.5 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-sm font-medium"
                >
                  Show All Meetings
                  <ChevronRight size={16} className="ml-1.5" />
                </button>
              )}
            </div>
          )}
        </motion.div>
      ) : (
        // Render Meeting Links
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4"
        >
          {filteredLinks.map((meeting) => (
            <motion.div
              key={meeting.id}
              variants={item}
              className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 ${
                meeting.status === "upcoming" ? "border-l-4 border-l-blue-500" : ""
              }`}
            >
              <div className="p-5">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {meeting.title}
                      </h3>
                      {getStatusBadge(meeting.status, meeting.date)}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {meeting.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-3 mb-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded border border-gray-200 dark:border-gray-600">
                        <Calendar size={14} className="mr-1.5 text-blue-500 dark:text-blue-400" />
                        {formatDate(meeting.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded border border-gray-200 dark:border-gray-600">
                        <Clock size={14} className="mr-1.5 text-blue-500 dark:text-blue-400" />
                        {meeting.time}
                      </div>
                      <div className={`flex items-center text-sm px-3 py-1.5 rounded ${getPlatformColor(meeting.platform)}`}>
                        {getPlatformIcon(meeting.platform) ? (
                          <img 
                            src={getPlatformIcon(meeting.platform)} 
                            alt={meeting.platform} 
                            className="w-4 h-4 mr-1.5 object-contain" 
                          />
                        ) : (
                          <Video size={14} className="mr-1.5" />
                        )}
                        {meeting.platform}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <User size={14} className="mr-1.5 text-blue-500 dark:text-blue-400" />
                      Instructor: <span className="font-medium ml-1">{meeting.instructor}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {meeting.status === "upcoming" ? (
                      <>
                        <button
                          onClick={() => handleCopyLink(meeting.id, meeting.link)}
                          className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 rounded-lg transition-colors border border-blue-200 dark:border-blue-800/30"
                        >
                          {copiedId === meeting.id ? (
                            <>
                              <Check size={16} className="mr-2" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy size={16} className="mr-2" />
                              Copy Link
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleJoinMeeting(meeting.link)}
                          className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <ExternalLink size={16} className="mr-2" />
                  Join Meeting
                        </button>
                        <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center">
                          <AlertCircle size={12} className="mr-1 text-yellow-500" />
                          Join 5 minutes early
                        </div>
                      </>
                    ) : (
                      <>
                        {meeting.recording ? (
                          <button
                            onClick={() => window.open(meeting.recording, '_blank')}
                            className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                          >
                            <Video size={16} className="mr-2" />
                            Watch Recording
                          </button>
                        ) : (
                          <div className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-600">
                            <AlertCircle size={16} className="mr-2" />
                            No Recording Available
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Meeting Timeline Indicator */}
              <div className="h-1 w-full bg-gray-100 dark:bg-gray-700">
                <div 
                  className={`h-full ${meeting.status === "upcoming" ? "bg-blue-500" : "bg-gray-400 dark:bg-gray-500"}`}
                  style={{ width: meeting.status === "upcoming" ? "0%" : "100%" }}
                ></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {/* Help Section */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl overflow-hidden shadow-sm border border-blue-100 dark:border-blue-800/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <div className="hidden sm:flex bg-blue-100 dark:bg-blue-900/40 rounded p-3 mt-1">
              <AlertCircle size={20} className="text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Need Technical Help?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                If you're having trouble joining a meeting or accessing recordings, our support team is here to help.
              </p>
            </div>
          </div>
          <button
            onClick={() => window.open('mailto:support@paarshedu.com', '_blank')}
            className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <Mail size={16} className="mr-2" />
            Contact Support
          </button>
        </div>
        <div className="h-1 w-full bg-blue-100 dark:bg-blue-900/40">
          <div className="h-full bg-blue-500" style={{ width: "30%" }}></div>
          </div>
        </div>
      </div>
    );
  }

export default ViewLinks;