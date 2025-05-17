"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ChevronUp, ChevronDown, Eye, Trash2, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useFetchJobApplicationsQuery, useDeleteJobApplicationMutation } from "@/services/api";

interface JobApplication {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    desiredRole: string;
    portfolioUrl: string;
    resume: string;
    coverLetter: string;
}

const JobApplicationPage: React.FC = () => {
    const [viewOpen, setViewOpen] = useState(false);
    const [sortField, setSortField] = useState<keyof JobApplication | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);

    // Fetch data using RTK Query
    const {
        data: apiResponse,
        error,
        isLoading
    } = useFetchJobApplicationsQuery(undefined);

    // Get the applications array from the response
    const applications = apiResponse?.data || [];

    const [deleteApplication] = useDeleteJobApplicationMutation();

    // Close sidebar when screen size changes to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const confirmDeleteApplication = (applicationId: string) => {
        setApplicationToDelete(applicationId);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteApplication = async () => {
        if (!applicationToDelete) return;

        try {
            await deleteApplication(applicationToDelete).unwrap();
            toast.success("Application deleted successfully");
            setDeleteConfirmOpen(false);
            setApplicationToDelete(null);
        } catch (error) {
            console.error("Error deleting application:", error);
            toast.error("Failed to delete the application. Please try again.");
        }
    };

    const applicationsPerPage = 10;

    const handleSort = (field: keyof JobApplication) => {
        setSortField(field);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };

    const filteredApplications = applications.filter((app) =>
        Object.values(app).some((value) =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const sortedApplications = [...filteredApplications].sort((a, b) => {
        if (!sortField) return 0;
        const aValue = a[sortField]?.toString() || "";
        const bValue = b[sortField]?.toString() || "";
        return sortOrder === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
    });

    const totalPages = Math.ceil(sortedApplications.length / applicationsPerPage);
    const startIndex = (currentPage - 1) * applicationsPerPage;
    const displayedApplications = sortedApplications.slice(
        startIndex,
        startIndex + applicationsPerPage
    );

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Function to generate page numbers for pagination
    const generatePaginationNumbers = () => {
        const pageNumbers = [];
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

            if (startPage > 2) {
                pageNumbers.push('...');
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            if (endPage < totalPages - 1) {
                pageNumbers.push('...');
            }

            if (totalPages > 1) {
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 overflow-hidden">
            {/* Mobile Header */}
            <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
                <button
                    onClick={toggleSidebar}
                    className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                    aria-label="Toggle sidebar"
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-lg font-bold text-gray-800">Job Applications</h1>
                <div className="w-10"></div>
            </div>

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside
                    className={`fixed left-0 top-0 z-40 h-screen w-64 transform overflow-y-auto bg-white shadow-lg transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                        } md:sticky md:top-0 md:translate-x-0 md:h-screen`}
                >
                    <div className="h-16 md:h-0"></div>
                    <Sidebar userRole="admin" />
                </aside>

                {/* Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
                        onClick={toggleSidebar}
                        aria-hidden="true"
                    ></div>
                )}

                {/* Main Content */}
                <main className="w-full flex-1 overflow-x-hidden pt-16">
                    <div className="container mx-auto px-4 py-6">
                        <Card className="mb-6 overflow-hidden border-none bg-white shadow-md">
                            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
                                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                                    <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                                        Job Applications Management
                                    </CardTitle>
                                    <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                                        <Input
                                            type="text"
                                            placeholder="Search applications..."
                                            className="h-10 w-full rounded border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 md:w-64"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table className="w-full text-black">
                                        <TableHeader>
                                            <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
                                                <TableHead className="hidden py-3 sm:table-cell">#</TableHead>
                                                <TableHead
                                                    className="cursor-pointer py-3"
                                                    onClick={() => handleSort("fullName")}
                                                >
                                                    <div className="flex items-center">
                                                        Full Name
                                                        {sortField === "fullName" && (
                                                            <span className="ml-1">
                                                                {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableHead>
                                                <TableHead className="hidden py-3 md:table-cell">Email</TableHead>
                                                <TableHead className="hidden py-3 lg:table-cell">Phone Number</TableHead>
                                                <TableHead className="hidden py-3 xl:table-cell">Desired Role</TableHead>
                                                <TableHead className="py-3 text-center">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? (
                                                Array.from({ length: 7 }).map((_, index) => (
                                                    <TableRow key={index} className="border-b border-gray-100">
                                                        <TableCell className="hidden sm:table-cell">
                                                            <Skeleton className="h-4 w-6" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Skeleton className="h-4 w-24" />
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            <Skeleton className="h-4 w-24" />
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell">
                                                            <Skeleton className="h-4 w-24" />
                                                        </TableCell>
                                                        <TableCell className="hidden xl:table-cell">
                                                            <Skeleton className="h-4 w-24" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex justify-center gap-2">
                                                                <Skeleton className="h-8 w-8 rounded-full" />
                                                                <Skeleton className="h-8 w-8 rounded-full" />
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : displayedApplications.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="py-6 text-center text-gray-500">
                                                        No applications found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                displayedApplications.map((application, index) => (
                                                    <TableRow
                                                        key={application._id}
                                                        className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                                                    >
                                                        <TableCell className="hidden text-center font-medium sm:table-cell">
                                                            {startIndex + index + 1}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="md:hidden">
                                                                <p className="font-medium">{application.fullName}</p>
                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    {application.email}
                                                                </p>
                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    {application.desiredRole}
                                                                </p>
                                                            </div>
                                                            <span className="hidden font-medium md:inline">{application.fullName}</span>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            {application.email}
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell">
                                                            {application.phoneNumber}
                                                        </TableCell>
                                                        <TableCell className="hidden xl:table-cell">
                                                            {application.desiredRole}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                                                    onClick={() => {
                                                                        setSelectedApplication(application);
                                                                        setViewOpen(true);
                                                                    }}
                                                                    aria-label="View application details"
                                                                >
                                                                    <Eye size={16} className="transition-transform group-hover:scale-110" />
                                                                </button>
                                                                <button
                                                                    className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                                                    onClick={() => confirmDeleteApplication(application._id)}
                                                                    aria-label="Delete application"
                                                                >
                                                                    <Trash2 size={16} className="transition-transform group-hover:scale-110" />
                                                                </button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* View Application Dialog */}
                        <Dialog open={viewOpen}>
                            <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
                                <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:bg-gray-800 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                                            Application Details
                                        </DialogTitle>
                                        <Button
                                            onClick={() => setViewOpen(false)}
                                            variant="ghost"
                                            className="h-8 w-8 rounded-full p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <svg
                                                className="h-4 w-4 text-gray-500 dark:text-gray-400"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </Button>
                                    </div>
                                </DialogHeader>
                                {selectedApplication && (
                                    <div className="p-6 space-y-4">
                                        <div className="grid gap-4">
                                            <div className="space-y-2">
                                                <h3 className="font-medium text-gray-500 dark:text-gray-400">Personal Information</h3>
                                                <div className="rounded border p-4 dark:border-gray-700">
                                                    <div className="grid gap-2">
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Name:</span>
                                                            <span className="ml-2 text-gray-900 dark:text-white">{selectedApplication.fullName}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
                                                            <span className="ml-2 text-gray-900 dark:text-white">{selectedApplication.email}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone:</span>
                                                            <span className="ml-2 text-gray-900 dark:text-white">{selectedApplication.phoneNumber}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="font-medium text-gray-500 dark:text-gray-400">Application Details</h3>
                                                <div className="rounded border p-4 dark:border-gray-700">
                                                    <div className="grid gap-2">
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Desired Role:</span>
                                                            <span className="ml-2 text-gray-900 dark:text-white">{selectedApplication.desiredRole}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Portfolio:</span>
                                                            <a
                                                                href={selectedApplication.portfolioUrl}
                                                                className="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                View Portfolio
                                                            </a>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Resume:</span>
                                                            <a
                                                                href={selectedApplication.resume}
                                                                className="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                View Resume
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="font-medium text-gray-500 dark:text-gray-400">Cover Letter</h3>
                                                <div className="rounded border p-4 dark:border-gray-700">
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                        {selectedApplication.coverLetter}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>

                        {/* Delete Confirmation Dialog */}
                        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                            <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                                        Confirm Deletion
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="py-4 text-center">
                                    <Trash2 className="mx-auto mb-4 h-12 w-12 text-red-500 dark:text-red-400" />
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Are you sure you want to delete this job application? This action cannot be undone.
                                    </p>
                                </div>
                                <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => setDeleteConfirmOpen(false)}
                                        className="w-full sm:w-auto"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteApplication}
                                        className="w-full sm:w-auto"
                                    >
                                        Delete Application
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Pagination */}
                        <div className="mt-6 rounded bg-white p-4 shadow-md">
                            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                                <div className="text-sm text-gray-500">
                                    Showing <span className="font-medium text-gray-700">{startIndex + 1}</span> to{" "}
                                    <span className="font-medium text-gray-700">
                                        {Math.min(startIndex + applicationsPerPage, sortedApplications.length)}
                                    </span>{" "}
                                    of <span className="font-medium text-gray-700">{sortedApplications.length}</span> applications
                                </div>

                                <div className="flex items-center space-x-1">
                                    <Button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="h-8 w-8 rounded bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400"
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    <div className="hidden sm:flex sm:items-center sm:space-x-1">
                                        {generatePaginationNumbers().map((page, index) => (
                                            typeof page === 'number' ? (
                                                <Button
                                                    key={index}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`h-8 w-8 rounded p-0 text-sm font-medium ${currentPage === page
                                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                        }`}
                                                >
                                                    {page}
                                                </Button>
                                            ) : (
                                                <span key={index} className="px-2 text-gray-400">
                                                    {page}
                                                </span>
                                            )
                                        ))}
                                    </div>

                                    <Button
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="h-8 w-8 rounded bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400"
                                        aria-label="Next page"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="hidden items-center space-x-2 lg:flex">
                                    <span className="text-sm text-gray-500">Go to page:</span>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={totalPages}
                                        value={currentPage}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            if (value >= 1 && value <= totalPages) {
                                                setCurrentPage(value);
                                            }
                                        }}
                                        className="h-8 w-16 rounded border-gray-300 text-center text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Custom Scrollbar Styling */}
            <style jsx global>{`
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

export default JobApplicationPage;