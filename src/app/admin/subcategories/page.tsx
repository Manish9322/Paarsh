"use client";

import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Edit, Trash2, Menu, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import AddSubCategoryModal from "../../../components/Categories/AddSubCategory"
import EditSubCategoryModal from "@/components/Categories/EditSubCategory";
import { useDeleteSubCategoriesMutation, useFetchSubCategoriesQuery } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";

interface Subcategory {
  id: number;
  _id: string;
  categoryName: string;
  subcategoryName: string;
  description: string;
  keywords: string[];
  createdAt: string;
}

const SubcategoriesPage: React.FC = () => {
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const itemsPerPage = 10;
  const { theme, setTheme } = useTheme();

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

  const { data: subcategoryData, isLoading, error } = useFetchSubCategoriesQuery(undefined);
  const subcategories: Subcategory[] = subcategoryData?.data || [];

  const [_DELETE_SUBCATEGORY] = useDeleteSubCategoriesMutation();

  const filteredSubcategories = subcategories.filter((subcategory) =>
    Object.values(subcategory).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const totalPages = Math.ceil(filteredSubcategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedSubcategories = filteredSubcategories.slice(startIndex, startIndex + itemsPerPage);

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    try {
      const response = await _DELETE_SUBCATEGORY({ id: subcategoryId }).unwrap();
      if (response?.success) {
        toast.success("Subcategory deleted successfully");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete subcategory. Please try again.");
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Function to generate page numbers for pagination
  const generatePaginationNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show at most 5 page numbers
    
    if (totalPages <= maxPagesToShow) {
      // If total pages are less than max to show, display all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate start and end of page numbers to show
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - maxPagesToShow + 2);
      }
      
      // Add ellipsis if needed before middle pages
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed after middle pages
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always include last page if there is more than one page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header with Menu Button */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm dark:bg-gray-800 dark:text-white md:hidden">
        <button 
          onClick={toggleSidebar}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">Subcategories Management</h1>
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Sidebar - fixed position with proper scrolling */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between px-4 md:justify-end">
            <h2 className="text-xl font-bold md:hidden">Dashboard</h2>
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          
          {/* Sidebar Content - Scrollable */}
          <div className="custom-scrollbar flex-1 overflow-y-auto">
            <Sidebar />
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden" 
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto md:ml-64">
        <div className="pt-16 md:pt-0">
          <div className="container mx-auto px-4 py-6">
            <div className="mb-6 hidden items-center justify-between md:flex">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Subcategories Management</h1>
              <button
                onClick={toggleTheme}
                className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            
            <Card className="mb-6 overflow-hidden border-none bg-white shadow-xl dark:bg-gray-800 dark:text-white">
              <CardHeader className="bg-gradient-to-r from-pink-600 to-purple-800 p-4 pb-4 pt-6 sm:p-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                    Subcategories Management
                  </CardTitle>
                  <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search subcategories..."
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white/90 p-2 pl-9 text-black placeholder:text-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-700/90 dark:text-white dark:placeholder:text-gray-400 md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <svg 
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div className="w-full md:w-auto">
                      <AddSubCategoryModal />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="custom-scrollbar overflow-x-auto">
                  <Table className="w-full text-black dark:text-white">
                    <TableHeader>
                      <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                        <TableHead className="hidden py-3 text-center sm:table-cell">#</TableHead>
                        <TableHead className="py-3">Category</TableHead>
                        <TableHead className="hidden py-3 sm:table-cell">Subcategory</TableHead>
                        <TableHead className="hidden py-3 md:table-cell">Description</TableHead>
                        <TableHead className="hidden py-3 lg:table-cell">Keywords</TableHead>
                        <TableHead className="py-3 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                    {isLoading
                        ? Array.from({ length: 7 }).map((_, index) => (
                            <TableRow key={index} className="border-b border-gray-100 dark:border-gray-700">
                              <TableCell className="hidden sm:table-cell">
                                <Skeleton className="h-4 w-6 dark:bg-gray-700" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-4 w-24 dark:bg-gray-700" />
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <Skeleton className="h-4 w-24 dark:bg-gray-700" />
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Skeleton className="h-4 w-20 dark:bg-gray-700" />
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <Skeleton className="h-4 w-20 dark:bg-gray-700" />
                              </TableCell>
                              <TableCell className="flex justify-center gap-2 sm:gap-4">
                                <Skeleton className="h-6 w-6 rounded-full dark:bg-gray-700" />
                                <Skeleton className="h-6 w-6 rounded-full dark:bg-gray-700" />
                                <Skeleton className="h-6 w-6 rounded-full dark:bg-gray-700" />
                              </TableCell>
                            </TableRow>
                          )) : displayedSubcategories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-6 text-center text-gray-500 dark:text-gray-400">
                            No subcategories available. Add a new subcategory to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        displayedSubcategories.map((subcategory, index) => (
                          <TableRow key={subcategory.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                            <TableCell className="hidden text-center font-medium sm:table-cell">{startIndex + index + 1}</TableCell>
                            <TableCell>
                              <div className="sm:block">
                                <p className="font-medium">{subcategory.categoryName}</p>
                                <p className="sm:hidden mt-1 text-xs text-gray-500 dark:text-gray-400">{subcategory.subcategoryName}</p>
                                <p className="md:hidden mt-1 text-xs text-gray-500 line-clamp-1 dark:text-gray-400">{subcategory.description}</p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{subcategory.subcategoryName}</TableCell>
                            <TableCell className="hidden max-w-xs truncate md:table-cell">{subcategory.description}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex flex-wrap gap-2">
                                {subcategory.keywords.map((keyword, i) => (
                                  <span 
                                    key={i} 
                                    className="group relative inline-flex items-center overflow-hidden rounded-md bg-gradient-to-r from-pink-50 to-purple-50 px-3 py-1.5 text-xs font-medium text-purple-800 shadow-sm transition-all duration-300 hover:translate-y-[-1px] hover:shadow-md dark:from-pink-900/40 dark:to-purple-900/40 dark:text-purple-200"
                                  >
                                    <span className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                                    <span className="relative z-10 flex items-center">
                                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></span>
                                      {keyword}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600 transition-all duration-200 hover:bg-green-100 hover:text-green-700 hover:shadow-md dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 dark:hover:text-green-300"
                                  onClick={() => { setSelectedSubcategory(subcategory); setViewOpen(true); }}
                                  aria-label="View subcategory details"
                                >
                                  <Eye size={16} className="transition-transform group-hover:scale-110" />
                                  <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">View details</span>
                                </button>
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600 transition-all duration-200 hover:bg-purple-100 hover:text-purple-700 hover:shadow-md dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30 dark:hover:text-purple-300"
                                  onClick={() => { setSelectedSubcategory(subcategory); setEditOpen(true); }}
                                  aria-label="Edit subcategory"
                                >
                                  <Edit size={16} className="transition-transform group-hover:scale-110" />
                                  <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">Edit subcategory</span>
                                </button>
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                  onClick={() => handleDeleteSubcategory(subcategory._id)}
                                  aria-label="Delete subcategory"
                                >
                                  <Trash2 size={16} className="transition-transform group-hover:scale-110" />
                                  <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">Delete subcategory</span>
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

            {/* View Course Dialog */}
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
              <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-lg bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
                <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:bg-gray-800 dark:border-gray-700">
                  <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">Subcategory Details</DialogTitle>
                </DialogHeader>
                {selectedSubcategory && (
                  <div className="p-6">
                    <div className="mb-6 flex items-center justify-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-purple-600 dark:from-pink-900/30 dark:to-purple-900/30 dark:text-purple-400">
                        <span className="text-2xl font-bold">{selectedSubcategory.subcategoryName.charAt(0)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="overflow-hidden rounded-lg border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-2 dark:from-pink-900/20 dark:to-purple-900/20">
                          <h3 className="font-medium text-purple-800 dark:text-purple-300">Category Information</h3>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                          <div className="grid grid-cols-3 px-4 py-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</span>
                            <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">{selectedSubcategory.categoryName}</span>
                          </div>
                          <div className="grid grid-cols-3 px-4 py-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Subcategory</span>
                            <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">{selectedSubcategory.subcategoryName}</span>
                          </div>
                          <div className="grid grid-cols-3 px-4 py-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</span>
                            <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                              {new Date(selectedSubcategory.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="overflow-hidden rounded-lg border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-2 dark:from-pink-900/20 dark:to-purple-900/20">
                          <h3 className="font-medium text-purple-800 dark:text-purple-300">Description</h3>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-700 dark:text-gray-300">{selectedSubcategory.description}</p>
                        </div>
                      </div>
                      
                      <div className="overflow-hidden rounded-lg border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-2 dark:from-pink-900/20 dark:to-purple-900/20">
                          <h3 className="font-medium text-purple-800 dark:text-purple-300">Keywords</h3>
                        </div>
                        <div className="p-4">
                          <div className="flex flex-wrap gap-2">
                            {selectedSubcategory.keywords.map((keyword, i) => (
                              <span 
                                key={i} 
                                className="group relative inline-flex items-center overflow-hidden rounded-md bg-gradient-to-r from-pink-50 to-purple-50 px-3 py-1.5 text-xs font-medium text-purple-800 shadow-sm transition-all duration-300 hover:translate-y-[-1px] hover:shadow-md dark:from-pink-900/40 dark:to-purple-900/40 dark:text-purple-200"
                              >
                                <span className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                                <span className="relative z-10 flex items-center">
                                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></span>
                                  {keyword}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Edit Course Modal */}
            <EditSubCategoryModal
              editOpen={editOpen}
              setEditOpen={setEditOpen}
              selectedSubcategory={selectedSubcategory}
            />

            {/* Enhanced Pagination Controls */}
            <div className="mt-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-medium text-gray-700 dark:text-gray-300">{startIndex + 1}</span> to{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {Math.min(startIndex + itemsPerPage, filteredSubcategories.length)}
                  </span>{" "}
                  of <span className="font-medium text-gray-700 dark:text-gray-300">{filteredSubcategories.length}</span> subcategories
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 rounded-md bg-purple-50 p-0 text-purple-600 transition-colors hover:bg-purple-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="hidden sm:flex sm:items-center sm:space-x-1">
                    {generatePaginationNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-1 text-gray-400 dark:text-gray-500">...</span>
                      ) : (
                        <Button
                          key={`page-${page}`}
                          onClick={() => setCurrentPage(Number(page))}
                          className={`h-8 w-8 rounded-md p-0 text-sm font-medium ${
                            currentPage === page
                              ? "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
                              : "bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30"
                          }`}
                          aria-label={`Page ${page}`}
                          aria-current={currentPage === page ? "page" : undefined}
                        >
                          {page}
                        </Button>
                      )
                    ))}
                  </div>
                  
                  {/* Mobile Page Indicator */}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:hidden">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-8 w-8 rounded-md bg-purple-50 p-0 text-purple-600 transition-colors hover:bg-purple-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Jump to page (desktop only) */}
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
                    className="h-8 w-16 rounded-md border-gray-300 text-center text-sm dark:border-gray-700 dark:bg-gray-800"
                    aria-label="Go to page"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Custom Scrollbar Styling */}
      <style jsx global>{`
        body {
          overflow: hidden;
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

export default SubcategoriesPage;