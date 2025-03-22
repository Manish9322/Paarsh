"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Twitter, Mail } from "lucide-react";
import { fromPairs } from 'lodash';
import SubscribeNewsletter from "@/components/SubscribeStripe/SubscribeStripe"

interface Founder {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
  social: {
  
    twitter?: string;
    email?: string;
  };
}

const founders: Founder[] = [
  {
    id: 1,
    name: "Paarsh Sharma",
    role: "Chief Executive Officer",
    image: "/founders/founder1.jpg", // You'll need to add actual founder images
    bio: "With over 10 years of experience in education technology, Paarsh leads our vision to transform online learning. His passion for accessible education drives our innovation.",
    social: {
     
      twitter: "https://twitter.com/paarsh",
      email: "paarsh@example.com"
    }
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Chief Technology Officer",
    image: "/founders/founder2.jpg",
    bio: "Sarah brings 15 years of technical expertise in building scalable educational platforms. She leads our engineering team in creating innovative learning solutions.",
    social: {
     
      twitter: "https://twitter.com/sarah",
      email: "sarah@example.com"
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
          <div className="grid gap-8 md:grid-cols-2">
            {founders.map((founder, index) => (
              <motion.div
                key={founder.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card className="overflow-hidden border-none bg-gray-50 shadow-xl dark:bg-gray-700">
                  <div className="p-6">
                    <div className="flex flex-col items-center md:flex-row md:items-start">
                      <div className="mb-4 h-48 w-48 overflow-hidden rounded-full md:mb-0 md:mr-6">
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
                        <p className="mb-4 text-lg font-medium text-blue-600 dark:text-blue-400">
                          {founder.role}
                        </p>
                        <p className="mb-6 text-gray-600 dark:text-gray-300">
                          {founder.bio}
                        </p>
                        <div className="flex justify-center gap-4 md:justify-start">
                         
                          {founder.social.twitter && (
                            <a
                              href={founder.social.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 transition-colors hover:text-blue-400 dark:text-gray-400 dark:hover:text-blue-400"
                            >
                              <Twitter className="h-6 w-6" />
                            </a>
                          )}
                          {founder.social.email && (
                            <a
                              href={`mailto:${founder.social.email}`}
                              className="text-gray-600 transition-colors hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                            >
                              <Mail className="h-6 w-6" />
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