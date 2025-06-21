"use client";

import React, { useState, useEffect } from 'react';
import JobModal from '@/components/jobModal';
import JobDetailsModal from '@/components/JobDetailsModal'; // Adjust path as needed
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import SubscribeNewsletter from "@/components/SubscribeStripe/SubscribeStripe";
import Image from "next/image";
import { ArrowRight, AlertTriangle, Briefcase, Users, Globe, CheckCircle2, XCircle } from "lucide-react";
import { FaLightbulb, FaHospitalAlt, FaHome, } from "react-icons/fa";
import { FaHandshakeSimple, FaUmbrellaBeach } from "react-icons/fa6";
import { FiTarget } from "react-icons/fi";
import { IoBookSharp } from "react-icons/io5";
import Link from 'next/link';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useCreateJobApplicationMutation, useFetchJobPositionsQuery, useFetchUserQuery } from '@/services/api';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import TeamModal from '@/components/TeamModal';

interface JobListing {
  _id: string;
  position: string;
  department: string;
  location: string;
  workType: string;
  description: string;
  salaryRange: {
    min: number;
    max: number;
  };
  skillsRequired: string[];
  expiryDate: string;
  isActive: boolean;
  experienceLevel: string;
  createdAt: string;
}

const benefits = [
  {
    title: "Health & Wellness",
    description: "Comprehensive health insurance and wellness programs",
    icon: <FaHospitalAlt />
  },
  {
    title: "Remote Work",
    description: "Flexible work arrangements and remote options",
    icon: <FaHome />
  },
  {
    title: "Learning Budget",
    description: "Annual budget for professional development",
    icon: <IoBookSharp />
  },
  {
    title: "Paid Time Off",
    description: "Generous vacation and personal time policies",
    icon: <FaUmbrellaBeach />
  }
];

const companyValues = [
  {
    title: "Innovation First",
    description: "We push boundaries and embrace new technologies",
    icon: <FaLightbulb />
  },
  {
    title: "Team Excellence",
    description: "Collaboration and mutual growth drive our success",
    icon: <FaHandshakeSimple />
  },
  {
    title: "Customer Focus",
    description: "Our users' success is our success",
    icon: <FiTarget />
  },
  {
    title: "Continuous Learning",
    description: "We invest in our team's growth and development",
    icon: <IoBookSharp />
  }
];

const hiringSteps = [
  {
    step: 1,
    title: "Application Review",
    description: "We review your resume and portfolio"
  },
  {
    step: 2,
    title: "Initial Interview",
    description: "Quick chat about your experience and aspirations"
  },
  {
    step: 3,
    title: "Technical Assessment",
    description: "Show us your skills through practical tasks"
  },
  {
    step: 4,
    title: "Team Interview",
    description: "Meet your potential future teammates"
  },
  {
    step: 5,
    title: "Final Discussion",
    description: "Compensation and start date discussion"
  }
];

const faqs = [
  {
    question: "What is your interview process like?",
    answer: "Our interview process typically includes an initial screening, technical assessment, and team culture fit interviews. The entire process usually takes 2-3 days."
  },
  {
    question: "Do you offer remote work options?",
    answer: "Yes, we offer flexible work arrangements including hybrid and fully remote options for most positions."
  },
  {
    question: "What are your working hours?",
    answer: "We have flexible working hours with core collaboration hours from 9.45 AM to 6.30 PM in your local time zone."
  },
  {
    question: "What benefits do you offer?",
    answer: "We offer comprehensive health insurance, unlimited PTO, learning stipend, home office setup, and more."
  }
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior Developer",
    quote: "The growth opportunities here are incredible. I've learned more in one year than in my previous roles combined.",
    image: "/images/profile/profile.png"
  },
  {
    name: "James Wilson",
    role: "Product Manager",
    quote: "The collaborative culture and focus on innovation make this a fantastic place to work.",
    image: "/images/profile/profile.png"
  }
];

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const companyStats = [
  { label: "Open Positions", value: "15+", icon: Briefcase },
  { label: "Team Members", value: "100+", icon: Users },
  { label: "Global Offices", value: "5", icon: Globe },
];


