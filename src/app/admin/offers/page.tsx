"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Menu, Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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
import { useFetchOffersQuery, useDeleteOfferMutation } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

const OffersPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: offersData, refetch, isLoading } = useFetchOffersQuery(undefined);
  const [deleteOffer] = useDeleteOfferMutation();

  const offers = offersData?.data || [];
  const offersPerPage = 10;

  const filteredOffers = offers.filter((offer: any) =>
    Object.values(offer).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredOffers.length / offersPerPage);
  const startIndex = (currentPage - 1) * offersPerPage;
  const displayedOffers = filteredOffers.slice(
    startIndex,
    startIndex + offersPerPage
  );

  const handleDelete = async () => {
    if (!offerToDelete) return;

    try {
      await deleteOffer({ id: offerToDelete }).unwrap();
      toast.success("Offer deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete offer");
    }
    setDeleteDialogOpen(false);
    setOfferToDelete(null);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Offers Management</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-0 z-40 h-screen w-64 transform overflow-y-auto bg-white shadow-lg transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:sticky md:top-0 md:translate-x-0 md:h-screen`}
        >
          <div className="h-16 md:h-0"></div>
          <Sidebar />
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
        <main className="w-full flex-1 overflow-x-hidden pt-16">
          <div className="container mx-auto px-4 py-6">
            <Card className="mb-6 overflow-hidden border-none bg-white shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                    Offers Management
                  </CardTitle>
                  <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                    <Input
                      type="text"
                      placeholder="Search offers..."
                      className="h-10 w-full rounded border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 md:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        setSelectedOffer(null);
                        setCreateDialogOpen(true);
                      }}
                      className="bg-white text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Offer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="w-full text-black">
                    <TableHeader>
                      <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
                        <TableHead className="hidden py-3 sm:table-cell">#</TableHead>
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
                      ) : displayedOffers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="py-6 text-center text-gray-500">
                            No offers found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        displayedOffers.map((offer: any, index) => (
                          <TableRow
                            key={offer._id}
                            className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                          >
                            <TableCell className="hidden text-center font-medium sm:table-cell">
                              {startIndex + index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="md:hidden">
                                <p className="font-medium">{offer.code}</p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {offer.discountPercentage}% off
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
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
                                className={`px-2 py-1 rounded-full text-xs ${
                                  offer.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {offer.isActive ? "Active" : "Inactive"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                  onClick={() => {
                                    setSelectedOffer(offer);
                                    setCreateDialogOpen(true);
                                  }}
                                  aria-label="Edit offer"
                                >
                                  <Edit2 size={16} className="transition-transform group-hover:scale-110" />
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
              onOpenChange={setCreateDialogOpen}
              offer={selectedOffer}
              onSuccess={() => {
                setCreateDialogOpen(false);
                refetch();
              }}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
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
                    className="mt-2 sm:mt-0"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    Delete Offer
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
                    {Math.min(startIndex + offersPerPage, filteredOffers.length)}
                  </span>{" "}
                  of <span className="font-medium text-gray-700">{filteredOffers.length}</span> offers
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
                          className={`h-8 w-8 rounded p-0 text-sm font-medium ${
                            currentPage === page
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
      <style>{`
        :global(.custom-scrollbar::-webkit-scrollbar) {
          width: 6px;
          height: 6px;
        }
        :global(.custom-scrollbar::-webkit-scrollbar-thumb) {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        :global(.custom-scrollbar::-webkit-scrollbar-track) {
          background-color: #f9fafb;
        }
        
        @media (prefers-color-scheme: dark) {
          :global(.custom-scrollbar::-webkit-scrollbar-thumb) {
            background-color: #4b5563;
          }
          :global(.custom-scrollbar::-webkit-scrollbar-track) {
            background-color: #1f2937;
          }
        }
      `}</style>
    </div>
  );
};

export default OffersPage; 