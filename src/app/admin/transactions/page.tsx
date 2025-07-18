"use client";

import { useCallback, useState } from "react";
import { Menu, ChevronLeft, ChevronRight, Eye } from "lucide-react";
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
} from "@/components/ui/dialog";
import Sidebar from "@/components/Sidebar/Sidebar";
import {
  useFetchTransactionsQuery,
  useFetchCourcesQuery,
  useFetchUsersQuery,
  useGrantManualCourseAccessMutation,
} from "@/services/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TransactionsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage, setTransactionsPerPage] = useState<number | "all">(10);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState({
    status: "",
    minAmount: "",
    maxAmount: "",
    date: "",
  });

  const {
    data: transactionsData,
    isLoading,
    error: fetchError,
    refetch,
  } = useFetchTransactionsQuery(undefined);
  const { data: coursesData } = useFetchCourcesQuery(undefined);
  const { data: usersData } = useFetchUsersQuery(undefined);

  const [_GRANTMANUALACCESS, { isLoading: isGrantLoading }] =
    useGrantManualCourseAccessMutation();


  const transactions = transactionsData?.data || [];

  const getCourseDetails = useCallback(
    (courseId: string) => {
      if (!coursesData?.data || !courseId) return null;
      return coursesData.data.find((course: any) => course._id === courseId);
    },
    [coursesData],
  );

  const getUserDetails = useCallback(
    (userId: string) => {
      if (!usersData?.data || !userId) return null;
      return usersData.data.find((user: any) => user._id === userId);
    },
    [usersData],
  );

  // Handle granting manual access
  const handleGrantAccess = async (transactionId: string) => {
    try {
      const adminNote = "Manual access granted due to redirect issue";

      const response = await _GRANTMANUALACCESS({ transactionId, adminNote }).unwrap();

      const data = response?.data;

      if (response?.success) {
        toast.success("✅ Course access granted successfully!");
        refetch(); // Refresh transactions to update status
        setPreviewOpen(false); // Close modal if open
      } else {
        toast.error(data?.error || "❌ Failed to grant access");
      }
    } catch (err: any) {
      const errorMessage =
        err?.data?.error || err?.message || "❌ An unexpected error occurred";

      toast.error(errorMessage);
    }
  };


  // Filter transactions based on search term and active filters
  const filteredTransactions = transactions.filter((transaction: any) => {
    const searchFields = [
      transaction.orderId,
      getUserDetails(transaction.userId)?._id?.name,
      getCourseDetails(transaction.courseId)?._id?.courseName,
      transaction.status,
      transaction.amount?.toString(),
    ];

    const matchesSearch = searchFields.some((field) =>
      field?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (!matchesSearch) return false;

    if (activeFilters.status && transaction.status !== activeFilters.status) {
      return false;
    }

    if (
      activeFilters.minAmount &&
      transaction.amount < parseInt(activeFilters.minAmount)
    ) {
      return false;
    }

    if (
      activeFilters.maxAmount &&
      transaction.amount > parseInt(activeFilters.maxAmount)
    ) {
      return false;
    }

    if (activeFilters.date) {
      const transactionDate = new Date(transaction.createdAt)
        .toISOString()
        .split("T")[0];
      if (transactionDate !== activeFilters.date) {
        return false;
      }
    }

    return true;
  });

  const totalPages = transactionsPerPage === "all" ? 1 : Math.ceil(filteredTransactions.length / transactionsPerPage);
  const startIndex = transactionsPerPage === "all" ? 0 : (currentPage - 1) * transactionsPerPage;
  const displayedTransactions = transactionsPerPage === "all"
    ? filteredTransactions
    : filteredTransactions.slice(
      startIndex,
      startIndex + transactionsPerPage
    );

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

  const handlePreview = (transaction: any) => {
    setSelectedTransaction(transaction);
    setPreviewOpen(true);
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (fetchError) {
    return <div>Error: {fetchError.toString()}</div>;
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
        <h1 className="text-lg font-bold text-gray-800">
          Transaction management
        </h1>
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
                  Transactions
                </CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                  <Input
                    type="text"
                    placeholder="Search transactions..."
                    className="h-10 w-full rounded border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <div className="mb-6 grid gap-4 md:grid-cols-3">
                {/* Total Revenue Card */}
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
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Revenue
                        </h3>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          ₹
                          {transactions
                            .reduce(
                              (sum, tx) =>
                                sum + (tx.status === "SUCCESS" ? tx.amount : 0),
                              0,
                            )
                            .toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Transactions Card */}
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
                          Total Transactions
                        </h3>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          {transactions.length.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Successful Transactions Card */}
                <div className="overflow-hidden rounded-md bg-white shadow transition-all hover:shadow-md dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                          <svg
                            className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
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
                          Successful Transactions
                        </h3>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          {transactions
                            .filter((tx) => tx.status === "SUCCESS")
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
                    className="text-md w-full rounded-md border p-2 dark:bg-gray-800"
                    value={activeFilters.status}
                    onChange={(e) =>
                      handleFilterChange({
                        ...activeFilters,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Min Amount"
                    value={activeFilters.minAmount}
                    onChange={(e) =>
                      handleFilterChange({
                        ...activeFilters,
                        minAmount: e.target.value,
                      })
                    }
                    className="w-full dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Max Amount"
                    value={activeFilters.maxAmount}
                    onChange={(e) =>
                      handleFilterChange({
                        ...activeFilters,
                        maxAmount: e.target.value,
                      })
                    }
                    className="w-full dark:bg-gray-800 dark:text-white"
                  />
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
                    className="w-full dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="no-scrollbar overflow-x-auto">
                <Table className="w-full text-black dark:text-white">
                  <TableHeader>
                    <TableRow className="border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                      <TableHead className="hidden py-3 text-center sm:table-cell">
                        #
                      </TableHead>
                      <TableHead className="py-3">Order ID</TableHead>
                      <TableHead className="hidden py-3 md:table-cell">
                        User Name
                      </TableHead>
                      <TableHead className="hidden py-3 sm:table-cell">
                        Course
                      </TableHead>
                      <TableHead className="py-3">Amount</TableHead>
                      <TableHead className="hidden py-3 sm:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="hidden py-3 md:table-cell">
                        Date
                      </TableHead>
                      <TableHead className="py-3 text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedTransactions.length > 0 ? (
                      displayedTransactions.map(
                        (transaction: any, index: number) => (
                          <TableRow
                            key={transaction._id}
                            className="border-b dark:text-white border-gray-100 transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-800"
                          >
                            <TableCell className="hidden text-center font-medium sm:table-cell">
                              {startIndex + index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="sm:block">
                                <p className="font-medium">
                                  {transaction.orderId}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 md:hidden">
                                  {transaction.userId?.name}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 sm:hidden">
                                  ₹{transaction.amount}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {transaction.userId?.name}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {transaction.courseId?.courseName}
                            </TableCell>
                            <TableCell>₹{transaction.amount}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${transaction.status === "SUCCESS"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : transaction.status === "FAILED"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  }`}
                              >
                                {transaction.status}
                              </span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {formatDate(transaction.createdAt)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                  onClick={() => handlePreview(transaction)}
                                  aria-label="View transaction details"
                                >
                                  <Eye
                                    size={16}
                                    className="transition-transform group-hover:scale-110"
                                  />
                                  <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                    View details
                                  </span>
                                </button>
                                {transaction.status === "PENDING" && (
                                  <button
                                    className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600 transition-all duration-200 hover:bg-green-100 hover:text-green-700 hover:shadow-md dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 dark:hover:text-green-300"
                                    onClick={() =>
                                      handleGrantAccess(transaction._id)
                                    }
                                    aria-label="Grant course access"
                                  >
                                    <svg
                                      className="h-4 w-4"
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
                                    <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                      Grant Access
                                    </span>
                                  </button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ),
                      )
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
                              <p className="text-base font-medium">
                                No transactions found
                              </p>
                              <p className="text-sm">
                                {searchTerm ||
                                  Object.values(activeFilters).some(Boolean)
                                  ? "Try adjusting your search or filter criteria"
                                  : "No transactions available"}
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

          {/* Preview Modal */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="no-scrollbar max-h-[90vh] max-w-md overflow-y-auto rounded-md bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
              <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                    Transaction Details
                  </DialogTitle>
                  <RxCross2
                    className="text-gray-800 dark:text-white"
                    size={20}
                    onClick={() => setPreviewOpen(false)}
                  />
                </div>
              </DialogHeader>
              {selectedTransaction ? (
                <div className="space-y-6 p-6">
                  {/* Transaction Information */}
                  <div className="overflow-hidden rounded-md border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                      <h3 className="font-medium text-blue-800 dark:text-blue-300">
                        Transaction Information
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Order ID
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                          {selectedTransaction.orderId}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Amount
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                          ₹{selectedTransaction.amount}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Status
                        </span>
                        <span className="col-span-2 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${selectedTransaction.status === "SUCCESS"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : selectedTransaction.status === "FAILED"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              }`}
                          >
                            {selectedTransaction.status}
                          </span>
                        </span>
                      </div>
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Date
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                          {new Date(
                            selectedTransaction.createdAt,
                          ).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* User Information */}
                  <div className="overflow-hidden rounded-md border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                      <h3 className="font-medium text-blue-800 dark:text-blue-300">
                        User Information
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Name
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                          {getUserDetails(selectedTransaction.userId)?._id
                            ?.name || selectedTransaction.userId?.name}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Email
                        </span>
                        <span className="col-span-2 break-all text-sm text-gray-900 dark:text-gray-200">
                          {getUserDetails(selectedTransaction.userId)?._id
                            ?.email || selectedTransaction.userId?.email}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Mobile
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                          {getUserDetails(selectedTransaction.userId)?._id
                            ?.mobile ||
                            selectedTransaction.userId?.mobile ||
                            "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course Information */}
                  <div className="overflow-hidden rounded-md border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-2 dark:from-blue-900/20 dark:to-blue-900/20">
                      <h3 className="font-medium text-blue-800 dark:text-blue-300">
                        Course Information
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Course Name
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                          {getCourseDetails(selectedTransaction.courseId)?._id
                            ?.courseName ||
                            selectedTransaction.courseId?.courseName}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Level
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                          {getCourseDetails(selectedTransaction.courseId)?._id
                            ?.level || "N/A"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Duration
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                          {getCourseDetails(selectedTransaction.courseId)?._id
                            ?.duration || "N/A"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 px-4 py-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Price
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                          ₹
                          {getCourseDetails(selectedTransaction.courseId)?._id
                            ?.price || selectedTransaction.courseId?.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grant Access Button in Modal */}
                  {selectedTransaction.status === "PENDING" && (
                    <div className="flex justify-end">
                      <Button
                        onClick={() =>
                          handleGrantAccess(selectedTransaction._id)
                        }
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        Grant Course Access
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    No transaction selected.
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
                  {transactionsPerPage === "all" ? 1 : startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {transactionsPerPage === "all" ? filteredTransactions.length : Math.min(startIndex + transactionsPerPage, filteredTransactions.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {filteredTransactions.length}
                </span>{" "}
                transactions

                <div className="flex items-center space-x-2 pt-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                  <Select
                    value={transactionsPerPage.toString()}
                    onValueChange={(value) => {
                      setTransactionsPerPage(value === "all" ? "all" : parseInt(value));
                      setCurrentPage(1); // Reset to first page when changing entries per page
                    }}
                  >
                    <SelectTrigger className="h-8 w-24 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800">
                      <SelectValue placeholder="Entries" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white">
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="h-8 w-8 rounded-md bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="hidden items-center space-x-2 lg:flex">
                <span className="text-sm text-gray-500 dark:text-gray-400">Go to page :</span>
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

export default TransactionsPage;
