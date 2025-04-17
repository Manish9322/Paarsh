"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Twitter, Mail, Instagram, Linkedin, Facebook, Youtube } from "lucide-react";
import { Target, Heart, Users, Lightbulb } from 'lucide-react';

import { RiUserCommunityLine } from "react-icons/ri";
import { HiAcademicCap } from "react-icons/hi";
import { GrInProgress } from "react-icons/gr";
import { BiNetworkChart } from "react-icons/bi";
import { PiStudentBold } from "react-icons/pi";
import { FaGlobe, FaLaptopCode, FaRegUser, FaLinkedinIn, FaFacebook, FaInstagram, FaYoutube  } from "react-icons/fa";

import { fromPairs } from 'lodash';
import SubscribeNewsletter from "@/components/SubscribeStripe/SubscribeStripe";
import Image from 'next/image';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface Founder {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
  social: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    youtube?: string;
  };
}

interface MissionValue {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const founders: Founder[] = [
  {
    id: 1,
    name: "Pratiksha S. Baviskar",
    role: "Founder",
    image: "/images/founders/pratiksha-maam.jpg",
    bio: "Pratiksha Baviskar Ma'am, a guiding force at Paarsh Edu, inspires growth through knowledge, empowering students to believe, lead, and grow with vision and dedication.",
    social: {
      instagram: "https://www.instagram.com/paarsh_edu/",
      linkedin: "https://www.linkedin.com/company/paarsh-edu/",
      facebook: "https://www.facebook.com/PaarshEDU",
      youtube: "https://www.youtube.com/@PaarshEDU"
    }
  },
  {
    id: 2,
    name: "Kalpana K. Pagare",
    role: "Co-Founder",
    image: "/images/founders/Kalpana-Maam.png",
    bio: "Kalpana Pagare, Co-founder of Paarsh Edu, leads with vision and dedication, creating innovative learning spaces and inspiring students to realize their true potential and succeed.",
    social: {
      instagram: "https://www.instagram.com/paarsh_edu/",
      linkedin: "https://www.linkedin.com/company/paarsh-edu/",
      facebook: "https://www.facebook.com/PaarshEDU",
      youtube: "https://www.youtube.com/@PaarshEDU"
    }
  },
  {
    id: 3,
    name: "Tushar K. Pagare",
    role: "Chief Technical Officer (CTO)",
    image: "/images/founders/tushar-sir2.jpg",
    bio: "Tushar Pagare, CEO of Paarsh Infotech, inspires young minds to dream big, work hard, and innovate with passion, proving dedication turns dreams into reality.",
    social: {
      instagram: "https://www.instagram.com/paarsh_edu/",
      linkedin: "https://www.linkedin.com/company/paarsh-edu/",
      facebook: "https://www.facebook.com/PaarshEDU",
      youtube: "https://www.youtube.com/@PaarshEDU"
    }
  }
];

const timeline = [
  {
    year: "2015",
    title: "Foundation",
    description: "Paarsh Edu was founded with a bold vision to revolutionize traditional education by integrating technology, creativity, and a learner-centric approach to empower students everywhere."
  },
  {
    year: "2018",
    title: "Global Expansion",
    description: "With dedication and innovation, we expanded our educational services across 20+ countries, building a diverse global community of passionate learners and educators."
  },
  {
    year: "2020",
    title: "Innovation in Learning",
    description: "Amid changing global dynamics, we launched state-of-the-art online learning platforms, providing interactive, flexible, and accessible education to learners worldwide."
  },
  {
    year: "2023",
    title: "Milestone Achieved",
    description: "We proudly celebrated impacting over 100,000 students globally, a testament to our commitment to quality education and transformative learning experiences."
  }
];

const missionValues: MissionValue[] = [
  {
    icon: <Target className="h-8 w-8" />,
    title: "Our Mission",
    description: "Empowering learners globally through accessible, innovative education for lasting life impact.",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: <Heart className="h-8 w-8" />,
    title: "Our Values",
    description: "Integrity, excellence, and inclusivity guide everything we do, fostering a community of lifelong learners.",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Our Community",
    description: "Building a diverse, supportive network of educators and students who inspire and elevate each other.",
    color: "from-green-500 to-green-600"
  },
  {
    icon: <Lightbulb className="h-8 w-8" />,
    title: "Our Innovation",
    description: "Constantly evolving our methods and technology to provide cutting-edge educational experiences.",
    color: "from-orange-500 to-orange-600"
  }
];

const achievements = [
  {
    title: "Students Impacted",
    value: "100K+",
    description: "Learners worldwide",
    icon: <PiStudentBold />
  },
  {
    title: "Course Completion Rate",
    value: "94%",
    description: "Industry-leading success",
    icon: <FaLaptopCode />
  },
  {
    title: "Global Presence",
    value: "50+",
    description: "Countries reached",
    icon: <FaGlobe />
  },
  {
    title: "Educator Network",
    value: "1000+",
    description: "Expert instructors",
    icon: <BiNetworkChart />
  }
];

const beliefs = [
  {
    title: "Empowerment Through Education",
    description: "We believe education is the key to unlocking human potential and creating a better future.",
    icon: <HiAcademicCap />
  },
  {
    title: "Innovation Drives Progress",
    description: "Embracing cutting-edge technology ensures learning is accessible and impactful.",
    icon: <RiUserCommunityLine />
  },
  {
    title: "Community Matters",
    description: "Building a global community of learners fosters collaboration and growth.",
    icon: <GrInProgress />
  }
];

const testimonials = [
  {
    quote: "Paarsh Edu transformed my career with their innovative courses and dedicated support.",
    author: "Swati Acharya",
    role: "Software Engineer",
    image: <FaRegUser />
  },
  {
    quote: "The community and resources at Paarsh Edu are unmatched. I found my true potential here.",
    author: "Jagdish Kumar",
    role: "Product Manager",
    image: <FaRegUser />
  },
  {
    quote: "Learning with Paarsh Edu was a game-changer. Their approach is truly inspiring.",
    author: "Anita Pawar",
    role: "Sr. Professor",
    image: <FaRegUser />
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } }
};

