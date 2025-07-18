"use client";

import { useCallback, useState } from "react";
import { Menu, ChevronLeft, ChevronRight, Eye, Trash2, MessageCircle, Star, RefreshCw, MessageSquarePlus } from "lucide-react";
import { RxCross2, RxChatBubble  } from "react-icons/rx";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    useFetchFeedbacksQuery,
    useSubmitFeedbackMutation,
    useDeleteFeedbackMutation,
    useFetchUserQuery,
} from "@/services/api";
import Sidebar from "@/components/Sidebar/Sidebar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const FeedbackManagement = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
    const [newFeedback, setNewFeedback] = useState({
        feedbackText: "",
        rating: 0,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [feedbacksPerPage, setFeedbacksPerPage] = useState<number | "all">(10);
    const [activeFilters, setActiveFilters] = useState({
        rating: "",
        date: "",
    });

    // Fetch current user details
    const { data: userData, isLoading: isLoadingUser, error: userError } = useFetchUserQuery(undefined);
    const { data: feedbacksData, isLoading, error, refetch } = useFetchFeedbacksQuery(undefined);
    const [submitFeedback, { isLoading: isSubmitting }] = useSubmitFeedbackMutation();
    const [deleteFeedback, { isLoading: isDeleting }] = useDeleteFeedbackMutation();

    const feedbacks = feedbacksData?.data || [];

    // Cache for user details to avoid redundant queries
    const userCache = new Map();

    const getUserDetails = useCallback(
        (userId: string) => {
            if (!userId) return null;
            if (userCache.has(userId)) return userCache.get(userId);

            // Since feedback data is populated with user details, no need to fetch separately
            return null;
        },
        []
    );

    const handleSubmitFeedback = async () => {
        if (!userData?.data?._id) {
            toast.error("❌ User not authenticated");
            return;
        }

        try {
            const feedbackPayload = {
                ...newFeedback,
                userId: userData.data._id, // Use the fetched user ID
            };
            const response = await submitFeedback(feedbackPayload).unwrap();
            if (response?.success) {
                toast.success("✅ Feedback submitted successfully!");
                setFeedbackModalOpen(false);
                setNewFeedback({ feedbackText: "", rating: 0 });
                refetch();
            } else {
                toast.error("❌ Failed to submit feedback");
            }
        } catch (err: any) {
            toast.error(err?.data?.error || "❌ An unexpected error occurred");
        }
    };

    const handleDeleteFeedback = async (feedbackId: string) => {
        try {
            const response = await deleteFeedback(feedbackId).unwrap();
            if (response?.success) {
                toast.success("✅ Feedback deleted successfully!");
                refetch();
            } else {
                toast.error("❌ Failed to delete feedback");
            }
        } catch (err: any) {
            toast.error(err?.data?.error || "❌ An unexpected error occurred");
        }
    };

    const filteredFeedbacks = feedbacks.filter((feedback: any) => {
        const searchFields = [
            feedback.userId?.name || "N/A",
            feedback.feedbackText,
            feedback.rating?.toString(),
        ];

        const matchesSearch = searchFields.some((field) =>
            field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (!matchesSearch) return false;

        if (activeFilters.rating && feedback.rating !== parseInt(activeFilters.rating)) {
            return false;
        }

        if (activeFilters.date) {
            const feedbackDate = new Date(feedback.createdAt).toISOString().split("T")[0];
            if (feedbackDate !== activeFilters.date) {
                return false;
            }
        }

        return true;
    });

    const totalPages = feedbacksPerPage === "all" ? 1 : Math.ceil(filteredFeedbacks.length / feedbacksPerPage);
    const startIndex = feedbacksPerPage === "all" ? 0 : (currentPage - 1) * feedbacksPerPage;
    const displayedFeedbacks = feedbacksPerPage === "all"
        ? filteredFeedbacks
        : filteredFeedbacks.slice(startIndex, startIndex + feedbacksPerPage);

    const handleFilterChange = (newFilters: any) => {
        setActiveFilters(newFilters);
        setCurrentPage(1);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const generatePaginationNumbers = () => {
        const pageNumbers: (number | string)[] = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
            }
            if (currentPage >= totalPages - 2) {
                startPage = Math.max(2, totalPages - maxPagesToShow + 2);
            }

            if (startPage > 2) pageNumbers.push("...");
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
            if (endPage < totalPages - 1) pageNumbers.push("...");
            if (totalPages > 1) pageNumbers.push(totalPages);
        }
        return pageNumbers;
    };

    // Handle user loading and error states
    if (isLoadingUser) return <div>Loading user profile...</div>;
    if (userError) return <div>Error: User not authenticated. Please log in.</div>;
    if (isLoading) return <div>Loading feedbacks...</div>;
    if (error) return <div>Error: {error.toString()}</div>;

    const handleRefresh = () => {
        refetch();
        toast.success("Table refreshed", {
            description: "Latest visitor data has been fetched.",
            duration: 3000,
        });
    };

    return (
        <div className="flex min-h-screen">
            {/* Mobile Header */}
            <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                    aria-label="Toggle sidebar"
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-lg font-bold text-gray-800">Feedback Management</h1>
                <div className="w-10"></div>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-full flex-col">
                    <div className="flex h-16 items-center justify-between px-4 md:justify-end">
                        <h1 className="text-xl font-bold md:hidden">Dashboard</h1>
                    </div>
                    <div className="custom-scrollbar flex-1 overflow-y-auto">
                        <Sidebar userRole="admin" />
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                ></div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-16 md:ml-64">
                <div className="container mx-auto px-4 py-6">
                    <Card className="mb-6 overflow-hidden border-none bg-white shadow-md dark:bg-gray-900">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
                            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                                    Feedback Management
                                </CardTitle>
                                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                                    <Input
                                        type="text"
                                        placeholder="Search feedbacks..."
                                        className="h-10 w-full rounded border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 md:w-64"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Button
                                        onClick={handleRefresh}
                                        disabled={isLoading}
                                        className="h-10 w-10 rounded-full bg-white/90 p-0 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-600"
                                        aria-label="Refresh visitor data"
                                    >
                                        <RefreshCw
                                            size={20}
                                            className={isLoading ? "animate-spin" : ""}
                                        />
                                    </Button>
                                    <Button
                                        onClick={() => setFeedbackModalOpen(true)}
                                        className="bg-white text-black hover:bg-white/90 rounded flex items-center gap-2"
                                        title="Add Feedback"
                                    >
                                        <MessageSquarePlus className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-4">
                            {/* Summary Cards */}
                            <div className="mb-6 grid gap-4 md:grid-cols-3">
                                {/* Total Feedbacks Card */}
                                <div className="overflow-hidden rounded bg-white shadow transition-all hover:shadow-md dark:bg-gray-800">
                                    <div className="p-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                                    <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Total Feedbacks
                                                </h3>
                                                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                                                    {feedbacks.length.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Average Rating Card */}
                                <div className="overflow-hidden rounded bg-white shadow transition-all hover:shadow-md dark:bg-gray-800">
                                    <div className="p-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                                    <Star className="h-6 w-6 text-blue-600 dark:text-blue-400" />

                                                </div>
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Average Rating
                                                </h3>
                                                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                                                    {feedbacks.length > 0
                                                        ? (
                                                            feedbacks.reduce((sum, fb) => sum + fb.rating, 0) /
                                                            feedbacks.length
                                                        ).toFixed(1)
                                                        : "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* High Ratings Card */}
                                <div className="overflow-hidden rounded bg-white shadow transition-all hover:shadow-md dark:bg-gray-800">
                                    <div className="p-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                                    <svg
                                                        className="h-6 w-6 text-blue-600 dark:text-blue-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    High Ratings (4-5)
                                                </h3>
                                                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                                                    {feedbacks
                                                        .filter((fb) => fb.rating >= 4)
                                                        .length.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="mb-6 grid gap-4 md:grid-cols-4">
                                <div>
                                    <select
                                        className="text-md w-full rounded border p-2 dark:bg-gray-800"
                                        value={activeFilters.rating}
                                        onChange={(e) =>
                                            handleFilterChange({
                                                ...activeFilters,
                                                rating: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">All Ratings</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                                <div>
                                    <Input
                                        type="date"
                                        value={activeFilters.date}
                                        onChange={(e) =>
                                            handleFilterChange({
                                                ...activeFilters,
                                                date: e.target.value,
                                            })
                                        }
                                        className="w-full dark:bg-gray-800 dark:text-white rounded"
                                    />
                                </div>
                                <div></div>
                                <div></div>
                            </div>

                            {/* Table */}
                            <div className="no-scrollbar overflow-x-auto">
                                <Table className="w-full text-black dark:text-white">
                                    <TableHeader>
                                        <TableRow className="border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                                            <TableHead className="hidden py-3 text-center sm:table-cell">
                                                #
                                            </TableHead>
                                            <TableHead className="py-3">User Name</TableHead>
                                            <TableHead className="hidden py-3 sm:table-cell">
                                                Course
                                            </TableHead>
                                            <TableHead className="hidden py-3 sm:table-cell">
                                                Feedback
                                            </TableHead>
                                            <TableHead className="py-3">Rating</TableHead>
                                            <TableHead className="hidden py-3 md:table-cell">
                                                Date
                                            </TableHead>
                                            <TableHead className="py-3 text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {displayedFeedbacks.length > 0 ? (
                                            displayedFeedbacks.map((feedback: any, index: number) => (
                                                <TableRow
                                                    key={feedback._id}
                                                    className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-800"
                                                >
                                                    <TableCell className="hidden text-center font-medium sm:table-cell">
                                                        {startIndex + index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="sm:block">
                                                            <p className="font-medium">
                                                                {feedback.userId?.name || "N/A"}
                                                            </p>
                                                            <p className="text-xs text-gray-500 sm:hidden">
                                                                {feedback.courseId?.courseName || "N/A"}
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-500 sm:hidden">
                                                                {feedback.feedbackText.length > 50
                                                                    ? `${feedback.feedbackText.substring(0, 50)}...`
                                                                    : feedback.feedbackText}
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-500 sm:hidden">
                                                                {feedback.rating}/5
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {feedback.courseId?.courseName || "N/A"}
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell">
                                                        {feedback.feedbackText.length > 50
                                                            ? `${feedback.feedbackText.substring(0, 50)}...`
                                                            : feedback.feedbackText}
                                                    </TableCell>
                                                    <TableCell>{feedback.rating}/5</TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {formatDate(feedback.createdAt)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                                                onClick={() => {
                                                                    setSelectedFeedback(feedback);
                                                                    setPreviewModalOpen(true);
                                                                }}
                                                                aria-label="View feedback details"
                                                            >
                                                                <Eye
                                                                    size={16}
                                                                    className="transition-transform group-hover:scale-110"
                                                                />
                                                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                                                    View details
                                                                </span>
                                                            </button>
                                                            <button
                                                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                                                onClick={() => handleDeleteFeedback(feedback._id)}
                                                                aria-label="Delete feedback"
                                                                disabled={isDeleting}
                                                            >
                                                                <Trash2
                                                                    size={16}
                                                                    className="transition-transform group-hover:scale-110"
                                                                />
                                                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                                                    Delete
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-32 text-center">
                                                    <div className="flex flex-col items-center justify-center space-y-2">
                                                        <div className="text-gray-400 dark:text-gray-500">
                                                            <MessageCircle className="mx-auto h-12 w-12" />
                                                        </div>
                                                        <div className="text-gray-500 dark:text-gray-400">
                                                            <p className="text-base font-medium">
                                                                No feedback found
                                                            </p>
                                                            <p className="text-sm">
                                                                {searchTerm || Object.values(activeFilters).some(Boolean)
                                                                    ? "Try adjusting your search or filter criteria"
                                                                    : "No feedback available"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Feedback Submission Modal */}
                    <Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
                        <DialogContent className="no-scrollbar max-h-[90vh] max-w-md overflow-y-auto rounded-md bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
                            <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                                        Submit Feedback
                                    </DialogTitle>
                                    <RxCross2
                                        className="text-gray-800 dark:text-white"
                                        size={20}
                                        onClick={() => setFeedbackModalOpen(false)}
                                    />
                                </div>
                            </DialogHeader>
                            <div className="space-y-4 p-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Feedback
                                    </label>
                                    <Textarea
                                        placeholder="Enter your feedback"
                                        value={newFeedback.feedbackText}
                                        onChange={(e) =>
                                            setNewFeedback({ ...newFeedback, feedbackText: e.target.value })
                                        }
                                        className="mt-1 dark:bg-gray-800 dark:text-white"
                                        rows={4}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Rating
                                    </label>
                                    <div className="mt-2 flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={24}
                                                className={`cursor-pointer transition-colors ${star <= newFeedback.rating
                                                    ? "fill-blue-500 text-blue-500"
                                                    : "text-gray-300 dark:text-gray-600"
                                                    }`}
                                                onClick={() =>
                                                    setNewFeedback({ ...newFeedback, rating: star })
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                                <Button
                                    onClick={handleSubmitFeedback}
                                    disabled={
                                        isSubmitting ||
                                        !newFeedback.feedbackText ||
                                        newFeedback.rating === 0 ||
                                        !userData?.data?._id
                                    }
                                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Feedback Preview Modal */}
                    <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
                        <DialogContent className="no-scrollbar max-h-[90vh] max-w-md overflow-y-auto rounded-md bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
                            <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                                        Feedback Details
                                    </DialogTitle>
                                    <RxCross2
                                        className="text-gray-800 dark:text-white"
                                        size={20}
                                        onClick={() => setPreviewModalOpen(false)}
                                    />
                                </div>
                            </DialogHeader>
                            {selectedFeedback ? (
                                <div className="space-y-6 p-6">
                                    <div className="overflow-hidden rounded-md border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                                            <h3 className="font-medium text-blue-800 dark:text-blue-300">
                                                Feedback Information
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                            <div className="grid grid-cols-3 px-4 py-3">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    User Name
                                                </span>
                                                <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                                                    {selectedFeedback.userId?.name || "N/A"}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 px-4 py-3">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Email
                                                </span>
                                                <span className="col-span-2 break-all text-sm text-gray-900 dark:text-gray-200">
                                                    {selectedFeedback.userId?.email || "N/A"}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 px-4 py-3">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Feedback
                                                </span>
                                                <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                                                    {selectedFeedback.feedbackText}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 px-4 py-3">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Rating
                                                </span>
                                                <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                                                    {selectedFeedback.rating}/5
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 px-4 py-3">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Date
                                                </span>
                                                <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                                                    {formatDate(selectedFeedback.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-40 items-center justify-center">
                                    <p className="text-center text-gray-500 dark:text-gray-400">
                                        No feedback selected.
                                    </p>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Pagination */}
                    <div className="mt-6 rounded-md bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing{" "}
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {feedbacksPerPage === "all" ? 1 : startIndex + 1}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {feedbacksPerPage === "all"
                                        ? filteredFeedbacks.length
                                        : Math.min(startIndex + feedbacksPerPage, filteredFeedbacks.length)}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {filteredFeedbacks.length}
                                </span>{" "}
                                feedbacks
                                <div className="flex items-center space-x-2 pt-3">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                                    <Select
                                        value={feedbacksPerPage.toString()}
                                        onValueChange={(value) => {
                                            setFeedbacksPerPage(value === "all" ? "all" : parseInt(value));
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectTrigger
                                            className="h-8 w-24 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <SelectValue placeholder="Entries" />
                                        </SelectTrigger>
                                        <SelectContent
                                            className="rounded-md border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                        >
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="20">20</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="all">All</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center space-x-1">
                                <Button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="h-8 w-8 rounded-md bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="hidden sm:flex sm:items-center sm:space-x-1">
                                    {generatePaginationNumbers().map((page, index) =>
                                        page === "..." ? (
                                            <span key={`ellipsis-${index}`} className="px-1 text-gray-400">
                                                ...
                                            </span>
                                        ) : (
                                            <Button
                                                key={`page-${page}`}
                                                onClick={() => setCurrentPage(Number(page))}
                                                className={`h-8 w-8 rounded-md p-0 text-sm font-medium ${currentPage === page
                                                    ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                                    : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                                    }`}
                                                aria-label={`Page ${page}`}
                                                aria-current={currentPage === page ? "page" : undefined}
                                            >
                                                {page}
                                            </Button>
                                        )
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:hidden">
                                    Page {currentPage} of {totalPages || 1}
                                </span>
                                <Button
                                    onClick={() =>
                                        setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))
                                    }
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="h-8 w-8 rounded-md bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="hidden items-center space-x-2 lg:flex">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Go to page:</span>
                                <Input
                                    type="number"
                                    min={1}
                                    max={totalPages || 1}
                                    value={currentPage}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        if (value >= 1 && value <= totalPages) {
                                            setCurrentPage(value);
                                        }
                                    }}
                                    className="h-8 w-16 rounded-md dark:text-white border-gray-300 text-center text-sm dark:border-gray-700 dark:bg-gray-800"
                                    aria-label="Go to page"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: #f9fafb;
        }
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #4b5563;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background-color: #1f2937;
          }
        }
      `}</style>
        </div>
    );
};

export default FeedbackManagement;