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
  ChevronUp,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useDeleteAgentMutation,
  useFetchUsersQuery,
} from "../../../services/api";
import AddAgentModal from "../../../components/Agent/AddAgent";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminSkeletonWrapper } from "@/components/ui/admin-skeleton-wrapper";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Define Agent type
interface Users {
  id: number;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
}

const UserPage: React.FC = () => {
  const [sortField, setSortField] = useState<keyof Users | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const agentsPerPage = 10;
  const { data: userData, isLoading, refetch } = useFetchUsersQuery(undefined);
  const [deleteAgent] = useDeleteAgentMutation();
  const users: Users[] = userData?.data || [];
  const startIndex = (currentPage - 1) * agentsPerPage;

  const handleSort = (field: keyof Users) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortField) return 0;
    return sortOrder === "asc"
      ? a[sortField] > b[sortField]
        ? 1
        : -1
      : a[sortField] < b[sortField]
        ? 1
        : -1;
  });

  const totalPages = Math.ceil(sortedUsers.length / agentsPerPage);
  const displayedUsers = sortedUsers.slice(
    (currentPage - 1) * agentsPerPage,
    currentPage * agentsPerPage,
  );

  // Handle Edit
  const handleEdit = (user: Users) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    try {
      await deleteAgent(id);
      refetch();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Handle View
  const handleView = (user: Users) => {
    setSelectedUser(user);
    setViewOpen(true);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
    <div className="flex min-h-screen flex-col bg-gray-50 overflow-hidden">
      {/* Mobile Header with Menu Button */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
        <button 
          onClick={toggleSidebar}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">User Management</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
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

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto  pt-16 md:ml-64">
          <div className="container mx-auto px-4 py-6">
            <Card className="mb-6 overflow-hidden border-none bg-white shadow-md">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-800 p-4 pb-4 pt-6 sm:p-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                    User Management
                  </CardTitle>
                  <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                    <Input
                      type="text"
                      placeholder="Search users..."
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 md:w-64"
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
                        <TableHead className="hidden py-3 text-center sm:table-cell">#</TableHead>
                        <TableHead 
                          className="cursor-pointer py-3"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center">
                            Full Name
                            {sortField === "name" && (
                              <span className="ml-1">
                                {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="hidden cursor-pointer py-3 md:table-cell"
                          onClick={() => handleSort("email")}
                        >
                          <div className="flex items-center">
                            Email
                            {sortField === "email" && (
                              <span className="ml-1">
                                {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="hidden cursor-pointer py-3 sm:table-cell"
                          onClick={() => handleSort("mobile")}
                        >
                          <div className="flex items-center">
                            Contact
                            {sortField === "mobile" && (
                              <span className="ml-1">
                                {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="py-3 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading
                        ? Array.from({ length: 7 }).map((_, index) => (
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
                              <TableCell className="hidden sm:table-cell">
                                <Skeleton className="h-4 w-20" />
                              </TableCell>
                              <TableCell className="flex justify-center gap-2 sm:gap-4">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-6 w-6 rounded-full" />
                              </TableCell>
                            </TableRow>
                          ))
                        : displayedUsers.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="py-6 text-center text-gray-500">
                                No users found. Try a different search term.
                              </TableCell>
                            </TableRow>
                          ) : (
                            displayedUsers.map((user, index) => (
                              <TableRow
                                key={user.id}
                                className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                              >
                                <TableCell className="hidden text-center font-medium sm:table-cell">{startIndex + index + 1}</TableCell>
                                <TableCell>
                                  <div className="sm:block">
                                    <p className="font-medium">{user.name}</p>
                                    <p className="md:hidden mt-1 text-xs text-gray-500">{user.email}</p>
                                    <p className="sm:hidden mt-1 text-xs text-gray-500">{user.mobile}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                                <TableCell className="hidden sm:table-cell">{user.mobile}</TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal-600 transition-all duration-200 hover:bg-teal-100 hover:text-teal-700 hover:shadow-md dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30 dark:hover:text-teal-300"
                                      onClick={() => handleView(user)}
                                      aria-label="View user details"
                                    >
                                      <Eye size={16} className="transition-transform group-hover:scale-110" />
                                      <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">View details</span>
                                    </button>
                                    <button
                                      className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-all duration-200 hover:bg-emerald-100 hover:text-emerald-700 hover:shadow-md dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300"
                                      onClick={() => handleEdit(user)}
                                      aria-label="Edit user"
                                    >
                                      <Edit size={16} className="transition-transform group-hover:scale-110" />
                                      <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">Edit user</span>
                                    </button>
                                    <button
                                      className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                      onClick={() => handleDelete(user.id)}
                                      aria-label="Delete user"
                                    >
                                      <Trash2 size={16} className="transition-transform group-hover:scale-110" />
                                      <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">Delete user</span>
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

            {/* View User Dialog */}
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
              <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-lg bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
                <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:bg-gray-800 dark:border-gray-700">
                  <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">User Details</DialogTitle>
                </DialogHeader>
                {selectedUser ? (
                  <div className="p-6">
                    <div className="mb-6 flex items-center justify-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-600 dark:from-teal-900/30 dark:to-emerald-900/30 dark:text-teal-400">
                        <span className="text-2xl font-bold">{selectedUser.name.charAt(0)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="overflow-hidden rounded-lg border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-2 dark:from-teal-900/20 dark:to-emerald-900/20">
                          <h3 className="font-medium text-teal-800 dark:text-teal-300">Personal Information</h3>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                          <div className="grid grid-cols-3 px-4 py-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</span>
                            <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">{selectedUser.name}</span>
                          </div>
                          <div className="grid grid-cols-3 px-4 py-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</span>
                            <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200 break-all">{selectedUser.email}</span>
                          </div>
                          <div className="grid grid-cols-3 px-4 py-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact</span>
                            <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">{selectedUser.mobile}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="overflow-hidden rounded-lg border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-2 dark:from-teal-900/20 dark:to-emerald-900/20">
                          <h3 className="font-medium text-teal-800 dark:text-teal-300">Account Information</h3>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                          <div className="grid grid-cols-3 px-4 py-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</span>
                            <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">{selectedUser.id}</span>
                          </div>
                          <div className="grid grid-cols-3 px-4 py-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</span>
                            <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                              {new Date(selectedUser.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center">
                    <p className="text-center text-gray-500 dark:text-gray-400">No user selected.</p>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Enhanced Pagination Controls */}
            <div className="mt-6 rounded-lg bg-white p-4 shadow-md">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-700">{startIndex + 1}</span> to{" "}
                  <span className="font-medium text-gray-700">
                    {Math.min(startIndex + agentsPerPage, sortedUsers.length)}
                  </span>{" "}
                  of <span className="font-medium text-gray-700">{sortedUsers.length}</span> users
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 rounded-md bg-teal-50 p-0 text-teal-600 transition-colors hover:bg-teal-100 disabled:bg-gray-50 disabled:text-gray-400"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="hidden sm:flex sm:items-center sm:space-x-1">
                    {generatePaginationNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-1 text-gray-400">...</span>
                      ) : (
                        <Button
                          key={`page-${page}`}
                          onClick={() => setCurrentPage(Number(page))}
                          className={`h-8 w-8 rounded-md p-0 text-sm font-medium ${
                            currentPage === page
                              ? "bg-teal-600 text-white hover:bg-teal-700"
                              : "bg-teal-50 text-teal-600 hover:bg-teal-100"
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
                  <span className="text-sm font-medium text-gray-700 sm:hidden">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-8 w-8 rounded-md bg-teal-50 p-0 text-teal-600 transition-colors hover:bg-teal-100 disabled:bg-gray-50 disabled:text-gray-400"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Jump to page (desktop only) */}
                <div className="hidden items-center space-x-2 lg:flex">
                  <span className="text-sm text-gray-500">Go to page:</span>
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
                    className="h-8 w-16 rounded-md border-gray-300 text-center text-sm"
                    aria-label="Go to page"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      

      {/* Custom Scrollbar Styling */}
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

      {isModalOpen && (
        <AddAgentModal open={isModalOpen} setOpen={setIsModalOpen} />
      )}
    </div>
  );
};

export default UserPage;