export default function Founders() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-10 lg:pt-24 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-600">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <h1 className="mb-6 text-4xl font-bold text-black dark:text-white lg:text-5xl">
              Meet Our Visionary Founders
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg  text-black dark:text-white">
              Leaders dedicated to transforming education through innovation, passion, and a commitment to excellence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center -mx-4">
            {founders.map((founder, index) => (
              <motion.div
                key={founder.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className={`px-4 mb-8 w-full md:w-full lg:w-1/2 ${founders.length % 2 === 1 && index === founders.length - 1
                  ? "lg:mx-auto"
                  : ""
                  }`}
              >
                <Card className="overflow-hidden border-none bg-gray-50 shadow-two hover:shadow-one transition dark:bg-gray-700">
                  <div className="p-8">
                    <div className="flex flex-col items-center md:flex-row md:items-start">
                      <div className="mb-4 max-h-48 w-48 overflow-hidden rounded-full md:mb-0 md:mr-6 ring-4 ring-blue-500 dark:ring-white transition-transform duration-500 transform hover:scale-105">
                        <img
                          src={founder.image}
                          alt={founder.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                          {founder.name}
                        </h3>
                        <p className="mb-2 text-lg font-medium text-blue-600 dark:text-blue-400">
                          {founder.role}
                        </p>
                        <p className="mb-6 text-gray-600 dark:text-gray-300">
                          {founder.bio}
                        </p>
                        <div className="flex justify-center gap-4 md:justify-start">
                          {founder.social.linkedin && (
                            <a
                              href={founder.social.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 transition-colors hover:text-blue-400 dark:text-gray-400 dark:hover:text-blue-400"
                            >
                              <FaLinkedinIn className="h-6 w-6 fill-current text-blue-600 group-hover:text-blue-600" />
                            </a>
                          )}
                          {founder.social.facebook && (
                            <a
                              href={founder.social.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                            >
                              <FaFacebook className="h-6 w-6 text-blue-600 group-hover:text-blue-600" />
                            </a>
                          )}
                          {founder.social.youtube && (
                            <a
                              href={founder.social.youtube}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 transition-colors hover:text-pink-500 dark:text-gray-400 dark:hover:text-pink-400"
                            >
                              < FaYoutube className="h-6 w-6 text-blue-600 group-hover:text-blue-600" />
                            </a>
                          )}
                          {founder.social.instagram && (
                            <a
                              href={founder.social.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 transition-colors hover:text-pink-500 dark:text-gray-400 dark:hover:text-pink-400"
                            >
                              < FaInstagram className="h-6 w-6 text-blue-600 group-hover:text-blue-600" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <div className="w-full mx-auto text-center pt-10 mb-14" style={{ maxWidth: "570px" }}>
              <motion.span
                className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full 
                         bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
                whileHover={{ scale: 1.05 }}
              >
                Our Story
              </motion.span>
              <h2 className="mb-5 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
                The Making of <br />
                <span className="text-blue-600 dark:text-blue-400">Paarsh Edu</span>
              </h2>

              <p className="text-base !leading-relaxed text-body-color md:text-lg">
                Our story reflects passion, purpose, and growth—built on dreams, dedication, and meaningful connections we cherish.
              </p>
            </div>
          </motion.div>

          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ clickable: true }}
            navigation
            autoplay={{ delay: 5000 }}
            className="mySwiper"
          >
            {timeline.map((event, index) => (
              <SwiperSlide key={index}>
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                  className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 
                             min-h-[300px] rounded-xl shadow-xl p-8 text-center relative 
                             border border-transparent hover:border-blue-500/20 overflow-hidden
                             transform transition-all duration-300"
                >
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-500/5 rounded-full -ml-10 -mb-10" />

                  {/* Year badge */}
                  <div className="relative inline-block mb-6">
                    <motion.div
                      className="bg-blue-100 dark:bg-blue-900/50 rounded-md px-6 py-2"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <h3 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 
                                     dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        {event.year}
                      </h3>
                    </motion.div>
                  </div>

                  {/* Title with animation */}
                  <motion.h4
                    className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    {event.title}
                  </motion.h4>

                  {/* Separator line */}
                  <div className="h-px w-16 mx-auto mb-4 bg-gradient-to-r from-transparent 
                                  via-blue-500 to-transparent opacity-50" />

                  {/* Description with better typography */}
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed 
                                text-lg max-w-2xl mx-auto">
                    {event.description}
                  </p>

                  {/* Bottom indicator */}
                  <motion.div
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                  </motion.div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Our Beliefs Section */}
      <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-16"
          >
            <motion.span
              className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full 
                         bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
              whileHover={{ scale: 1.05 }}
            >
              Our Core Values
            </motion.span>
            <h2 className="mb-5 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
              Guiding Principles That <br />
              <span className="text-blue-600 dark:text-blue-400">Define Our Mission</span>
            </h2>

            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Our beliefs shape our approach to education and drive us towards excellence in everything we do.
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {beliefs.map((belief, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                className="group relative overflow-hidden rounded-md bg-white p-8 
                           dark:bg-gray-800 border border-gray-100 dark:border-gray-700
                           hover:border-blue-500/30 dark:hover:border-blue-400/30"
              >
                {/* Decorative Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent 
                               dark:from-blue-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 
                               transition-opacity duration-500" />

                {/* Icon Container */}
                <motion.div
                  className="relative mb-8"
                  whileHover={{ rotate: [0, -10, 10, -5, 5, 0], scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-md 
                                bg-gradient-to-br from-blue-500 to-blue-600 
                                dark:from-blue-600 dark:to-blue-700">
                    <div className="text-4xl text-white transform group-hover:scale-110 transition-transform duration-300">
                      {belief.icon}
                    </div>
                  </div>
                  <div className="absolute -inset-1 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 
                                opacity-20 blur-lg group-hover:opacity-30 transition-opacity duration-300" />
                </motion.div>

                {/* Content */}
                <div className="relative">
                  <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white 
                               group-hover:text-blue-600 dark:group-hover:text-blue-400 
                               transition-colors duration-300">
                    {belief.title}
                  </h3>

                  <div className="mb-4 h-px w-12 bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0 
                                group-hover:w-24 transition-all duration-300" />

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed 
                              group-hover:text-gray-700 dark:group-hover:text-gray-200">
                    {belief.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Mission & Values Section */}
      <section className="py-32 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 
                    dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-500/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-20"
          >
            <motion.span
              className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full 
                         bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
              whileHover={{ scale: 1.05 }}
            >
              Mission & Values
            </motion.span>
            <h2 className="mb-5 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
              What Drives Us <br />
              <span className="text-blue-600 dark:text-blue-400">Forward</span>
            </h2>

            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Our mission and values form the foundation of everything we do at Paarsh Edu
            </p>
          </motion.div>

          {/* New hexagonal grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {missionValues.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative group"
              >
                {/* Card Container with 3D effect */}
                <div className="relative transform transition-all duration-500 
                       hover:translate-y-[-10px] hover:rotate-[2deg]">
                  {/* Glowing background effect */}
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r opacity-0 
                         group-hover:opacity-100 blur-xl transition-all duration-500"
                    style={{
                      background: `radial-gradient(circle at center, ${item.color}, transparent 70%)`
                    }} />

                  {/* Main card content */}
                  <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
                         rounded-md p-8 shadow-xl border border-gray-200/50 
                         dark:border-gray-700/50 overflow-hidden">
                    {/* Floating icon with enhanced animation */}
                    <motion.div
                      whileHover={{
                        rotate: [0, -10, 10, -5, 5, 0],
                        scale: 1.2,
                        transition: { duration: 0.5 }
                      }}
                      className={`relative -mt-12 mb-6 mx-auto w-20 h-20 rounded-xl 
                         ${item.color} shadow-lg transform-gpu group-hover:shadow-2xl
                         before:absolute before:inset-0 before:bg-white/20 
                         before:rounded-xl before:opacity-0 before:group-hover:opacity-100
                         before:transition-opacity before:duration-300`}
                    >
                      <div className="mt-3 absolute inset-0 flex items-center justify-center text-blue-600 dark:text-white text-3xl">
                        {item.icon}
                      </div>
                      {/* Animated ring */}
                      <div className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-70
                           bg-gradient-to-r from-transparent via-white to-transparent
                           blur-sm group-hover:animate-pulse" />
                    </motion.div>

                    {/* Content with enhanced typography and animations */}
                    <div className="relative z-10 text-center">
                      <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent 
                           bg-gradient-to-b from-gray-900 to-gray-600 
                           dark:from-white dark:to-gray-300
                           group-hover:from-blue-600 group-hover:to-blue-400
                           transition-colors duration-300">
                        {item.title}
                      </h3>

                      {/* Animated separator */}
                      <div className="h-0.5 w-12 mx-auto mb-4 rounded-full
                           bg-gradient-to-r from-transparent via-blue-500 to-transparent
                           group-hover:w-24 group-hover:h-1 transition-all duration-300" />

                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed
                           group-hover:text-gray-900 dark:group-hover:text-white
                           transition-colors duration-300">
                        {item.description}
                      </p>
                    </div>

                    {/* Interactive particle effects */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute bottom-0 left-0 right-0 h-32
                           bg-gradient-to-t from-white/5 to-transparent
                           dark:from-gray-800/5 opacity-0 group-hover:opacity-100
                           transition-opacity duration-500" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Vision & Impact Section (Redesigned) */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-900 to-blue-600">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.1),transparent_50%)]" />
          <div className="absolute w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(30,58,138,0.1),transparent_50%)]" />
        </div>


        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >

          <motion.span
            className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full 
                         bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
            whileHover={{ scale: 1.05 }}
          >
            Our Impacts
          </motion.span>

          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-200 via-indigo-100 to-purple-200 
                     bg-clip-text text-transparent mb-6">
            Our Vision & Global Impact
          </h2>
          <p className="text-lg text-blue-100/80">
            Transforming education across borders, creating lasting impact in communities worldwide
          </p>
        </motion.div>

        {/* Stats Display */}
        <div className="relative">

          <div className="grid lg:grid-cols-4 lg:gap-2 sm:gap-12 relative">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className="relative text-center group">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="inline-flex items-center justify-center mb-6"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 
                                rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                      <div className="relative bg-blue-900/50 backdrop-blur-sm p-4 rounded-xl 
                                border border-blue-500/20">
                        <span className="text-4xl text-blue-100">
                          {achievement.icon}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Value Counter */}
                  <motion.div
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    className="mb-2"
                  >
                    <span className="text-5xl font-bold bg-gradient-to-r from-blue-200 via-indigo-200 
                                to-purple-200 bg-clip-text text-transparent">
                      {achievement.value}
                    </span>
                  </motion.div>

                  {/* Title */}
                  <h4 className="text-xl font-semibold text-blue-100">
                    {achievement.title}
                  </h4>

                  {/* Description */}
                  <p className="text-blue-200/70 text-sm leading-relaxed mb-3">
                    {achievement.description}
                  </p>

                  {/* Hover effect line */}
                  <div className="h-0.5 w-0 mx-auto bg-gradient-to-r from-blue-500 via-blue-900 to-blue-500
                            transition-all duration-300 group-hover:w-1/2" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-16"
          >
            <motion.span
            className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full 
                         bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
            whileHover={{ scale: 1.05 }}
          >
            Our Impacts
          </motion.span>

          <h2 className="mb-5 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
            What our 
            <span className="text-blue-600 dark:text-blue-400"> Students </span> say
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
          Discover how our students learning experiences have empowered them to grow, achieve, and inspire others.</p>

          </motion.div>
          <Swiper
      modules={[Autoplay, Pagination]}
      spaceBetween={30}
      slidesPerView={1}
      breakpoints={{
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      }}
      pagination={{
        clickable: true,
        bulletClass: `swiper-pagination-bullet !w-2 !h-2 !mx-1 !bg-blue-200 dark:!bg-blue-700`,
        bulletActiveClass: `!bg-blue-600 dark:!bg-blue-400 !w-3 !h-3`
      }}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      className="testimonials-swiper !pb-16"
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
            className="relative bg-white dark:bg-gray-800 rounded-md p-8 
                       shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] 
                       dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)]
                       border border-gray-100 dark:border-gray-700
                       backdrop-blur-sm"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br 
                          from-blue-500/10 to-purple-500/10 rounded-tl-md rounded-br-md -z-10" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl 
                          from-blue-500/10 to-purple-500/10 rounded-br-md rounded-tl -z-10" />

            {/* Quote Icon */}
            <div className="absolute -top-4 -right-4 bg-blue-100 dark:bg-blue-900/50 
                          rounded-full p-3 shadow-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" 
                   strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                   viewBox="0 0 24 24" stroke="currentColor">
                <path d="M8 11V21M8 11C8 9.89543 8 5 8 5M8 11C8 9.89543 8.89543 9 10 9H13C14.1046 9 15 9.89543 15 11V15C15 16.1046 14.1046 17 13 17H10C8.89543 17 8 16.1046 8 15V11Z" />
              </svg>
            </div>

            {/* Profile Image */}
            <div className="relative mb-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 
                              rounded-full blur-lg opacity-30 animate-pulse" />
                <div className="text-4xl text-white transform group-hover:scale-110 transition-transform duration-300">
                      {testimonial.image}
                    </div>
              </div>
            </div>

            {/* Quote Text */}
            <p className="mb-6 text-gray-600 dark:text-gray-300 italic leading-relaxed 
                       text-lg relative">
              <span className="text-3xl text-blue-500/20">&quot;</span>
              {testimonial.quote}
              <span className="text-3xl text-blue-500/20">&quot;</span>
            </p>

            {/* Author Info */}
            <div className="relative">
              <div className="h-px w-12 bg-gradient-to-r from-blue-500 to-purple-500 
                            mb-4 mx-auto opacity-50" />
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {testimonial.author}
              </h4>
              <p className="text-blue-600 dark:text-blue-400 font-medium">
                {testimonial.role}
              </p>
            </div>
          </motion.div>
        </SwiperSlide>
      ))}
    </Swiper>
        </div>
      </section>

      

      {/* Subscribe Section */}
      <SubscribeNewsletter />
    </div>
  );
}