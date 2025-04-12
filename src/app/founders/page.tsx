"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Twitter, Mail, Instagram, Linkedin, Facebook } from "lucide-react";
import { fromPairs } from 'lodash';
import SubscribeNewsletter from "@/components/SubscribeStripe/SubscribeStripe";
import F1 from "../../../public/images/founders/pratiksha-maam.jpg"

interface Founder {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
  social: {
    instagram?:string,
    linkedin?: string,
    facebook?: string;
  };
}

const founders: Founder[] = [
  {
    id: 1,
    name: "Pratiksha S. Baviskar",
    role: "Founder",
    image: "/images/founders/pratiksha-maam.jpg",
    bio: "Pratiksha Baviskar Ma'am, a guiding force at Paarsh Edu, inspires growth through knowledge, empowering students to believe, lead, and grow with vision and dedication.",
    social: {
      instagram: "https://instagram.com/tushar",
      linkedin: "https://linkedin.com/in/tushar",
      facebook: "https://facebook.com/tushar",
    }
  }
  ,
  {
    id: 2,
    name: "Kalpana K. Pagare",
    role: "Co-Founder",
    image:  "/images/founders/kalpana-maam2.jpeg",
    bio: "​Kalpana Pagare, Co-founder of Paarsh Edu, leads with vision and dedication, creating innovative learning spaces and inspiring students to realize their true potential and succeed.",
    social: {
      instagram: "https://instagram.com/tushar",
      linkedin: "https://linkedin.com/in/tushar",
      facebook: "https://facebook.com/tushar",

    }
  },
  {
    id: 3,
    name: "Tushar K. Pagare",
    role: "Chief Technical Officer (CTO)",
    image: "/images/founders/tushar-sir2.jpg",
    bio: "Tushar Pagare, CEO of Paarsh Infotech, inspires young minds to dream big, work hard, and innovate with passion, proving dedication turns dreams into reality.",
    social: {
     
      instagram: "https://instagram.com/tushar",
      linkedin: "https://linkedin.com/in/tushar",
      facebook: "https://facebook.com/tushar",
      
    }
  }
];

const achievements = [
  {
    title: "Students Impacted",
    value: "100K+",
    description: "Learners worldwide"
  },
  {
    title: "Course Completion Rate",
    value: "94%",
    description: "Industry-leading success"
  },
  {
    title: "Global Presence",
    value: "50+",
    description: "Countries reached"
  },
  {
    title: "Educator Network",
    value: "1000+",
    description: "Expert instructors"
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

export default function Founders() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white lg:text-5xl">
              Meet Our Founders
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Visionary leaders committed to revolutionizing education through technology and innovation.
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
          className={`px-4 mb-8 w-full md:w-full lg:w-1/2 ${
            founders.length % 2 === 1 && index === founders.length - 1
              ? "lg:mx-auto"
              : ""
          }`}
        >
          <Card className="overflow-hidden border-none bg-gray-50 shadow-two hover:shadow-one transition dark:bg-gray-700">
            <div className="p-6">
              <div className="flex flex-col items-center md:flex-row md:items-start">
                <div className="mb-4 max-h-48 w-48 overflow-hidden rounded-full md:mb-0 md:mr-6">
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
                        <Linkedin className="h-6 w-6 fill-current text-blue-600 group-hover:text-blue-600" />
                      </a>
                    )}
                    {founder.social.facebook && (
                      <a
                        href={`mailto:${founder.social.facebook}`}
                        className="text-gray-600 transition-colors hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                      >
                        <Facebook className="h-6 w-6 text-blue-600 group-hover:text-blue-600" />
                      </a>
                    )}
                    {founder.social.instagram && (
                      <a
                        href={`mailto:${founder.social.instagram}`}
                        className="text-gray-600 transition-colors hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                      >
                        <Instagram className="h-6 w-6 text-blue-600 group-hover:text-blue-600" />
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


      {/* Vision Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <h2 className="mb-12 text-3xl font-bold text-gray-900 dark:text-white">
              Our Vision & Impact
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
                >
                  <h3 className="mb-4 text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {achievement.value}
                  </h3>
                  <h4 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                    {achievement.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {achievement.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Subscribe Section */}
      <SubscribeNewsletter />
    </div>
  );
} 