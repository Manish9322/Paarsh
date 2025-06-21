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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useDeleteUserMutation,
  useFetchCourcesQuery,
  useFetchUsersQuery,
  useFetchTransactionsQuery,

} from "../../../services/api";
import AddAgentModal from "../../../components/Agent/AddAgent";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminSkeletonWrapper } from "@/components/ui/admin-skeleton-wrapper";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RxCross2 } from "react-icons/rx";
import { toast } from "sonner";
import EditUserModal from "../../../components/User/EditUser";

// Define Users interface first
interface Users {
  _id: string;
  id: number;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
}

// Update the interface at the top of the file
interface CourseEnrollment {
  userId: string;
  enrollmentDate: string; // ISO date string
}

interface Course {
  _id: string;
  courseName: string;
  price: string;
  duration: string;
  level: string;
  enrolledUsers: {
    userId: string;
    enrollmentDate: string;
  }[];
  // ... other course properties
}

const UserPage: React.FC = () => {
  const [sortField, setSortField] = useState<keyof Users | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState<number | "all">(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);


  const { data: coursesData } = useFetchCourcesQuery(undefined);
  console.log("CourseData on User Management : ", coursesData);

  const agentsPerPage = 10;
  const { data: userData, isLoading, error } = useFetchUsersQuery(undefined);
  console.log("UserData on User Management : ", userData);
  const [_DELETEUSER, { isLoading: isDeleteLoading }] = useDeleteUserMutation();

  const users = userData?.data || [];
  const startIndex = usersPerPage === "all" ? 0 : (currentPage - 1) * usersPerPage;


  const { data: transactionsData } = useFetchTransactionsQuery(undefined);
  console.log("All Transactions Data:", transactionsData);

  const handleSort = (field: keyof Users) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Safe filtering that handles undefined/null values
  const filteredUsers = users.filter((user) => {
    if (!user) return false;
    return Object.entries(user).some(([key, value]) => {
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Safe sorting with proper type checking
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (aValue === undefined || bValue === undefined) return 0;

    const comparison =
      sortOrder === "asc"
        ? aValue.toString().localeCompare(bValue.toString())
        : bValue.toString().localeCompare(aValue.toString());

    return comparison;
  });

  const totalPages = usersPerPage === "all" ? 1 : Math.ceil(sortedUsers.length / usersPerPage);
  const displayedUsers = usersPerPage === "all"
    ? sortedUsers
    : sortedUsers.slice(
      (currentPage - 1) * usersPerPage,
      currentPage * usersPerPage
    );

  const handleEdit = (user: Users) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const confirmDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteUser = async () => {
    try {
      if (!userToDelete) return;
      const response = await _DELETEUSER({ id: userToDelete }).unwrap();

      if (response?.success) {
        toast.success("User deleted successfully");
        setDeleteConfirmOpen(false);
        setUserToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(
        error?.data?.message || "Failed to Delete the user. Please try again."
      );
    }
  };

  const handleView = (user: Users) => {
    setSelectedUser(user);
    setViewOpen(true);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
        pageNumbers.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);



  return (
    <div className="flex min-h-screen flex-col overflow-hidden  bg-gray-50 dark:bg-gray-900">
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

      <main className="flex-1 overflow-y-auto  pt-16 md:ml-64">
        <div className="container mx-auto px-4 py-6">
          <Card className="mb-6 overflow-hidden border-none  bg-white  shadow-md dark:bg-gray-800 dark:text-white">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  User Management
                </CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                  <Input
                    type="text"
                    placeholder="Search users..."
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 dark:text-black md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="w-full text-black dark:text-white">
                  <TableHeader>
                    <TableRow className="border-b  border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                      <TableHead className="hidden py-3 text-center sm:table-cell">
                        #
                      </TableHead>
                      <TableHead
                        className="cursor-pointer py-3"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center">
                          Full Name
                          {sortField === "name" && (
                            <span className="ml-1">
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
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
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
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
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="py-3 text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 7 }).map((_, index) => (
                        <TableRow
                          key={index}
                          className="border-b border-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
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
                    ) : error ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-6 text-center text-red-500"
                        >
                          Failed to load users. Please try again later.
                        </TableCell>
                      </TableRow>
                    ) : displayedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-6 text-center text-gray-500"
                        >
                          No users found. Try a different search term.
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedUsers.map((user, index) => (
                        <TableRow
                          key={user.id}
                          className="border-b  border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <TableCell className="hidden text-center font-medium sm:table-cell">
                            {startIndex + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="sm:block">
                              <p className="font-medium">{user.name}</p>
                              <p className="mt-1 text-xs text-gray-500 md:hidden">
                                {user.email}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 sm:hidden">
                                {user.mobile}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {user.email}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {user.mobile}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                onClick={() => handleView(user)}
                                aria-label="View user details"
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
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setEditOpen(true);
                                }}
                                aria-label="Edit user"
                              >
                                <Edit
                                  size={16}
                                  className="transition-transform group-hover:scale-110"
                                />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  Edit user
                                </span>
                              </button>
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                onClick={() => confirmDeleteUser(user._id)}
                                aria-label="Delete user"
                              >
                                <Trash2
                                  size={16}
                                  className="transition-transform group-hover:scale-110"
                                />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  Delete user
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

          <Dialog open={viewOpen} onOpenChange={setViewOpen}>
            <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-lg bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
              <DialogHeader className="sticky top-0 z-10 border-b  bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                    User Details
                  </DialogTitle>
                  <RxCross2
                    className="text-gray-800 dark:text-white"
                    size={20}
                    onClick={() => setViewOpen(false)}
                  />
                </div>
              </DialogHeader>
              {selectedUser ? (
                <div className="p-6">
                  <div className="mb-6 flex items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-blue-100 text-blue-600 dark:from-blue-900/30 dark:to-blue-900/30 dark:text-blue-400">
                      <span className="text-2xl font-bold">
                        {selectedUser.name.charAt(0)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-lg border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                        <h3 className="font-medium text-blue-800 dark:text-blue-300">
                          Personal Information
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        <div className="grid grid-cols-3 px-4 py-3">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Full Name
                          </span>
                          <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                            {selectedUser.name}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 px-4 py-3">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Email
                          </span>
                          <span className="col-span-2 break-all text-sm text-gray-900 dark:text-gray-200">
                            {selectedUser.email}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 px-4 py-3">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Contact
                          </span>
                          <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                            {selectedUser.mobile}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                        <h3 className="font-medium text-blue-800 dark:text-blue-300">
                          Enrolled Courses
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {coursesData?.data?.filter(course =>
                          course.enrolledUsers?.includes(selectedUser?._id)
                        ).length > 0 ? (
                          coursesData?.data?.filter(course =>
                            course.enrolledUsers?.includes(selectedUser?._id)
                          ).map((course, index) => {
                            // Find the transaction for this course and user
                            const transaction = transactionsData?.data?.find(
                              t => t.courseId?._id === course._id && t.userId?._id === selectedUser._id
                            );

                            return (
                              <div key={index} className="space-y-2 px-4 py-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Course {index + 1}
                                  </span>
                                  <span className="text-xs text-gray-500 font-semibold dark:text-gray-400">
                                    {course.price === "1" ? `₹ 1` : `₹ ${course.price}`}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <span className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                                    {course.courseName}
                                  </span>
                                  {transaction ? (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Purchased on: {new Date(transaction.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                      Purchase date not available
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-4 py-3">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              No courses enrolled yet.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                        <h3 className="font-medium text-blue-800 dark:text-blue-300">
                          Account Information
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        <div className="grid grid-cols-3 px-4 py-3">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Created At
                          </span>
                          <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                            {new Date(
                              selectedUser.createdAt
                            ).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    No user selected.
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>

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
                  Are you sure you want to delete this User? This action cannot
                  be undone.
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
                  onClick={handleDeleteUser}
                  className="w-full sm:w-auto"
                  disabled={isDeleteLoading}
                >
                  {isDeleteLoading ? "Deleting..." : "Delete User"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="mt-6 rounded-lg bg-white  p-4 shadow-md dark:bg-gray-800 dark:text-white">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-sm text-gray-500  dark:text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-700  dark:text-gray-300">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-700  dark:text-gray-300">
                  {Math.min(startIndex + agentsPerPage, sortedUsers.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700  dark:text-gray-300">
                  {sortedUsers.length}
                </span>{" "}
                users

                <div className="flex items-center space-x-2 pt-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                  <Select
                    value={usersPerPage.toString()}
                    onValueChange={(value) => {
                      setUsersPerPage(value === "all" ? "all" : parseInt(value));
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

              </div>

              <div className="flex items-center space-x-1">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="h-8 w-8 rounded-md bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400  dark:bg-blue-900/20  dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="hidden sm:flex sm:items-center sm:space-x-1">
                  {generatePaginationNumbers().map((page, index) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-1 text-gray-400"
                      >
                        ...
                      </span>
                    ) : (
                      <Button
                        key={`page-${page}`}
                        onClick={() => setCurrentPage(Number(page))}
                        className={`h-8 w-8 rounded-md p-0 text-sm font-medium ${currentPage === page
                          ? "bg-blue-600 text-white hover:bg-blue-700  dark:bg-blue-700 dark:hover:bg-blue-800"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100  dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                          }`}
                        aria-label={`Page ${page}`}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>

                <span className="text-sm font-medium text-gray-700  dark:text-gray-300 sm:hidden">
                  Page {currentPage} of {totalPages || 1}
                </span>

                <Button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, totalPages || 1)
                    )
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="h-8 w-8 rounded-md bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400  dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="hidden items-center space-x-2 lg:flex">
                <span className="text-sm text-gray-500  dark:text-gray-400">
                  Go to page:
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
                  className="h-8 w-16 rounded-md border-gray-300 text-center text-sm  dark:border-gray-700 dark:bg-gray-800"
                  aria-label="Go to page"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

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

      <EditUserModal
        editOpen={editOpen}
        setEditOpen={setEditOpen}
        selectedUser={selectedUser}
      />
    </div>
  );
};

export default UserPage;
