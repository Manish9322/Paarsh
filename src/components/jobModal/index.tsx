import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ArrowRight, Briefcase, MapPin, Clock, Search } from 'lucide-react';

interface JobListing {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobListing[];
}

const JobModal: React.FC<JobModalProps> = ({ isOpen, onClose, jobs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  const departments = ['All', ...new Set(jobs.map(job => job.department))];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All' || job.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Redesigned Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 z-50 overflow-hidden rounded-md bg-white/95 dark:bg-gray-800/95 
                     shadow-2xl backdrop-blur-sm md:inset-x-20 md:inset-y-10"
          >
            {/* Gradient Decorative Elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />

            {/* Content Container */}
            <div className="h-full overflow-y-auto p-6 pt-0 hide-scrollbar">

              {/* Enhanced Header */}
              <div className="sticky top-0 -mx-6 -mt-6 px-6 pt-6 pb-6 bg-white/95 dark:bg-gray-800/95 
                backdrop-blur-md shadow-md dark:shadow-gray-900/20 border-b border-gray-200/50 
                dark:border-gray-700/50 z-20">
                <div className="flex items-center justify-between mb-6">
                  <div className="relative">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                   bg-clip-text text-transparent">
                      All Open Positions
                    </h2>
                    <div className="absolute -bottom-1 left-0 w-1/3 h-1 bg-gradient-to-r from-blue-600/20 
                    to-purple-600/20 blur-sm" />
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                      Find your perfect role and join our team
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 
               transition-all duration-300 hover:rotate-90 hover:scale-105"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                {/* Enhanced Search and Filter Section */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Input */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                      <Search className="h-5 w-5 text-gray-400 transition-colors duration-300 
                       group-focus-within:text-blue-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search positions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full lg:w-fit pl-10 pr-4 py-2.5 rounded border-2 border-gray-200 
                 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80
                 focus:border-blue-500 dark:focus:border-blue-400 outline-none
                 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>

                  {/* Department Filter */}
                  <div className="relative">
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="appearance-none w-full sm:w-48 px-4 py-2.5 rounded border-2 
                 border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80
                 focus:border-blue-500 dark:focus:border-blue-400 outline-none
                 transition-all duration-300 pr-10 cursor-pointer"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}
                          className="bg-white dark:bg-gray-700">
                          {dept}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Job Listings Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className="relative h-full rounded overflow-hidden border-2 border-gray-100 
                                  bg-white/50 p-6 mt-6 backdrop-blur-sm transition-all duration-300 
                                  hover:shadow-xl dark:border-gray-700 dark:bg-gray-800/50 
                                  hover:border-blue-500/50 dark:hover:border-blue-400/50
                                  transform hover:-translate-y-1">
                      {/* Enhanced Department Icon */}
                      <div className="mb-6 inline-flex rounded bg-blue-50 p-4 
                                  dark:bg-blue-900/30 ring-4 ring-blue-50/50 dark:ring-blue-900/20">
                        <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>

                      {/* Enhanced Job Title */}
                      <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white 
                                  group-hover:text-blue-600 dark:group-hover:text-blue-400 
                                  transition-colors duration-300">
                        {job.title}
                      </h3>

                      {/* Enhanced Tags */}
                      <div className="mb-4 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 
                                     text-sm font-medium text-blue-700 dark:bg-blue-900/30 
                                     dark:text-blue-300">
                          <Briefcase className="h-4 w-4" />
                          {job.department}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 
                                     text-sm font-medium text-green-700 dark:bg-green-900/30 
                                     dark:text-green-300">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 
                                     text-sm font-medium text-purple-700 dark:bg-purple-900/30 
                                     dark:text-purple-300">
                          <Clock className="h-4 w-4" />
                          {job.type}
                        </span>
                      </div>

                      {/* Enhanced Description */}
                      <p className="mb-6 text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                        {job.description}
                      </p>

                      {/* Enhanced Apply Button */}
                      <Button className="group relative w-full overflow-hidden rounded bg-gradient-to-r 
                                     from-blue-600 to-blue-700 px-6 py-3 text-white shadow-lg 
                                     transition-all duration-300 hover:shadow-blue-500/25">
                        <span className="relative z-10 flex items-center justify-center gap-2 font-semibold">
                          Apply Now
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 
                                             group-hover:translate-x-1" />
                        </span>
                      </Button>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* No Results Message */}
              {filteredJobs.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-gray-500 dark:text-gray-400">
                    No positions found matching your criteria
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default JobModal;