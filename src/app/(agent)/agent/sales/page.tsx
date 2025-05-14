"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Menu, X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTheme } from "next-themes";
import Navbar from "@/components/Layout/Navbar";
import { useFetchAgentSalesQuery } from "@/services/api";

// Define CourseSale type based on API response
interface CourseSale {
  id: string;
  courseName: string;
  studentName: string;
  saleDate: string;
  amount: number;
  status: "SUCCESS" | "PENDING";
}

export default function SalesHistory() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sortField, setSortField] = useState<keyof CourseSale | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionFilter, setTransactionFilter] = useState<"all" | "completed" | "pending">("all");
  const { theme } = useTheme();

  // Fetch data using RTK Query
  const { data: salesData, isLoading, error } = useFetchAgentSalesQuery(undefined);

  // Map API data to CourseSale format
  const courseSales: CourseSale[] = salesData?.data?.all?.map((tx: any) => ({
    id: tx._id,
    courseName: tx.courseId?.courseName || "Unknown Course",
    studentName: tx.userId?.name || "Unknown Student",
    saleDate: tx.createdAt,
    amount: tx.amount || 0,
    status: tx.status === "SUCCESS" ? "SUCCESS" : "PENDING",
  })) || [];

  // Filter transactions based on user selection
  const filteredByStatus = courseSales.filter((sale) => {
    if (transactionFilter === "all") return true;
    return transactionFilter === "completed" ? sale.status === "SUCCESS" : sale.status === "PENDING";
  });

  const salesPerPage = 5;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSort = (field: keyof CourseSale) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredSales = filteredByStatus.filter((sale) =>
    Object.values(sale).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const sortedSales = [...filteredSales].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (sortField === "amount") {
      return sortOrder === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
    }
    return sortOrder === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const totalPages = Math.ceil(sortedSales.length / salesPerPage);
  const displayedSales = sortedSales.slice(
    (currentPage - 1) * salesPerPage,
    currentPage * salesPerPage,
  );

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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-800 dark:text-white">Loading sales data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400">Error fetching sales data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="z-10 w-full">
        <Navbar />
      </div>

      <div className="fixed left-0 top-0 z-[100] flex h-16 w-16 items-center justify-center md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-full p-2"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed md:static md:translate-x-0 transition-transform duration-300 ease-in-out`}
        >
          <Sidebar userRole="agent" />
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white pl-16 md:pl-0">
              Sales History
            </h1>
          </div>

          <Card className="dark:bg-gray-800">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-800 p-4 pb-4 pt-6 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Course Sales
                </CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                  <Input
                    type="text"
                    placeholder="Search sales..."
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 dark:text-white md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setTransactionFilter("all")}
                      className={`h-10 ${transactionFilter === "all" ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-600"}`}
                    >
                      All
                    </Button>
                    <Button
                      onClick={() => setTransactionFilter("completed")}
                      className={`h-10 ${transactionFilter === "completed" ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-600"}`}
                    >
                      Completed
                    </Button>
                    <Button
                      onClick={() => setTransactionFilter("pending")}
                      className={`h-10 ${transactionFilter === "pending" ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-600"}`}
                    >
                      Pending
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="w-full text-black dark:text-white">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                      <TableHead className="hidden py-3 text-center sm:table-cell">
                        #
                      </TableHead>
                      <TableHead
                        className="cursor-pointer py-3"
                        onClick={() => handleSort("courseName")}
                      >
                        <div className="flex items-center">
                          Course Name
                          {sortField === "courseName" && (
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
                        onClick={() => handleSort("studentName")}
                      >
                        <div className="flex items-center">
                          Student Name
                          {sortField === "studentName" && (
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
                        onClick={() => handleSort("saleDate")}
                      >
                        <div className="flex items-center">
                          Sale Date
                          {sortField === "saleDate" && (
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
                        className="cursor-pointer py-3"
                        onClick={() => handleSort("amount")}
                      >
                        <div className="flex items-center">
                          Amount
                          {sortField === "amount" && (
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
                        className="cursor-pointer py-3"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Status
                          {sortField === "status" && (
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedSales.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-6 text-center text-gray-500"
                        >
                          No sales found. Try a different search term or filter.
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedSales.map((sale, index) => (
                        <TableRow
                          key={sale.id}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <TableCell className="hidden text-center font-medium sm:table-cell">
                            {(currentPage - 1) * salesPerPage + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="sm:block">
                              <p className="font-medium">{sale.courseName}</p>
                              <p className="mt-1 text-xs text-gray-500 md:hidden">
                                {sale.studentName}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 sm:hidden">
                                {new Date(sale.saleDate).toLocaleDateString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {sale.studentName}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {new Date(sale.saleDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>₹{sale.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                                sale.status === "SUCCESS"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                              }`}
                            >
                              {sale.status === "SUCCESS" ? "Completed" : "Pending"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {(currentPage - 1) * salesPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {Math.min(currentPage * salesPerPage, sortedSales.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {sortedSales.length}
                </span>{" "}
                sales
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="h-8 w-8 rounded-md bg-teal-50 p-0 text-teal-600 transition-colors hover:bg-teal-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
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
                        className={`h-8 w-8 rounded-md p-0 text-sm font-medium ${
                          currentPage === page
                            ? "bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800"
                            : "bg-teal-50 text-teal-600 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30"
                        }`}
                        aria-label={`Page ${page}`}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    ),
                  )}
                </div>

                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:hidden">
                  Page {currentPage} of {totalPages || 1}
                </span>

                <Button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, totalPages || 1),
                    )
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="h-8 w-8 rounded-md bg-teal-50 p-0 text-teal-600 transition-colors hover:bg-teal-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="hidden items-center space-x-2 lg:flex">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Go to page:
                </span>
                <Input
                  type="number"
                  min={1}
                  max={totalPages || 1}
                  value={currentPage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 1 && value <= totalPages) {
                      setCurrentPage(value);
                    }
                  }}
                  className="h-8 w-16 rounded-md border-gray-300 text-center text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  aria-label="Go to page"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}