export default function Careers() {
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isJobDetailsModalOpen, setIsJobDetailsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    desiredRole: '',
    portfolioUrl: '',
    resume: '',
    coverLetter: ''
  });

  const [_CreateJob] = useCreateJobApplicationMutation();

  const { data: jobPositionData, isLoading, error } = useFetchJobPositionsQuery(undefined);
  console.log("Job Position Data: ", jobPositionData);

  const { data: userData } = useFetchUserQuery(undefined);
  console.log("user's data on careers page : ", userData);


  console.log("Form Data  : ", formData);
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await _CreateJob(formData).unwrap();
      console.log(formData);
      console.log(response);

      // Show success dialog and reset form
      setSuccessDialogOpen(true);
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        desiredRole: '',
        portfolioUrl: '',
        resume: '',
        coverLetter: ''
      });
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error(error);
      setErrorMessage(error?.data?.message || "Failed to submit application. Please try again.");
      setErrorDialogOpen(true);
    }
  };

  // a scroll handler function
  const scrollToOpenings = () => {
    const element = document.getElementById('openPositions');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type;

      const isPDF = fileType === 'application/pdf';
      const isDOCX = fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      if (isPDF || isDOCX) {
        setSelectedFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1]; // Strip metadata
          setFormData((prevData) => ({
            ...prevData,
            resume: base64String,
          }));
          console.log("Base64 string:", base64String); // Optional for debugging
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please upload a PDF or DOCX file only');
        e.target.value = '';
      }
    }
  };

  // Add useEffect to prefill form with userData and selectedJob
  useEffect(() => {
    if (userData?.success && userData.data) {
      setFormData((prev) => ({
        ...prev,
        fullName: userData.data.name || '',
        email: userData.data.email || '',
        phoneNumber: userData.data.mobile || '',
        desiredRole: selectedJob?.position || prev.desiredRole
      }));
    } else if (selectedJob) {
      setFormData((prev) => ({
        ...prev,
        desiredRole: selectedJob.position
      }));
    }
  }, [userData, selectedJob]);

  // Add scroll handler for the application form
  const scrollToApplicationForm = () => {
    const element = document.getElementById('applicationForm');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const SkeletonCard = () => (
    <div className="relative h-full rounded overflow-hidden border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      {/* Skeleton Department Icon */}
      <div className="mb-6 inline-flex rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30">
        <div className="h-6 w-6 bg-gray-200 dark:bg-gray-600 animate-pulse rounded"></div>
      </div>

      {/* Skeleton Job Title */}
      <div className="mb-4 h-6 w-3/4 bg-gray-200 dark:bg-gray-600 animate-pulse rounded"></div>

      {/* Skeleton Tags */}
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="h-6 w-20 bg-blue-100 dark:bg-blue-900/30 animate-pulse rounded-full"></div>
        <div className="h-6 w-24 bg-green-100 dark:bg-green-900/30 animate-pulse rounded-full"></div>
        <div className="h-6 w-20 bg-purple-100 dark:bg-purple-900/30 animate-pulse rounded-full"></div>
      </div>

      {/* Skeleton Description */}
      <div className="mb-6 space-y-2">
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 animate-pulse rounded"></div>
        <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-600 animate-pulse rounded"></div>
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 animate-pulse rounded"></div>
      </div>

      {/* Skeleton Button */}
      <div className="mt-auto">
        <div className="h-12 w-full bg-blue-200 dark:bg-blue-900/30 animate-pulse rounded"></div>
      </div>
    </div>
  );

  const ErrorState = ({ error, retry }) => (
    <div className="text-center py-16">
      <div className="mb-6 inline-flex rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
        <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
        Unable to Load Job Positions
      </h3>
      <p className="mx-auto max-w-lg text-gray-600 dark:text-gray-300 mb-8">
        {error?.message || 'An unexpected error occurred. Please try again later.'}
      </p>
      <Button
        onClick={retry}
        className="group relative inline-flex items-center gap-2 rounded bg-blue-600 px-6 py-3 text-white transition-all duration-300 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Try Again
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        <div className="absolute inset-0 -translate-y-full bg-blue-700 transition-transform duration-300 group-hover:translate-y-0 dark:bg-blue-600" />
      </Button>
    </div>
  );


  // Fallback component for error or no job posts
  const JobListingsFallback = ({ isError = false, retry }: { isError?: boolean; retry?: () => void }) => {
    return (
      <div className="col-span-full text-center py-16">
        <div className="relative mx-auto max-w-2xl">
          {/* Decorative Icon */}
          <div className="mb-6 inline-flex rounded-lg bg-blue-100 p-4 dark:bg-blue-900">
            {isError ? (
              <AlertTriangle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            ) : (
              <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            )}
          </div>

          {/* Message */}
          <h3 className="mb-4 text-2xl font-bold text-black dark:text-white">
            {isError ? 'Unable to Load Job Positions' : 'No Open Positions Right Now'}
          </h3>
          <p className="mx-auto max-w-lg text-lg text-black/70 dark:text-white/70 mb-8">
            {isError
              ? 'An unexpected error occurred. Please try again later.'
              : 'We’re not hiring at the moment, but new opportunities arise frequently. Check back soon or submit a general application!'}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            {isError ? (
              <Button
                onClick={retry}
                className="group relative inline-flex items-center gap-2 rounded bg-blue-600 px-6 py-3 text-white 
              hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-300"
              >
                <span className="flex items-center gap-2">
                  Try Again
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Button>
            ) : (
              <Button
                onClick={() => {
                  const element = document.getElementById('applicationForm');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="group relative inline-flex items-center gap-2 rounded bg-blue-600 px-6 py-3 text-white 
              hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-300"
              >
                <span className="flex items-center gap-2">
                  Submit General Application
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Button>
            )}
            <Button
              variant="outline"
              className="group rounded border border-blue-500 px-6 py-3 text-blue-600 hover:bg-blue-50 
            dark:border-blue-400 dark:text-blue-400 dark:bg-gray-800 dark:hover:bg-blue-900 transition-colors duration-300"
              onClick={() => setIsComingSoonModalOpen(true)}
            >
              <span className="flex items-center gap-2">
                Notify Me of New Openings
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Button>
          </div>

          {/* Decorative Line */}
          <div className="mt-8 h-1 w-24 mx-auto bg-blue-600 rounded-lg" />
        </div>
      </div>
    );
  };



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 lg:py-20">


        <div className="container relative mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* Main Headline - Reduced size */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 mt-12 text-4xl font-bold text-gray-900 dark:text-white lg:text-5xl"
            >
              Join Our Mission to{" "}
              <span className="relative text-blue-600">
                Shape the Future
              </span>
            </motion.h1>

            {/* Subheadline - Compressed */}
            <p
              className="mx-auto mb-8 max-w-2xl text-lg text-black dark:text-gray-300"
            >
              Be part of a team thats revolutionizing education through technology.
              We are looking for passionate individuals who dare to innovate.
            </p>

            {/* CTA Buttons - Reduced padding */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8 flex flex-wrap items-center justify-center gap-3"
            >
              <Button
                onClick={scrollToOpenings}
                className="group bg-white rounded text-black dark:text-black px-6 py-4 text-base hover:bg-black-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white"
              >
                View Open Positions
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsTeamModalOpen(true)}
                className="group bg-white rounded text-black dark:text-black px-6 py-4 text-base 
     hover:bg-black-50 transition-all duration-300 shadow-lg hover:shadow-xl 
     hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white"
              >
                Meet Our Team
              </Button>

              <TeamModal
                isOpen={isTeamModalOpen}
                onClose={() => setIsTeamModalOpen(false)}
              />
            </motion.div>

            {/* Company Stats - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-6xl mx-auto px-4"
            >
              {companyStats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="relative overflow-hidden rounded
                bg-gradient-to-br from-white/80 to-white/50 dark:from-gray-800/80 dark:to-gray-800/50 
                backdrop-blur-lg p-6
                border border-gray-100/20 dark:border-gray-700/20
                shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]
                group hover:shadow-[0_8px_30px_rgb(59,130,246,0.1)] 
                dark:hover:shadow-[0_8px_30px_rgb(59,130,246,0.2)]"
                >
                  {/* Background Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 
                    dark:from-blue-500/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 
                    transition-opacity duration-500" />

                  {/* Content Container */}
                  <div className="relative flex items-center gap-6">
                    {/* Icon Container */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 blur-xl 
                         group-hover:bg-blue-500/30 dark:group-hover:bg-blue-400/30 
                         transition-all duration-300" />
                        <div className="relative p-4 rounded bg-gradient-to-br from-blue-500 to-blue-600 
                         dark:from-blue-400 dark:to-blue-500 
                         group-hover:from-blue-600 group-hover:to-blue-700 
                         dark:group-hover:from-blue-500 dark:group-hover:to-blue-600 
                         transition-all duration-300">
                          <stat.icon className="h-8 w-8 text-white transform group-hover:scale-110 
                                transition-transform duration-300" />
                        </div>
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1">
                      <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 
                       dark:from-white dark:to-gray-300 bg-clip-text text-transparent 
                       group-hover:from-blue-600 group-hover:to-blue-800 
                       dark:group-hover:from-blue-400 dark:group-hover:to-blue-200 
                       transition-all duration-300">
                        {stat.value}
                      </div>
                      <div className="mt-1 text-sm font-medium tracking-wider uppercase 
                       text-gray-600 dark:text-gray-400 
                       group-hover:text-blue-600 dark:group-hover:text-blue-400 
                       transition-colors duration-300">
                        {stat.label}
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded 
                     bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 
                     transition-all duration-500" />
                    <div className="absolute -left-4 -top-4 h-24 w-24 rounded
                     bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 
                     transition-all duration-500" />
                  </div>

                  {/* Bottom Border Gradient */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r 
                   from-blue-500/0 via-blue-500/70 to-blue-500/0 
                   transform scale-x-0 group-hover:scale-x-100 
                   transition-transform duration-500" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Company Values Section */}
      <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              Our Core Values
            </span>
            <h2 className="mb-5 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
              Guiding Principles That <br />
              <span className="text-blue-600 dark:text-blue-400">Define Our Mission</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Our beliefs shape our approach to education and drive us towards excellence in everything we do.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {companyValues.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded bg-white p-8 dark:bg-gray-800 
                     border border-gray-100 dark:border-gray-700 
                     hover:border-blue-500/30 dark:hover:border-blue-400/30"
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent 
                        dark:from-blue-900/20 dark:to-transparent opacity-0 
                        group-hover:opacity-100 transition-opacity duration-500" />

                {/* Icon Container */}
                <div className="relative mb-8" style={{ transform: `rotate(${Math.random() * 5 - 2.5}deg)` }}>
                  <div className="flex h-16 w-16 items-center justify-center rounded 
                          bg-gradient-to-br from-blue-500 to-blue-600 
                          dark:from-blue-600 dark:to-blue-700">
                    <div className="text-4xl text-white transform group-hover:scale-110 transition-transform duration-300">
                      {value.icon}
                    </div>
                  </div>
                  <div className="absolute -inset-1 rounded bg-gradient-to-br from-blue-500 to-blue-600 
                          opacity-20 blur-lg group-hover:opacity-30 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white 
                         group-hover:text-blue-600 dark:group-hover:text-blue-400 
                         transition-colors duration-300">
                    {value.title}
                  </h3>
                  <div className="mb-4 h-px w-12 bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0 
                          group-hover:w-24 transition-all duration-300" />
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed 
                       group-hover:text-gray-700 dark:group-hover:text-gray-200">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Openings Section */}
      <section id="openPositions" className="py-24 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full 
              bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              Join Our Team
            </span>
            <h2 className="mb-5 text-3xl font-bold leading-tight text-gray-900 dark:text-white 
             sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
              Open Positions at <br />
              <span className="text-blue-600 dark:text-blue-400">Every Level</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Find your next career opportunity and make an impact in the world of education technology
            </p>
          </div>


          {/* Job Listings Grid - Modified to show skeletons while loading */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              // Show 3 skeleton cards while loading
              [...Array(3)].map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <SkeletonCard />
                </motion.div>
              ))
            ) : error ? (
              // Show error fallback
              <JobListingsFallback
                isError={true}
                retry={() => {
                  // Add your retry logic here, e.g., refetch the job positions
                  // Example: refetch();
                }}
              />
            ) : jobPositionData?.data?.length > 0 ? (
              // Show actual job listings when data is available
              jobPositionData.data.slice(0, 3).map((job, index) => (
                <motion.div
                  key={job._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 
          opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20" />

                  <Card className="relative h-full rounded overflow-hidden border border-gray-100 
          bg-white p-6 shadow-lg transition-all duration-300 
          hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 
          group-hover:border-blue-500/30 dark:group-hover:border-blue-400/30">

                    {/* Department Icon */}
                    <div className="mb-6 inline-flex rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30">
                      <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>

                    {/* Job Title */}
                    <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white 
            group-hover:text-blue-600 dark:group-hover:text-blue-400 
            transition-colors duration-300">
                      {job.position}
                    </h3>

                    {/* Tags */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 
              text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {job.department}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 
              text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        {job.location}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 
              text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        {job.workType}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mb-6 text-gray-600 dark:text-gray-300 line-clamp-3">
                      {job.description}
                    </p>

                    {/* Apply Button */}
                    <div className="mt-auto">
                      <Button
                        onClick={() => {
                          setSelectedJob(job);
                          setIsJobDetailsModalOpen(true);
                        }}
                        className="group relative w-full overflow-hidden rounded bg-blue-600 
                px-6 py-3 text-white transition-all duration-300 
                hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Apply Now
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 
                  group-hover:translate-x-1" />
                        </span>
                        <div className="absolute inset-0 -translate-y-full bg-blue-700 
                transition-transform duration-300 group-hover:translate-y-0 
                dark:bg-blue-600" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <JobListingsFallback />
            )}
          </div>

          <div className="mt-12 text-center">
            <Button
              variant="outline"
              className="group rounded border-blue-500 px-8 py-4 text-blue-600 
       hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 
       dark:hover:bg-blue-900/30 dark:bg-gray-800"
              onClick={() => setIsJobModalOpen(true)}
            >
              <span className="flex items-center gap-2">
                View All {jobPositionData?.data?.length || 0} Positions
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 
                  group-hover:translate-x-1" />
              </span>
            </Button>
            {jobPositionData?.data?.length > 3 && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                +{jobPositionData.data.length - 3} more positions available
              </p>
            )}
          </div>
        </div>

        <JobModal
          isOpen={isJobModalOpen}
          onClose={() => setIsJobModalOpen(false)}
          jobs={jobPositionData?.data || []}
          onApply={(job) => {
            setSelectedJob(job);
            setIsJobDetailsModalOpen(true);
          }}
        />

        <JobDetailsModal
          isOpen={isJobDetailsModalOpen}
          onClose={() => setIsJobDetailsModalOpen(false)}
          job={selectedJob}
          onApply={scrollToApplicationForm}
        />
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full 
                    bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              Employee Benefits
            </span>
            <h2 className="mb-5 text-3xl font-bold leading-tight text-gray-900 dark:text-white 
                   sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
              Why You will Love Working <br />
              <span className="text-blue-600 dark:text-blue-400">With Us</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              We offer comprehensive benefits designed to support your growth, health, and work-life balance
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded bg-white p-8 dark:bg-gray-800 
                   border border-gray-100 dark:border-gray-700 
                   hover:border-blue-500/30 dark:hover:border-blue-400/30
                   shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent 
                       dark:from-blue-900/20 dark:to-transparent opacity-0 
                       group-hover:opacity-100 transition-opacity duration-500" />

                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className="flex h-16 w-16 mx-auto items-center justify-center rounded 
                        bg-gradient-to-br from-blue-500 to-blue-600 
                        dark:from-blue-600 dark:to-blue-700
                        transform group-hover:scale-110 group-hover:rotate-3 
                        transition-transform duration-300"
                  >
                    <div className="text-3xl text-white">
                      {benefit.icon}
                    </div>
                  </div>
                  <div className="absolute -inset-2 rounded bg-gradient-to-br from-blue-500 to-blue-600 
                        opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="relative text-center">
                  <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white 
                        group-hover:text-blue-600 dark:group-hover:text-blue-400 
                        transition-colors duration-300">
                    {benefit.title}
                  </h3>
                  <div className="mx-auto mb-4 h-px w-12 bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0 
                        group-hover:w-24 transition-all duration-300" />
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed 
                       group-hover:text-gray-700 dark:group-hover:text-gray-200">
                    {benefit.description}
                  </p>
                </div>

                {/* Hover Indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 
                       transform scale-x-0 group-hover:scale-x-100 
                       transition-transform duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recruitment Process */}
      <section className="py-12 md:py-24 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-8 md:mb-16">
            <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 mb-3 md:mb-4 text-sm font-semibold rounded-full 
              bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              Join Our Team
            </span>
            <h2 className="mb-3 md:mb-5 text-2xl font-bold leading-tight text-gray-900 dark:text-white 
             sm:text-4xl md:text-5xl">
              Our Recruitment <br />
              <span className="text-blue-600 dark:text-blue-400">Journey Together</span>
            </h2>
            <p className="mx-auto max-w-2xl text-base md:text-lg text-gray-600 dark:text-gray-300">
              A transparent and comprehensive process designed to find the perfect match
            </p>
          </div>

          {/* Timeline */}
          <div className="relative max-w-5xl mx-auto">
            {/* Center Line - Hidden on mobile */}
            <div className="hidden md:block absolute left-1/2 h-full w-1 rounded -translate-x-1/2 
              bg-gradient-to-b from-blue-500 via-blue-400 to-blue-600 
              dark:from-blue-400 dark:via-blue-500 dark:to-blue-600" />

            <div className="space-y-4 md:space-y-1">
              {hiringSteps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`flex items-center 
                    ${index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}
                    justify-center`} // Center on mobile, alternate on desktop
                >
                  <div className="relative w-full md:w-5/12 group px-4 md:px-0">
                    {/* Connection Line & Dot - Hidden on mobile */}
                    <div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 
                     bg-gradient-to-br from-blue-500 to-blue-600 rounded-full z-10 
                     shadow-lg shadow-blue-500/30 group-hover:scale-150 
                     transition-transform duration-300"
                      style={{ [index % 2 === 0 ? 'right' : 'left']: '-3rem' }}>
                      <div className="absolute inset-0 rounded-full animate-ping 
                       bg-blue-500 opacity-20" />
                    </div>

                    {/* Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="relative overflow-hidden rounded bg-white p-4 md:p-6 shadow-lg 
                   dark:bg-gray-800 border border-gray-100 dark:border-gray-700 
                   hover:border-blue-500/30 dark:hover:border-blue-400/30 
                   transition-all duration-300"
                    >
                      {/* Step Number - Modified for mobile */}
                      <div className="flex md:block items-center mb-3 md:mb-0">
                        <div className="md:absolute md:top-0 md:right-0 
                         flex items-center justify-center
                         w-8 h-8 md:w-20 md:h-20 
                         rounded-full md:rounded-none md:rounded-bl-full 
                         bg-blue-500/10 md:bg-blue-500/10">
                          <span className="text-lg md:text-2xl font-bold text-blue-500 dark:text-blue-400 
                           md:absolute md:top-4 md:right-4">
                            {step.step}
                          </span>
                        </div>

                        {/* Mobile-only title */}
                        <h3 className="md:hidden ml-3 text-lg font-bold text-gray-900 
                         dark:text-white group-hover:text-blue-600 
                         dark:group-hover:text-blue-400 transition-colors duration-300">
                          {step.title}
                        </h3>
                      </div>

                      {/* Content */}
                      <div className="relative">
                        {/* Desktop-only title */}
                        <h3 className="hidden md:block text-xl font-bold text-gray-900 
                         dark:text-white mb-3 group-hover:text-blue-600 
                         dark:group-hover:text-blue-400 transition-colors duration-300">
                          {step.title}
                        </h3>
                        <div className="h-px w-12 bg-gradient-to-r from-blue-500 to-blue-600 
                         mb-3 md:mb-4 group-hover:w-24 transition-all duration-300" />
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                          {step.description}
                        </p>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r 
                       from-blue-500 to-blue-600 transform scale-x-0 
                       group-hover:scale-x-100 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 
                       to-transparent dark:from-blue-900/20 dark:to-transparent 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="applicationForm" className="py-24 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full 
                    bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              Join Our Team
            </span>
            <h2 className="mb-5 text-3xl font-bold leading-tight text-gray-900 dark:text-white 
                   sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
              Start Your Journey <br />
              <span className="text-blue-600 dark:text-blue-400">With Us Today</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Take the first step towards an exciting career opportunity. We are excited to learn more about you.
            </p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded bg-white dark:bg-gray-800 shadow-xl"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />

            <div className="relative p-8 sm:p-12">
              <form onSubmit={handleFormSubmit} className="space-y-8">
                {/* Grid Layout for Form Fields */}
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Name Field */}
                  <div className="relative group">
                    <label className="block mb-2 text-base font-semibold text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full text-base font-semibold px-4 py-3 rounded border-2 border-gray-200 dark:border-gray-600 outline-none 
                        bg-gray-50 dark:bg-gray-700/50
                        transition-all duration-300"
                      placeholder="Enter your name here"
                    />
                    <div className="absolute -bottom-2 left-0 h-0.5 rounded w-0 bg-blue-500 
                           transition-all duration-300 group-focus-within:w-full" />
                  </div>

                  {/* Email Field */}
                  <div className="relative group">
                    <label className="block mb-2 text-base font-semibold text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 text-base font-semibold rounded border-2 border-gray-200 dark:border-gray-600 outline-none 
                        bg-gray-50 dark:bg-gray-700/50
                        transition-all duration-300"
                      placeholder="Enter your email here"
                    />
                    <div className="absolute -bottom-2 left-0 h-0.5 rounded w-0 bg-blue-500 
                           transition-all duration-300 group-focus-within:w-full" />
                  </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  {/* Phone Field */}
                  <div className="relative group">
                    <label className="block mb-2 text-base font-semibold text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-4 py-3 text-base font-semibold rounded border-2 border-gray-200 dark:border-gray-600 outline-none 
                        bg-gray-50 dark:bg-gray-700/50
                        transition-all duration-300"
                      placeholder="+91 123 456 7890"
                    />
                    <div className="absolute -bottom-2 left-0 h-0.5 rounded w-0 bg-blue-500 
                           transition-all duration-300 group-focus-within:w-full" />
                  </div>

                  {/* Role Field */}
                  <div className="relative group">
                    <label className="block mb-2 text-base font-semibold text-gray-700 dark:text-gray-300">
                      Desired Role
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.desiredRole}
                      onChange={(e) => setFormData({ ...formData, desiredRole: e.target.value })}
                      className="w-full px-4 py-3 text-base font-semibold rounded border-2 border-gray-200 dark:border-gray-600 outline-none 
                        bg-gray-50 dark:bg-gray-700/50
                        transition-all duration-300"
                      placeholder="e.g. Full Stack Developer"
                    />
                    <div className="absolute -bottom-2 left-0 h-0.5 rounded w-0 bg-blue-500 
                           transition-all duration-300 group-focus-within:w-full" />
                  </div>
                </div>

                {/* Portfolio URL Field */}
                <div className="relative group">
                  <label className="block mb-2 text-base font-semibold text-gray-700 dark:text-gray-300">
                    Portfolio/LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    className="w-full px-4 py-3 text-base font-semibold rounded border-2 border-gray-200 dark:border-gray-600 outline-none 
                        bg-gray-50 dark:bg-gray-700/50
                        transition-all duration-300"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                  <div className="absolute -bottom-2 left-0 h-0.5 rounded w-0 bg-blue-500 
                           transition-all duration-300 group-focus-within:w-full" />
                </div>

                {/* Resume Upload Field */}
                <div className="relative group">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-base font-semibold text-gray-700 dark:text-gray-300">
                      Resume
                      <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                        (PDF or DOCX)
                      </span>
                    </label>
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFormData(prev => ({ ...prev, resume: '' }));
                          // Reset the file input by creating a ref or finding it by id
                          const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                        className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 
                   dark:hover:text-red-300 flex items-center gap-1 px-2 py-1 
                   rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 
                   transition-all duration-300"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="resume-upload" // Added id for reset functionality
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <div className="w-full px-4 py-3 text-base font-semibold rounded border-2 border-dashed
                    border-gray-200 dark:border-gray-600 
                    bg-gray-50 dark:bg-gray-700/50
                    transition-all duration-300
                    group-hover:border-blue-500/50 dark:group-hover:border-blue-400/50
                    flex items-center justify-center gap-2">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {selectedFile ? (
                          <span className="truncate">
                            {selectedFile.name}
                          </span>
                        ) : (
                          <span>
                            Drop your resume here or click to browse
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* File type hint */}
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Maximum file size: 5MB
                  </p>
                  <div className="absolute -bottom-2 left-0 h-0.5 rounded w-0 bg-blue-500 
                   transition-all duration-300 group-focus-within:w-full" />
                </div>

                {/* Cover Letter Field */}
                <div className="relative group">
                  <label className="block mb-2 text-base font-semibold text-gray-700 dark:text-gray-300">
                    Cover Letter
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.coverLetter}
                    onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                    className="w-full px-4 py-3 text-base font-semibold rounded border-2 border-gray-200 dark:border-gray-600 
                      outline-none
                      bg-gray-50 dark:bg-gray-700/50 
                      
                      transition-all duration-300 resize-none"
                    placeholder="Tell us about yourself and why you'd be a great fit..."
                  />
                  <div className="absolute -bottom-2 left-0 h-0.5 rounded w-0 bg-blue-500 
                           transition-all duration-300 group-focus-within:w-full" />
                </div>

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="submit"
                    className="w-full h-1/2 bg-gradient-to-r from-blue-600 to-blue-700 
                      hover:from-blue-700 hover:to-blue-800 
                      text-white text-base font-semibold py-4 rounded
                      shadow-lg hover:shadow-xl 
                      transition-all duration-300 
                      focus:ring-4 focus:ring-blue-500/20"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Submit Application
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="max-w-md">
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Application Submitted Successfully!
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Thank you for your interest! We will review your application and get back to you soon.
            </p>
            <Button
              onClick={() => setSuccessDialogOpen(false)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent className="max-w-md">
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Submission Failed
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {errorMessage}
            </p>
            <Button
              onClick={() => setErrorDialogOpen(false)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQ Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 max-w-5xl"> {/* Increased max-width */}
          {/* Section Header */}
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 mb-3 text-sm font-semibold rounded-full 
                bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
            >
              Got Questions?
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4 text-3xl font-bold leading-tight text-gray-900 dark:text-white 
               sm:text-4xl md:text-5xl"
            >
              Frequently Asked <span className="text-blue-600 dark:text-blue-400">Questions</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300"
            >
              Find answers to common questions about careers at our company
            </motion.p>
          </div>

          {/* FAQ Cards Grid */}
          <div className="grid gap-3"> {/* Reduced gap between cards */}
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                {/* Card */}
                <button
                  className="w-full text-left"
                  onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
                >
                  <div className="relative overflow-hidden rounded-lg border border-gray-100 dark:border-gray-700
                        bg-white dark:bg-gray-800 py-4 px-6 transition-all duration-300 
                        hover:border-blue-500/30 dark:hover:border-blue-400/30
                        hover:shadow-lg hover:shadow-blue-500/5
                        group-hover:scale-[1.01]" /* Reduced padding and scale effect */
                  >
                    {/* Question Container */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3"> {/* Reduced gap */}
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full
                              bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-500 
                              transition-colors duration-300">
                          <span className="text-lg font-semibold text-blue-600 dark:text-blue-400 
                                 group-hover:text-white transition-colors duration-300">
                            Q{index + 1}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white 
                             group-hover:text-blue-600 dark:group-hover:text-blue-400 
                             transition-colors duration-300">
                          {faq.question}
                        </h3>
                      </div>
                      <div className="relative h-6 w-6 flex-shrink-0"> {/* Reduced icon size */}
                        <motion.div
                          animate={{ rotate: selectedFaq === index ? 45 : 0 }}
                          className="absolute inset-0 flex items-center justify-center text-blue-500"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </motion.div>
                      </div>
                    </div>

                    {/* Answer Container */}
                    <motion.div
                      initial={false}
                      animate={{
                        height: selectedFaq === index ? "auto" : 0,
                        opacity: selectedFaq === index ? 1 : 0,
                        marginTop: selectedFaq === index ? 12 : 0 // Reduced margin top
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="relative">
                        <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-blue-500/50 to-transparent" />
                        <p className="pl-12 text-gray-600 dark:text-gray-300 leading-relaxed text-sm"> {/* Reduced padding and text size */}
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Support Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-600 dark:text-gray-300">
              Still have questions?{" "}
              <Link
                href="/contact"
                className="font-semibold text-blue-600 hover:text-blue-700 
                   dark:text-blue-400 dark:hover:text-blue-300 
                   transition-colors duration-300">
                Contact our support team
              </Link>
            </p>

          </motion.div>
        </div>
      </section>

      {/* Team Testimonials */}
      <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Section Header */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-16"
          >
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full 
          bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
            >
              Employee Stories
            </motion.span>
            <h2 className="mb-5 text-3xl font-bold leading-tight text-gray-900 dark:text-white 
        sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
              Life at <span className="text-blue-600 dark:text-blue-400">Our Company</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Hear from our team members about their experiences and growth journey with us
            </p>
          </motion.div>

          {/* Testimonials Slider */}
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 2 }
            }}
            pagination={{
              clickable: true,
              bulletClass: `swiper-pagination-bullet !w-2 !h-2 !mx-1 !bg-blue-200 dark:!bg-blue-700`,
              bulletActiveClass: `!bg-blue-600 dark:!bg-blue-400 !w-3 !h-3`
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            className="testimonials-swiper !pb-8"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index} className="px-4 py-8">
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    scale: 1.02,
                    rotate: 1,
                    transition: { duration: 0.3 }
                  }}
                  className="relative bg-white dark:bg-gray-800 rounded-xl p-8 
              shadow-lg hover:shadow-xl
              border border-gray-100 dark:border-gray-700
              transform hover:-translate-y-1
              transition-all duration-300"
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 
              rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 
              transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 
              rounded-full bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 
              transition-colors duration-500" />

                  {/* Quote Icon */}
                  <div className="absolute -top-4 -right-4 bg-blue-100 dark:bg-blue-900/50 
              rounded-full p-3 shadow-lg">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none"
                      strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M8 11V21M8 11C8 9.89543 8 5 8 5M8 11C8 9.89543 8.89543 9 10 9H13C14.1046 9 15 9.89543 15 11V15C15 16.1046 14.1046 17 13 17H10C8.89543 17 8 16.1046 8 15V11Z" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="relative">
                    {/* Quote Text */}
                    <p className="mb-8 text-lg text-gray-600 dark:text-gray-300 italic leading-relaxed">
                      <span className="text-3xl text-blue-500/20">&quot;</span>
                      {testimonial.quote}
                      <span className="text-3xl text-blue-500/20">&quot;</span>
                    </p>

                    {/* Profile Section */}
                    <div className="flex items-center">
                      {/* Image Container */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 
                    rounded-full blur-lg opacity-30 animate-pulse" />
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={56}
                          height={56}
                          className="relative rounded-full ring-2 ring-white dark:ring-gray-800 
                      transform group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Text Info */}
                      <div className="ml-4">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white 
                    group-hover:text-blue-600 dark:group-hover:text-blue-400 
                    transition-colors duration-300">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Gradient Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r 
              from-blue-500 to-purple-500 transform scale-x-0 
              group-hover:scale-x-100 transition-transform duration-500" />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-center"
          >
            <Button
              variant="outline"
              className="group rounded border-blue-500 px-8 py-4 text-blue-600 
          hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 
          dark:hover:bg-blue-900/30"
            >
              <span className="flex items-center gap-2">
                Meet More Team Members
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </motion.div>
        </div>
      </section>

      <SubscribeNewsletter />
    </div>
  );
}