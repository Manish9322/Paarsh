import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, Briefcase, MapPin, Clock, DollarSign, Calendar, User, ArrowRight } from 'lucide-react';

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

interface JobDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: JobListing | null;
    onApply: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ isOpen, onClose, job, onApply }) => {
    if (!job) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 z-50 overflow-hidden rounded-md bg-white/95 dark:bg-gray-800/95 
                     shadow-2xl backdrop-blur-sm md:inset-x-10 md:inset-y-10 max-w-4xl mx-auto"
                    >
                        {/* Gradient Decorative Elements */}
                        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />

                        {/* Content Container */}
                        <div className="h-full overflow-y-auto p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                             bg-clip-text text-transparent">
                                    {job.position}
                                </h2>
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

                            {/* Job Meta Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <span className="text-gray-600 dark:text-gray-300">{job.department}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <span className="text-gray-600 dark:text-gray-300">{job.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <span className="text-gray-600 dark:text-gray-300">{job.workType}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <span className="text-gray-600 dark:text-gray-300">{job.experienceLevel}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <span className="text-gray-600 dark:text-gray-300">
                                        ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <span className="text-gray-600 dark:text-gray-300">
                                        Apply by {new Date(job.expiryDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Job Description</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{job.description}</p>
                            </div>

                            {/* Skills Required */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Skills Required</h3>
                                <div className="flex flex-wrap gap-2">
                                    {job.skillsRequired.map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 
                               text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Apply Button */}
                            <div className="flex justify-end">
                                <Button
                                    onClick={() => {
                                        onApply();
                                        onClose();
                                    }}
                                    className="group relative overflow-hidden rounded bg-gradient-to-r from-blue-600 to-blue-700 
             px-6 py-3 text-white shadow-lg transition-all duration-300 hover:shadow-blue-500/25"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2 font-semibold">
                                        Apply Now
                                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default JobDetailsModal;
