"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    updateAdField,
    setAdForm,
    resetAdForm,
    setSelectedAd,
    clearSelectedAd,
} from "@/lib/slices/adSlice";
import { Menu, ChevronLeft, ChevronRight, Eye, Trash2, Pencil } from "lucide-react";
import { RxCross2 } from "react-icons/rx";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    DialogFooter,
} from "@/components/ui/dialog";
import { RootState } from "@/lib/rootState";
import Sidebar from "@/components/Sidebar/Sidebar";
import { useFetchAdsQuery, useCreateAdMutation, useUpdateAdMutation, useDeleteAdMutation } from "@/services/api";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const AdsPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [adsPerPage, setAdsPerPage] = useState<number | "all">(10);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    // const [selectedAd, setSelectedAd] = useState(null);
    const [activeFilters, setActiveFilters] = useState({
        status: "",
        startDate: "",
        endDate: "",
    });

    const dispatch = useDispatch();
    const formData = useSelector((state: RootState) => state.ad.form);
    const selectedAd = useSelector((state: RootState) => state.ad.selectedAd);

    // const [formData, setFormData] = useState({
    //     name: "",
    //     destination: "",
    //     imageUrl: "",
    //     title: "",
    //     description: "",
    //     buttonText: "",
    //     buttonLink: "",
    //     status: "INACTIVE",
    //     startDate: "",
    //     endDate: "",
    // });

    const { data: adsData, isLoading, error } = useFetchAdsQuery(undefined);
    const [createAd, { isLoading: isCreateLoading }] = useCreateAdMutation();
    const [updateAd, { isLoading: isUpdateLoading }] = useUpdateAdMutation();
    const [deleteAd, { isLoading: isDeleteLoading }] = useDeleteAdMutation();

    const ads = adsData?.data || [];

    // Filter ads
    const filteredAds = ads.filter((ad) => {
        const searchFields = [
            ad.name,
            ad.destination,
            ad.title,
            ad.description,
            ad.buttonText,
            ad.status,
            new Date(ad.startDate).toLocaleDateString(),
            new Date(ad.endDate).toLocaleDateString(),
        ];

        const matchesSearch = searchFields.some((field) =>
            field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (!matchesSearch) return false;

        if (activeFilters.status && ad.status !== activeFilters.status) {
            return false;
        }

        if (
            activeFilters.startDate &&
            new Date(ad.startDate) < new Date(activeFilters.startDate)
        ) {
            return false;
        }

        if (
            activeFilters.endDate &&
            new Date(ad.endDate) > new Date(activeFilters.endDate)
        ) {
            return false;
        }

        return true;
    });

    const totalPages =
        adsPerPage === "all" ? 1 : Math.ceil(filteredAds.length / (adsPerPage as number));
    const startIndex = adsPerPage === "all" ? 0 : (currentPage - 1) * (adsPerPage as number);
    const displayedAds =
        adsPerPage === "all"
            ? filteredAds
            : filteredAds.slice(startIndex, startIndex + (adsPerPage as number));

    const handleFilterChange = (newFilters) => {
        setActiveFilters({ ...activeFilters, ...newFilters });
        setCurrentPage(1);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handlePreview = (ad) => {
        dispatch(setSelectedAd(ad));
        setPreviewOpen(true);
    };

    const handleEdit = (ad) => {
        dispatch(setSelectedAd(ad));
        dispatch(setAdForm({
            name: ad.name || "",
            destination: ad.destination || "",
            imageUrl: ad.imageUrl || "",
            title: ad.title || "",
            description: ad.description || "",
            buttonText: ad.buttonText || "",
            buttonLink: ad.buttonLink || "",
            status: ad.status || "INACTIVE",
            startDate: ad.startDate ? new Date(ad.startDate).toISOString().split("T")[0] : "",
            endDate: ad.endDate ? new Date(ad.endDate).toISOString().split("T")[0] : "",
        }));
        setEditModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this ad?")) return;
        try {
            const response = await deleteAd(id).unwrap();
            if (response.success) {
                toast.success("✅ Ad deleted successfully!");
            } else {
                toast.error(`❌ ${response.message || "Failed to delete ad"}`);
            }
        } catch (error) {
            toast.error(`❌ ${error.message || "An error occurred while deleting the ad"}`);
        }
    };

    const handleCreateAd = async () => {
        try {
            const response = await createAd(formData).unwrap();
            if (response.success) {
                toast.success("✅ Ad created successfully!");
                setCreateModalOpen(false);
                dispatch(resetAdForm());
            }
        } catch (error) {
            toast.error(`❌ ${error.message || "An error occurred while creating the ad"}`);
        }
    };

    const handleUpdateAd = async () => {
        try {
            const response = await updateAd({ id: selectedAd._id, ...formData }).unwrap();
            if (response.success) {
                toast.success("✅ Ad updated successfully!");
                setEditModalOpen(false);
                dispatch(clearSelectedAd());
                dispatch(resetAdForm());
            }
        } catch (error) {
            toast.error(`❌ ${error.message || "An error occurred while updating the ad"}`);
        }
    };

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

    if (error) {
        return <div>Error: {error.toString()}</div>;
    }

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
                <h1 className="text-lg font-bold text-gray-800">Ads Management</h1>
                <div className="w-10"></div>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-100 shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
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

            <main className="flex-1 overflow-y-auto pt-16 md:ml-64">
                <div className="container mx-auto px-4 py-6">
                    <Card className="mb-6 overflow-hidden border-none shadow-md dark:bg-gray-900">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
                            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row md:items-center">
                                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                                    Ads Management
                                </CardTitle>
                                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                                    <Input
                                        type="text"
                                        placeholder="Search ads..."
                                        className="h-10 w-full rounded border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 md:w-64"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Button
                                        onClick={() => {
                                            dispatch(resetAdForm());
                                            setCreateModalOpen(true)
                                        }}
                                        className="h-10 w-10 rounded-full bg-white/90 p-0 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-600"
                                        disabled={isCreateLoading}
                                    >
                                        Create Ad
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-4">
                            <div className="mb-6 grid gap-4 md:grid-cols-3">
                                {/* Total Ads Card */}
                                <div className="overflow-hidden rounded-md bg-white shadow transition-all hover:shadow-md dark:bg-gray-800">
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
                                                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Total Ads
                                                </h3>
                                                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                                                    {ads.length.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Ads Card */}
                                <div className="overflow-hidden rounded-md bg-white shadow transition-all hover:shadow-md dark:bg-gray-800">
                                    <div className="p-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                                    <svg
                                                        className="h-6 w-6 text-green-600 dark:text-green-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Active Ads
                                                </h3>
                                                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                                                    {ads.filter((ad) => ad.status === "ACTIVE").length.toLocaleString() || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Scheduled Ads Card */}
                                <div className="overflow-hidden rounded-md bg-white shadow transition-all hover:shadow-md dark:bg-gray-800">
                                    <div className="p-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                                    <svg
                                                        className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Scheduled Ads
                                                </h3>
                                                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                                                    {ads.filter((ad) => ad.status === "SCHEDULED").length.toLocaleString() || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="mb-6 grid gap-4 md:grid-cols-3">
                                <div>
                                    <select
                                        className="w-full rounded-md border p-3 text-sm dark:bg-gray-800 dark:text-gray-200"
                                        value={activeFilters.status}
                                        onChange={(e) =>
                                            handleFilterChange({ status: e.target.value })
                                        }
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="SCHEDULED">Scheduled</option>
                                    </select>
                                </div>
                                <div>
                                    <Input
                                        type="date"
                                        placeholder="Start Date"
                                        value={activeFilters.startDate}
                                        onChange={(e) =>
                                            handleFilterChange({ startDate: e.target.value })
                                        }
                                        className="w-full dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="date"
                                        placeholder="End Date"
                                        value={activeFilters.endDate}
                                        onChange={(e) =>
                                            handleFilterChange({ endDate: e.target.value })
                                        }
                                        className="w-full dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <Table className="w-full text-black dark:text-white">
                                    <TableHeader>
                                        <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-900">
                                            <TableHead className="hidden py-3 text-center sm:table-cell">
                                                Ad #
                                            </TableHead>
                                            <TableHead className="py-3">Ad Name</TableHead>
                                            <TableHead className="hidden py-3 md:table-cell">
                                                Destination
                                            </TableHead>
                                            <TableHead className="hidden py-3 md:table-cell">
                                                Title
                                            </TableHead>
                                            <TableHead className="hidden py-3 sm:table-cell">
                                                Status
                                            </TableHead>
                                            <TableHead className="py-3 text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {displayedAds.length > 0 ? (
                                            displayedAds.map((ad, index) => (
                                                <TableRow
                                                    key={ad._id}
                                                    className="border-b border-gray-100 transition-colors duration-200 dark:border-gray-700 dark:hover:bg-gray-900 hover:bg-gray-50 dark:bg-gray-800"
                                                >
                                                    <TableCell className="hidden text-center font-medium sm:table-cell">
                                                        {startIndex + index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="sm:block">
                                                            <p className="font-medium">{ad.name}</p>
                                                            <p className="mt-1 text-xs text-gray-500 md:table-cell">
                                                                {ad.destination}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {ad.destination}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {ad.title}
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ad.status === "ACTIVE"
                                                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                                : ad.status === "SCHEDULED"
                                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                                }`}
                                                        >
                                                            {ad.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                                                onClick={() => handlePreview(ad)}
                                                                aria-label="View ad details"
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
                                                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-yellow-50 text-yellow-600 transition-all duration-200 hover:bg-yellow-100 hover:text-yellow-700 hover:shadow-md dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30 dark:hover:text-yellow-300"
                                                                onClick={() => handleEdit(ad)}
                                                                aria-label="Edit ad"
                                                            >
                                                                <Pencil
                                                                    size={16}
                                                                    className="transition-transform group-hover:scale-110"
                                                                />
                                                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                                                    Edit
                                                                </span>
                                                            </button>
                                                            <button
                                                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                                                onClick={() => handleDelete(ad._id)}
                                                                aria-label="Delete ad"
                                                                disabled={isDeleteLoading}
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
                                                            <p className="text-base font-medium">
                                                                No ads found
                                                            </p>
                                                            <p className="text-sm">
                                                                {searchTerm ||
                                                                    Object.values(activeFilters).some(Boolean)
                                                                    ? "Try adjusting your search or filter criteria"
                                                                    : "No ads available"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <select
                                            className="rounded-md border p-2 text-sm dark:bg-gray-800 dark:text-gray-200"
                                            value={adsPerPage}
                                            onChange={(e) => {
                                                setAdsPerPage(
                                                    e.target.value === "all" ? "all" : Number(e.target.value)
                                                );
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value={10}>10 per page</option>
                                            <option value={20}>20 per page</option>
                                            <option value={50}>50 per page</option>
                                            <option value="all">All</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        {generatePaginationNumbers().map((page, index) => (
                                            <button
                                                key={index}
                                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${page === currentPage
                                                    ? "bg-blue-600 text-white"
                                                    : page === "..."
                                                        ? "cursor-default text-gray-500 dark:text-gray-400"
                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                                    }`}
                                                onClick={() => typeof page === "number" && setCurrentPage(page)}
                                                disabled={page === "..."}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                            onClick={() =>
                                                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                            }
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Preview Modal */}
                    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                        <DialogContent className="no-scrollbar max-h-[90vh] max-w-md overflow-y-auto rounded-md bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
                            <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                                        Ad Details
                                    </DialogTitle>
                                    <RxCross2
                                        className="text-gray-600 dark:text-white"
                                        size={20}
                                        onClick={() => setPreviewOpen(false)}
                                    />
                                </div>
                            </DialogHeader>
                            {selectedAd ? (
                                <div className="space-y-6 p-6">
                                    {/* Ad Information */}
                                    <div className="overflow-hidden rounded-md border border-gray-100 dark:border-gray-700">
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                                            <h3 className="font-medium text-blue-800 dark:text-blue-300">
                                                Ad Information
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                            <div className="grid grid-cols-3 px-4 py-3">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Name
                                                </span>
                                                <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                                                    {selectedAd.name}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 px-4 py-3">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Destination
                                                </span>
                                                <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                                                    {selectedAd.destination}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 px-4 py-3">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Title
                                                </span>
                                                <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                                                    {selectedAd.title}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 px-4 py-3">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Description
                                                </span>
                                                <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                                                    {selectedAd.description}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 px-4 py-3">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Button Text
                                                </span>
                                                <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                                                    {selectedAd.buttonText}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 px-4 py-3">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Button Link
                                                </span>
                                                <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                                                    {selectedAd.buttonLink}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 px-4 py-3">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Status
                                                </span>
                                                <span className="col-span-2 text-sm">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${selectedAd.status === "ACTIVE"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                            : selectedAd.status === "SCHEDULED"
                                                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                            }`}
                                                    >
                                                        {selectedAd.status}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 px-4 py-3">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Start Date
                                                </span>
                                                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                                                    {formatDate(selectedAd.startDate)}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 px-4 py-3">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    End Date
                                                </span>
                                                <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                                                    {formatDate(selectedAd.endDate)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image Preview */}
                                    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-600">
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                                            <h3 className="font-medium text-blue-800 dark:text-blue-400">
                                                Ad Image
                                            </h3>
                                        </div>
                                        <div className="p-4">
                                            <img
                                                src={selectedAd.imageUrl}
                                                alt={selectedAd.name}
                                                className="h-auto w-full rounded-md object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-40 items-center justify-center">
                                    <p className="text-center text-gray-500 dark:text-gray-400">
                                        No ad selected.
                                    </p>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Create Ad Modal */}
                    <Dialog
                        open={createModalOpen}
                        onOpenChange={(open) => {
                            setCreateModalOpen(open);
                            if (!open) dispatch(resetAdForm());
                        }}
                    >
                        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Ad</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Input
                                    type="text"
                                    placeholder="Name"
                                    value={formData.name}
                                    onChange={(e) => dispatch(updateAdField({ field: "name", value: e.target.value }))}
                                />
                                <Input
                                    type="text"
                                    placeholder="Destination (e.g., /homepage)"
                                    value={formData.destination}
                                    onChange={(e) => dispatch(updateAdField({ field: "destination", value: e.target.value }))}
                                />
                                <Input
                                    type="text"
                                    placeholder="Image URL"
                                    value={formData.imageUrl}
                                    onChange={(e) => dispatch(updateAdField({ field: "imageUrl", value: e.target.value }))}
                                />
                                <Input
                                    type="text"
                                    placeholder="Title"
                                    value={formData.title}
                                    onChange={(e) => dispatch(updateAdField({ field: "title", value: e.target.value }))}
                                />
                                <Input
                                    type="text"
                                    placeholder="Description"
                                    value={formData.description}
                                    onChange={(e) => dispatch(updateAdField({ field: "description", value: e.target.value }))}
                                />
                                <Input
                                    type="text"
                                    placeholder="Button Text"
                                    value={formData.buttonText}
                                    onChange={(e) => dispatch(updateAdField({ field: "buttonText", value: e.target.value }))}
                                />
                                <Input
                                    type="text"
                                    placeholder="Button Link"
                                    value={formData.buttonLink}
                                    onChange={(e) => dispatch(updateAdField({ field: "buttonLink", value: e.target.value }))}
                                />
                                <Select
                                    value={formData.status}
                                    onValueChange={(e) => dispatch(updateAdField({ field: "status", value: e }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="date"
                                    placeholder="Start Date"
                                    value={formData.startDate}
                                    onChange={(e) => dispatch(updateAdField({ field: "startDate", value: e.target.value }))}
                                />
                                <Input
                                    type="date"
                                    placeholder="End Date"
                                    value={formData.endDate}
                                    onChange={(e) => dispatch(updateAdField({ field: "endDate", value: e.target.value }))}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={() => {
                                        setCreateModalOpen(false);
                                        dispatch(resetAdForm());
                                    }}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateAd}
                                    disabled={isCreateLoading}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    {isCreateLoading ? "Creating..." : "Create Ad"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Ad Modal */}
                    <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Ad</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Input
                                    type="text"
                                    placeholder="Name"
                                    value={formData.name}
                                    onChange={(e) => dispatch(updateAdField({ field: "name", value: e.target.value }))}
                                />
                                <Input
                                    type="text"
                                    placeholder="Destination (e.g., /homepage)"
                                    value={formData.destination}
                                    onChange={(e) => dispatch(updateAdField({ field: "destination", value: e.target.value }))}
                                />
                                <Input
                                    type="text"
                                    placeholder="Image URL"
                                    value={formData.imageUrl}
                                    onChange={(e) => dispatch(updateAdField({ field: "imageUrl", value: e.target.value }))}
                                />
                                <Input
                                    type="text"
                                    placeholder="Title"
                                    value={formData.title}
                                    onChange={(e) => dispatch(updateAdField({ field: "title", value: e.target.value }))}
                                />
                                <Input
                                    type="text"
                                    placeholder="Description"
                                    value={formData.description}
                                    onChange={(e) => dispatch(updateAdField({ field: "description", value: e.target.value }))}
                                />
                                <Input
                                    type="text"
                                    placeholder="Button Text"
                                    value={formData.buttonText}
                                    onChange={(e) => dispatch(updateAdField({ field: "buttonText", value: e.target.value }))}
                                />
                                <Input
                                    type="text"
                                    placeholder="Button Link"
                                    value={formData.buttonLink}
                                    onChange={(e) => dispatch(updateAdField({ field: "buttonLink", value: e.target.value }))}
                                />
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => dispatch(updateAdField({ field: "status", value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="date"
                                    placeholder="Start Date"
                                    value={formData.startDate}
                                    onChange={(e) => dispatch(updateAdField({ field: "startDate", value: e.target.value }))}
                                />
                                <Input
                                    type="date"
                                    placeholder="End Date"
                                    value={formData.endDate}
                                    onChange={(e) => dispatch(updateAdField({ field: "endDate", value: e.target.value }))}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={() => {
                                        setEditModalOpen(false);
                                        dispatch(clearSelectedAd());
                                        dispatch(resetAdForm());
                                    }}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateAd}
                                    disabled={isUpdateLoading}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    {isUpdateLoading ? "Updating..." : "Update Ad"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </main>
        </div>
    );
};

export default AdsPage;