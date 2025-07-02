"use client";

import { useState, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Menu, Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { toast } from "sonner";
import CreateOfferDialog from "./components/create-offer-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useFetchOffersQuery, useDeleteOfferMutation, useFetchCourcesQuery } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedOffer, resetSelectedOffer, setPreviewOffer } from "@/lib/slices/offersSlice";
import OfferPreviewModal from "./components/offer-preview-modal";
import { selectRootState } from "@/lib/store";
import OfferFilters from "./components/offer-filters";

const OffersPage = () => {
  const dispatch = useDispatch();
  const [deleteOffer] = useDeleteOfferMutation();
  const offer = useSelector((state) => selectRootState(state).offers);
  const { selectedOffer } = offer;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [offersPerPage, setOffersPerPage] = useState<number | "all">(10);
  const [currentDate] = useState(new Date());
  const [activeFilters, setActiveFilters] = useState({
    status: "",
    minDiscount: "",
    maxDiscount: "",
    course: "",
    startDate: "",
    endDate: "",
  });

  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const { data: offersData, refetch, isLoading, error: fetchError } = useFetchOffersQuery(undefined);
  const { data: coursesData } = useFetchCourcesQuery(undefined);
  const courses = coursesData?.data || [];
  const offers = offersData?.data || [];

  const calculateIsActive = useCallback((offer) => {
    const validFrom = new Date(offer.validFrom);
    const validUntil = new Date(offer.validUntil);
    return currentDate >= validFrom && currentDate <= validUntil;
  }, [currentDate]);

  const filteredOffers = offers.filter((offer: any) => {
    const matchesSearch = Object.values(offer).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!matchesSearch) return false;

    if (activeFilters.status) {
      const isActive = calculateIsActive(offer);
      if (activeFilters.status === 'active' && !isActive) return false;
      if (activeFilters.status === 'inactive' && isActive) return false;
    }

    if (activeFilters.minDiscount && offer.discountPercentage < parseInt(activeFilters.minDiscount)) {
      return false;
    }

    if (activeFilters.maxDiscount && offer.discountPercentage > parseInt(activeFilters.maxDiscount)) {
      return false;
    }

    if (activeFilters.course && !offer.courses.some(course => course._id === activeFilters.course)) {
      return false;
    }

    if (activeFilters.startDate) {
      const filterStart = new Date(activeFilters.startDate);
      const offerStart = new Date(offer.validFrom);
      if (offerStart < filterStart) return false;
    }

    if (activeFilters.endDate) {
      const filterEnd = new Date(activeFilters.endDate);
      const offerEnd = new Date(offer.validUntil);
      if (offerEnd > filterEnd) return false;
    }

    return true;
  });

  const startIndex = offersPerPage === "all" ? 0 : (currentPage - 1) * offersPerPage;
  const totalPages = offersPerPage === "all" ? 1 : Math.ceil(filteredOffers.length / offersPerPage);
  const displayedOffers = offersPerPage === "all"
    ? filteredOffers
    : filteredOffers.slice(
      startIndex,
      startIndex + offersPerPage
    );

  const handleEditOffer = (offer) => {
    dispatch(setSelectedOffer(offer));
    setCreateDialogOpen(true);
  };

  const handleDeleteOffer = async (id) => {
    try {
      await deleteOffer(id).unwrap();
      toast.success("Offer deleted successfully");
    } catch (error) {
      toast.error("Failed to delete offer");
    }
  };

  const handleCloseEditDialog = () => {
    setCreateDialogOpen(false);
    dispatch(resetSelectedOffer());
  };

  const handlePreviewOffer = (offer) => {
    dispatch(setPreviewOffer(offer));
  };

  const handleFilterChange = (newFilters: any) => {
    setActiveFilters(newFilters);
    setCurrentPage(1);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

      if (startPage > 2) pageNumbers.push('...');
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      if (endPage < totalPages - 1) pageNumbers.push('...');
      if (totalPages > 1) pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (fetchError) {
    return <div>Error: {fetchError.toString()}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
        <button
          onClick={toggleSidebar}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">User Management</h1>
        <div className="w-10"></div>
      </div>

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

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto  pt-16 md:ml-64">
        <div className="container mx-auto px-4 py-6">
          <Card className="mb-6 overflow-hidden border-none bg-white shadow-md dark:bg-gray-800 dark:text-white">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Offers Management
                </CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                  <Input
                    type="text"
                    placeholder="Search offers..."
                    className="h-10 w-full rounded border border-gray-300 bg-white/90 p-2 text-black dark:text-black placeholder:text-gray-500 md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      dispatch(resetSelectedOffer());
                      setCreateDialogOpen(true);
                    }}
                    className="h-10 w-full rounded bg-white text-blue-600 transition-colors md:w-auto hover:bg-blue-50"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Offer
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <OfferFilters
                courses={courses}
                onFilterChange={handleFilterChange}
              />

              {/* Table */}
              <div className="overflow-x-auto m-4">
                <Table className="w-full text-black dark:text-white">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                      <TableHead className="hidden py-3 text-center sm:table-cell">#</TableHead>
                      <TableHead className="py-3">Code</TableHead>
                      <TableHead className="hidden py-3 md:table-cell">Discount</TableHead>
                      <TableHead className="hidden py-3 lg:table-cell">Valid From</TableHead>
                      <TableHead className="hidden py-3 xl:table-cell">Valid Until</TableHead>
                      <TableHead className="py-3">Status</TableHead>
                      <TableHead className="py-3 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 7 }).map((_, index) => (
                        <TableRow key={index} className="border-b border-gray-100 dark:border-gray-700 dark:bg-gray-900">
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
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Skeleton className="h-6 w-6 rounded-full" />
                              <Skeleton className="h-6 w-6 rounded-full" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : displayedOffers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-6 text-center text-gray-500 dark:text-gray-400">
                          No offers found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedOffers.map((offer: any, index) => (
                        <TableRow
                          key={offer._id}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <TableCell className="hidden text-center font-medium sm:table-cell">
                            {startIndex + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="md:hidden">
                              <p className="font-medium">{offer.code}</p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {offer.discountPercentage}% off
                              </p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Valid until {formatDate(offer.validUntil)}
                              </p>
                            </div>
                            <span className="hidden font-medium md:inline">{offer.code}</span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {offer.discountPercentage}%
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {formatDate(offer.validFrom)}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {formatDate(offer.validUntil)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${calculateIsActive(offer)
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                }`}
                            >
                              {calculateIsActive(offer) ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600 transition-all duration-200 hover:bg-green-100 hover:text-green-700 hover:shadow-md dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 dark:hover:text-green-300"
                                onClick={() => handlePreviewOffer(offer)}
                                aria-label="Preview offer"
                              >
                                <Eye size={16} className="transition-transform group-hover:scale-110" />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  Preview offer
                                </span>
                              </button>
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                onClick={() => handleEditOffer(offer)}
                                aria-label="Edit offer"
                              >
                                <Edit2 size={16} className="transition-transform group-hover:scale-110" />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  Edit offer
                                </span>
                              </button>
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                onClick={() => {
                                  setOfferToDelete(offer._id);
                                  setDeleteDialogOpen(true);
                                }}
                                aria-label="Delete offer"
                              >
                                <Trash2 size={16} className="transition-transform group-hover:scale-110" />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  Delete offer
                                </span>
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

          {/* Create/Edit Dialog */}
          <CreateOfferDialog
            open={createDialogOpen}
            onOpenChange={handleCloseEditDialog}
            onSuccess={() => {
              handleCloseEditDialog();
              refetch();
            }}
          />

          {/* Offer preview modal */}
          <OfferPreviewModal />

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete this offer? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteOffer}
                  className="w-full sm:w-auto"
                >
                  Delete Offer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Pagination */}
          <div className="mt-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-medium text-gray-700 dark:text-gray-300">{offersPerPage === "all" ? 1 : startIndex + 1}</span> to{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {offersPerPage === "all" ? filteredOffers.length : Math.min(startIndex + offersPerPage, filteredOffers.length)}
                </span>{" "}
                of <span className="font-medium text-gray-700 dark:text-gray-300">{filteredOffers.length}</span> offers
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                <Select
                  value={offersPerPage.toString()}
                  onValueChange={(value) => {
                    setOffersPerPage(value === "all" ? "all" : parseInt(value));
                    setCurrentPage(1); // Reset to first page when changing entries per page
                  }}
                >
                  <SelectTrigger className="h-8 w-24 rounded-md dark:border-gray-700 dark:bg-gray-800">
                    <SelectValue placeholder="Entries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
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
                  {generatePaginationNumbers().map((page, index) => (
                    typeof page === 'number' ? (
                      <Button
                        key={`page-${page}`}
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 rounded-md p-0 text-sm font-medium ${currentPage === page
                          ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                          }`}
                        aria-label={`Page ${page}`}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    ) : (
                      <span key={`ellipsis-${index}`} className="px-1 text-gray-400">
                        {page}
                      </span>
                    )
                  ))}
                </div>

                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
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
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 1 && value <= totalPages) {
                      setCurrentPage(value);
                    }
                  }}
                  className="h-8 w-16 rounded-md border-gray-300 text-center text-sm dark:border-gray-700 dark:bg-gray-800"
                  aria-label="Go to page"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Custom Scrollbar Styling */ }
  <style jsx global>{`
        body {
          overflow-x: hidden;
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

export default OffersPage;