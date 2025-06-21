"use client";

import { useState, useEffect } from "react";
import { Menu, ChevronLeft, ChevronRight, Eye, RefreshCw, X } from "lucide-react";
import { RxCross2 } from "react-icons/rx";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaRegUser } from "react-icons/fa6";
import { BookOpen } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Sidebar from "@/components/Sidebar/Sidebar";
import { useFetchUserPracticeAttemptsQuery, useFetchUsersQuery } from "@/services/api";
import { toast } from "sonner";

// Define TypeScript interfaces
interface User {
    _id: string;
    name?: string;
    email?: string;
}

interface PracticeTest {
    _id: string;
    testName: string;
    skill: string;
    level: string;
}

interface PracticeAttempt {
    userId: string;
    practiceTestId: string;
    testName: string;
    skill: string;
    level: string;
    completedAt: string;
    score: number | null;
    answers?: Array<{
        questionId: string;
        selectedAnswer: string;
        isCorrect: boolean;
    }>;
}

interface PracticeAttemptsResponse {
    success: boolean;
    data: PracticeAttempt[];
}

const PracticeTestLogsPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [practiceAttemptsPerPage, setPracticeAttemptsPerPage] = useState<number | "all">(10);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [selectedAttempt, setSelectedAttempt] = useState<PracticeAttempt | null>(null);
    const [activeFilters, setActiveFilters] = useState({
        testName: "",
        date: "",
        skill: "",
        level: "",
        minScore: "",
    });

    const { data: usersData } = useFetchUsersQuery(undefined);
    const users: User[] = usersData?.data || [];

    const { data: attemptsData, isLoading, isFetching, error: fetchError, refetch } = useFetchUserPracticeAttemptsQuery(undefined, {
        pollingInterval: 30000,
    }) as { data?: PracticeAttemptsResponse; isLoading: boolean; isFetching: boolean; error?: unknown; refetch: () => void };
    const attempts: PracticeAttempt[] = attemptsData?.data || [];

    console.log("User Name : ", users.map((user) => user.name));
    console.log("User name based on userId : ", attempts.map((attempt) => {
        const user = users.find((u) => u._id === attempt.userId);
        return user?.name || "Unknown User";
    }));

    // Aggregate by userId and practiceTestId to avoid duplicates in table
    const aggregatedAttempts: PracticeAttempt[] = Object.values(
        attempts.reduce((acc: Record<string, PracticeAttempt>, attempt: PracticeAttempt) => {
            const key = `${attempt.userId}-${attempt.practiceTestId}`;
            if (!acc[key] || new Date(attempt.completedAt) > new Date(acc[key].completedAt)) {
                acc[key] = attempt;
            }
            return acc;
        }, {})
    );

    // Get unique skills and levels for select options
    const uniqueSkills = [...new Set(aggregatedAttempts.map((a: PracticeAttempt) => a.skill))];
    const uniqueLevels = [...new Set(aggregatedAttempts.map((a: PracticeAttempt) => a.level))];

    const filteredAttempts = aggregatedAttempts.filter((attempt: PracticeAttempt) => {
        const searchFields = [
            attempt.testName,
            attempt.userId,
            attempt.skill,
            attempt.level,
        ];
        const matchesSearch = searchFields.some((field) =>
            field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (!matchesSearch) return false;

        if (activeFilters.testName && !attempt.testName.toLowerCase().includes(activeFilters.testName.toLowerCase())) {
            return false;
        }

        if (activeFilters.date) {
            const attemptDate = new Date(attempt.completedAt).toISOString().split("T")[0];
            if (attemptDate !== activeFilters.date) {
                return false;
            }
        }

        if (activeFilters.skill && attempt.skill.toLowerCase() !== activeFilters.skill.toLowerCase()) {
            return false;
        }

        if (activeFilters.level && attempt.level.toLowerCase() !== activeFilters.level.toLowerCase()) {
            return false;
        }

        if (activeFilters.minScore && (attempt.score === null || attempt.score < parseInt(activeFilters.minScore))) {
            return false;
        }

        return true;
    });

    // Get all attempts for the selected user and test
    const getUserTestAttempts = (attempt: PracticeAttempt | null): PracticeAttempt[] => {
        if (!attempt) return [];
        return attempts.filter((a) =>
            a.userId === attempt.userId && a.practiceTestId === attempt.practiceTestId
        ).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    };

    const startIndex = practiceAttemptsPerPage === "all" ? 0 : (currentPage - 1) * practiceAttemptsPerPage;
    const totalPages = practiceAttemptsPerPage === "all" ? 1 : Math.ceil(filteredAttempts.length / practiceAttemptsPerPage);
    const sortedAttempts = filteredAttempts.sort((a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
    const displayedAttempts = practiceAttemptsPerPage === "all"
        ? sortedAttempts
        : sortedAttempts.slice(
            startIndex,
            startIndex + practiceAttemptsPerPage
        );

    useEffect(() => {
        const handleFocus = () => refetch();
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [refetch]);

    const handleFilterChange = (newFilters: { testName: string; date: string; skill: string; level: string; minScore: string }) => {
        setActiveFilters(newFilters);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        const clearedFilters = {
            testName: "",
            date: "",
            skill: "",
            level: "",
            minScore: "",
        };
        setActiveFilters(clearedFilters);
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

    const handlePreview = (attempt: PracticeAttempt) => {
        setSelectedAttempt(attempt);
        setPreviewOpen(true);
    };

    const handleRefresh = () => {
        refetch();
        toast.success("Table refreshed", {
            description: "Latest practice test attempt data has been fetched.",
            duration: 3000,
        });
    };

    // Unique Users
    const uniqueUsers = [...new Set(aggregatedAttempts.map((a: PracticeAttempt) => a.userId))].length;

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

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (fetchError) {
        return <div>Error: {(fetchError as Error).toString()}</div>;
    }

    return (
        <div className="flex min-h-screen">
            <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                    aria-label="Toggle sidebar"
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-lg font-bold text-gray-800">Practice Test Logs</h1>
                <div className="w-10"></div>
            </div>

            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
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

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                ></div>
            )}

            <main className="flex-1 overflow-y-auto pt-16 md:ml-64">
                <div className="container mx-auto px-4 py-6">
                    <Card className="mb-6 overflow-hidden border-none bg-white shadow-md dark:bg-gray-900">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
                            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                                    Practice Test Logs
                                </CardTitle>
                                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">

                                    <Input
                                        type="text"
                                        placeholder="Search attempts..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="h-10 w-full rounded border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 md:w-64"
                                    />

                                    <Button
                                        onClick={handleRefresh}
                                        disabled={isFetching}
                                        className="h-10 w-10 rounded-full bg-white/90 p-0 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-600"
                                        aria-label="Refresh practice test logs"
                                    >
                                        <RefreshCw
                                            size={20}
                                            className={isFetching ? "animate-spin" : ""}
                                        />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-4">
                            <div className="mb-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Filters</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-white">Test Name</label>
                                        <Input
                                            type="text"
                                            placeholder="Filter by Test Name"
                                            value={activeFilters.testName}
                                            onChange={(e) =>
                                                handleFilterChange({
                                                    ...activeFilters,
                                                    testName: e.target.value,
                                                })
                                            }
                                            className="w-full dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-white">Skill</label>
                                        <Select
                                            value={activeFilters.skill || "all"}
                                            onValueChange={(value) =>
                                                handleFilterChange({
                                                    ...activeFilters,
                                                    skill: value === "all" ? "" : value,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                                                <SelectValue placeholder="Select skill" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Skills</SelectItem>
                                                {uniqueSkills.map((skill) => (
                                                    <SelectItem key={skill} value={skill}>
                                                        {skill}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-white">Level</label>
                                        <Select
                                            value={activeFilters.level || "all"}
                                            onValueChange={(value) =>
                                                handleFilterChange({
                                                    ...activeFilters,
                                                    level: value === "all" ? "" : value,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                                                <SelectValue placeholder="Select level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Levels</SelectItem>
                                                {uniqueLevels.map((level) => (
                                                    <SelectItem key={level} value={level}>
                                                        {level}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-white">Min Score (%)</label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            placeholder="Min score"
                                            value={activeFilters.minScore}
                                            onChange={(e) =>
                                                handleFilterChange({
                                                    ...activeFilters,
                                                    minScore: e.target.value,
                                                })
                                            }
                                            className="w-full dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-white">Date</label>
                                        <Input
                                            type="date"
                                            value={activeFilters.date}
                                            onChange={(e) =>
                                                handleFilterChange({
                                                    ...activeFilters,
                                                    date: e.target.value,
                                                })
                                            }
                                            className="w-full dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="no-scrollbar overflow-x-auto">
                                <Table className="w-full text-black dark:text-white">
                                    <TableHeader>
                                        <TableRow className="border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                                            <TableHead className="hidden py-3 text-center sm:table-cell">
                                                #
                                            </TableHead>
                                            <TableHead className="py-3">User ID</TableHead>
                                            <TableHead className="py-3">User Name</TableHead>
                                            <TableHead className="hidden py-3 md:table-cell">Test Name</TableHead>
                                            <TableHead className="py-3">Skill</TableHead>
                                            <TableHead className="hidden py-3 sm:table-cell">Level</TableHead>
                                            <TableHead className="py-3">Latest Test Completed At</TableHead>
                                            <TableHead className="py-3 text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {displayedAttempts.length > 0 ? (
                                            displayedAttempts.map((attempt: PracticeAttempt, index: number) => (
                                                <TableRow
                                                    key={`${attempt.userId}-${attempt.practiceTestId}`}
                                                    className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-800"
                                                >
                                                    <TableCell className="hidden text-center font-medium sm:table-cell">
                                                        {startIndex + index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="sm:block">
                                                            <p className="font-medium">
                                                                {attempt.userId || "Unknown User"}
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-500 md:hidden">
                                                                {users.find((user) => user._id === attempt.userId)?.name || "Unknown User"}
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-500 md:hidden">
                                                                {attempt.testName}
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-500 sm:hidden">
                                                                {attempt.skill}
                                                            </p>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="hidden md:table-cell">
                                                        {attempt.userId ? users.find((user) => user._id === attempt.userId)?.name || "Unknown User" : "Unknown User"}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {attempt.testName}
                                                    </TableCell>
                                                    <TableCell>{attempt.skill}</TableCell>
                                                    <TableCell className="hidden sm:table-cell">
                                                        {attempt.level}
                                                    </TableCell>
                                                    <TableCell>{formatDate(attempt.completedAt)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                                                onClick={() => handlePreview(attempt)}
                                                                aria-label="View attempt details"
                                                            >
                                                                <Eye
                                                                    size={16}
                                                                    className="transition-transform group-hover:scale-110"
                                                                />
                                                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                                                    View all attempts
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="h-32 text-center">
                                                    <div className="flex flex-col items-center justify-center space-y-2">
                                                        <div className="text-gray-400 dark:text-gray-500">
                                                            <svg
                                                                className="mx-auto h-12 w-12"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <div className="text-gray-500 dark:text-gray-400">
                                                            <p className="text-base font-medium">No attempts found</p>
                                                            <p className="text-sm">
                                                                {searchTerm || Object.values(activeFilters).some(Boolean)
                                                                    ? "Try adjusting your search or filter criteria"
                                                                    : "No practice test attempts available"}
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

                    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                        <DialogContent className="no-scrollbar max-h-[90vh] max-w-2xl overflow-y-auto rounded-md bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
                            <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                                        Attempts for {selectedAttempt?.testName || "Test"} by User {users.find((user) => user._id === selectedAttempt?.userId)?.name || "Unknown User"}
                                    </DialogTitle>
                                    <RxCross2
                                        className="text-gray-800 dark:text-white"
                                        size={20}
                                        onClick={() => setPreviewOpen(false)}
                                    />
                                </div>
                            </DialogHeader>
                            {selectedAttempt ? (
                                <div className="space-y-6 p-6">
                                    <div className="overflow-hidden rounded-md border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                                            <h3 className="font-medium text-blue-800 dark:text-blue-300">
                                                User Information
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                            <div className="grid grid-cols-3 px-4 py-3">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    User Name
                                                </span>
                                                <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                                                    {users.find((user) => user._id === selectedAttempt?.userId)?.name || "Unknown User"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="overflow-hidden rounded-md border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                                            <h3 className="font-medium text-blue-800 dark:text-blue-300">
                                                Attempt History
                                            </h3>
                                        </div>
                                        <div className="no-scrollbar overflow-x-auto">
                                            <Table className="w-full text-black dark:text-white">
                                                <TableHeader>
                                                    <TableRow className="border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                                                        <TableHead className="py-3">Level</TableHead>
                                                        <TableHead className="py-3">Score</TableHead>
                                                        <TableHead className="py-3">Completed At</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {getUserTestAttempts(selectedAttempt).length > 0 ? (
                                                        getUserTestAttempts(selectedAttempt).map((attempt: PracticeAttempt) => (
                                                            <TableRow
                                                                key={`${attempt.userId}-${attempt.practiceTestId}-${attempt.completedAt}`}
                                                                className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-800"
                                                            >
                                                                <TableCell>{attempt.level}</TableCell>
                                                                <TableCell>
                                                                    {attempt.score !== null ? `${attempt.score}/${attempt.answers?.length || "N/A"}` : "N/A"}
                                                                </TableCell>
                                                                <TableCell>{formatDate(attempt.completedAt)}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="h-32 text-center">
                                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                                    <div className="text-gray-400 dark:text-gray-500">
                                                                        <svg
                                                                            className="mx-auto h-12 w-12"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={2}
                                                                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="text-gray-500 dark:text-gray-400">
                                                                        <p className="text-base font-medium">No attempts found</p>
                                                                        <p className="text-sm">No additional attempts recorded for this user and test.</p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-40 items-center justify-center">
                                    <p className="text-center text-gray-500 dark:text-gray-400">
                                        No attempt selected.
                                    </p>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>

                    <div className="mt-6 rounded-md bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing{" "}
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {practiceAttemptsPerPage === "all" ? 1 : startIndex + 1}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {practiceAttemptsPerPage === "all" ? filteredAttempts.length : Math.min(startIndex + practiceAttemptsPerPage, filteredAttempts.length)}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {filteredAttempts.length}
                                </span>{" "}
                                attempts

                                <div className="flex items-center space-x-2 pt-3">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                                    <Select
                                        value={practiceAttemptsPerPage.toString()}
                                        onValueChange={(value) => {
                                            setPracticeAttemptsPerPage(value === "all" ? "all" : parseInt(value));
                                            setCurrentPage(1); // Reset to first page when changing entries per page
                                        }}
                                    >
                                        <SelectTrigger className="h-8 w-24 rounded-md dark:border-gray-700 dark:bg-gray-800">
                                            <SelectValue placeholder="Entries" />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Go to page :
                                </span>
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

export default PracticeTestLogsPage;