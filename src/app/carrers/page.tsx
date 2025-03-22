"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import SubscribeNewsletter from "@/components/SubscribeStripe/SubscribeStripe"
interface JobListing {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

const jobListings: JobListing[] = [
  {
    id: 1,
    title: "Senior Full Stack Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "We&apos;re looking for an experienced Full Stack Developer to join our growing team..."
  },
  {
    id: 2,
    title: "UX/UI Designer",
    department: "Design",
    location: "Hybrid",
    type: "Full-time",
    description: "Join our creative team as a UX/UI Designer and help shape the future of our products..."
  },
  {
    id: 3,
    title: "Product Manager",
    department: "Product",
    location: "On-site",
    type: "Full-time",
    description: "We&apos;re seeking a Product Manager to drive our product strategy and execution..."
  }
];

const benefits = [
  {
    title: "Health & Wellness",
    description: "Comprehensive health insurance and wellness programs",
    icon: "🏥"
  },
  {
    title: "Remote Work",
    description: "Flexible work arrangements and remote options",
    icon: "🏠"
  },
  {
    title: "Learning Budget",
    description: "Annual budget for professional development",
    icon: "📚"
  },
  {
    title: "Paid Time Off",
    description: "Generous vacation and personal time policies",
    icon: "⛱️"
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

export default function Careers() {
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
              Join Our Team
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Be part of a team that&apos;s shaping the future of education. We&apos;re always looking for talented individuals who share our passion for innovation and learning.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Current Openings Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-3xl font-bold text-gray-900 dark:text-white">
            Current Openings
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobListings.map((job, index) => (
              <motion.div
                key={job.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full overflow-hidden border-none bg-gray-50 shadow-lg transition-transform duration-300 hover:scale-105 dark:bg-gray-700">
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      {job.title}
                    </h3>
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {job.department}
                      </span>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-900 dark:text-green-200">
                        {job.location}
                      </span>
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {job.type}
                      </span>
                    </div>
                    <p className="mb-4 text-gray-600 dark:text-gray-300">
                      {job.description}
                    </p>
                    <Button className="w-full">Apply Now</Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-3xl font-bold text-center text-gray-900 dark:text-white">
            Why Join Us?
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mb-4 text-4xl">{benefit.icon}</div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <SubscribeNewsletter />
    </div>
  );
}