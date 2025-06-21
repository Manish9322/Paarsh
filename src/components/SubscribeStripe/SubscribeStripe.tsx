"use client";
import React, { useState } from 'react';
import { useSubscribeToNewsletterMutation } from "@/services/api";
import { motion, AnimatePresence } from 'framer-motion';
import { HiCheckCircle, HiXCircle, HiExclamationCircle, HiMail } from 'react-icons/hi';

const SubscribeNewsletter: React.FC = () => {
    const [email, setEmail] = useState("");
    const [subscribeToNewsletter, { isLoading, isSuccess, isError, error }] = useSubscribeToNewsletterMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'success' | 'error' | 'duplicate'>('success');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        try {
            await subscribeToNewsletter(email).unwrap();
            setModalType('success');
            setIsModalOpen(true);
            setEmail("");
        } catch (err: any) {
            if (err?.data?.error?.includes("already subscribed")) {
                setModalType('duplicate');
            } else {
                setModalType('error');
            }
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Modal animation variants
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 50 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.3 } },
    };

    return (
        <aside className="p-5 my-10 w-full h-auto flex justify-center flex-col bg-white text-center border-gray-200 shadow-md sm:p-6 xl:p-12 lg:p-8 dark:bg-gray-800 dark:border-gray-800">
            <h1 className="mb-2 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight">
                Get more updates...
            </h1>
            <p className="xl:px-48 pb-7 text-base leading-relaxed text-body-color dark:text-white">
                Do you want to get notified when new courses and resources are added to Edu Learning?
                Sign up for our newsletter and you will be among the first to find out about new features, courses, updates, and tools.
            </p>
            <form onSubmit={handleSubmit} className="flex justify-center items-end mb-3">
                <div className="flex items-center w-full max-w-md">
                    <div className="relative w-full mr-3">
                        <input
                            type="email"
                            required
                            placeholder="Your email address..."
                            className="bg-gray-50 outline-none border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-700 block w-full p-2.5 pl-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                            <HiMail className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-5 py-3 text-sm font-medium text-white bg-blue-700 rounded hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        {isLoading ? "Submitting..." : "Subscribe"}
                    </button>
                </div>
            </form>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full text-center relative overflow-hidden"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {/* Decorative gradient accent */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>

                            {modalType === 'success' && (
                                <>
                                    <HiCheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-600">
                                        Success!
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                                        You have successfully subscribed to Paarshedu newsletters. Congratulations!
                                    </p>
                                </>
                            )}

                            {modalType === 'error' && (
                                <>
                                    <HiXCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-600">
                                        Error
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                                        {(error as any)?.data?.error || "Something went wrong. Please try again."}
                                    </p>
                                </>
                            )}

                            {modalType === 'duplicate' && (
                                <>
                                    <HiExclamationCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-yellow-600">
                                        Already Subscribed
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                                        This email is already subscribed to Paarshedu newsletters.
                                    </p>
                                </>
                            )}

                            <button
                                onClick={closeModal}
                                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-600 rounded hover:from-blue-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-300"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </aside>
    );
};

export default SubscribeNewsletter;