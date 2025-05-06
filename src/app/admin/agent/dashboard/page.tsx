"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Navbar from "@/components/Navbar/Navbar";
import {
  Users,
  CheckCircle,
  DollarSign,
  Clock,
  TrendingUp,
  Menu,
  X,
  BarChart3,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Link,
  Copy,
  Share,
} from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useFetchAgentStatsQuery } from "../../../../services/api"; // Hypothetical query

// Define CourseSale type
interface CourseSale {
  id: string;
  courseName: string;
  studentName: string;
  saleDate: string;
  amount: number;
  status: "Completed" | "Pending" | "Refunded";
}

// Define Course type for referral links
interface Course {
  id: string;
  courseName: string;
  referralLink: string;
}

export default function AgentDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sortField, setSortField] = useState<keyof CourseSale | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { theme } = useTheme();

  const { data: agentStats, isLoading: statsLoading, error: statsError } = useFetchAgentStatsQuery(undefined);

  // Mock course sales data (replace with actual API query in production)
  const courseSales: CourseSale[] = [
    {
      id: "1",
      courseName: "Web Development Bootcamp",
      studentName: "John Doe",
      saleDate: "2025-04-15",
      amount: 199.99,
      status: "Completed",
    },
    {
      id: "2",
      courseName: "Data Science Fundamentals",
      studentName: "Jane Smith",
      saleDate: "2025-04-20",
      amount: 149.99,
      status: "Pending",
    },
    {
      id: "3",
      courseName: "UI/UX Design Masterclass",
      studentName: "Alice Johnson",
      saleDate: "2025-04-25",
      amount: 179.99,
      status: "Completed",
    },
    {
      id: "4",
      courseName: "Python for Beginners",
      studentName: "Bob Williams",
      saleDate: "2025-04-28",
      amount: 99.99,
      status: "Refunded",
    },
  ];

  // Mock course data with referral links (replace with actual API query in production)
  const courses: Course[] = [
    {
      id: "1",
      courseName: "Web Development Bootcamp",
      referralLink: "https://example.com/course/web-dev-bootcamp?ref=agent123",
    },
    {
      id: "2",
      courseName: "Data Science Fundamentals",
      referralLink: "https://example.com/course/data-science?ref=agent123",
    },
    {
      id: "3",
      courseName: "UI/UX Design Masterclass",
      referralLink: "https://example.com/course/ui-ux-design?ref=agent123",
    },
    {
      id: "4",
      courseName: "Python for Beginners",
      referralLink: "https://example.com/course/python?ref=agent123",
    },
  ];

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

  // Sorting logic for course sales
  const handleSort = (field: keyof CourseSale) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Filtering logic for course sales
  const filteredSales = courseSales.filter((sale) =>
    Object.values(sale).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  // Sorting logic for course sales
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

  // Pagination logic for course sales
  const totalPages = Math.ceil(sortedSales.length / salesPerPage);
  const displayedSales = sortedSales.slice(
    (currentPage - 1) * salesPerPage,
    currentPage * salesPerPage,
  );

  // Generate pagination numbers
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

  // Handle copying referral link
  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Referral link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link.");
    });
  };

  // Handle sharing referral link
  const handleShareLink = async (link: string, courseName: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${courseName}`,
          text: `Check out this course: ${courseName}!`,
          url: link,
        });
        toast.success("Referral link shared successfully!");
      } catch (error) {
        toast.error("Failed to share link.");
      }
    } else {
      // Fallback to copying the link
      navigator.clipboard.writeText(link).then(() => {
        toast.success("Share not supported. Link copied to clipboard!");
      }).catch(() => {
        toast.error("Failed to copy link.");
      });
    }
  };

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
          } fixed md:static md:translate-x-0 z-20 h-[calc(100vh-64px)] transition-transform duration-300 ease-in-out`}
        >
          <Sidebar />
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white pl-16 md:pl-0">
              Agent Dashboard
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-t-4 border-t-indigo-500 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-lg">
                  Referrals
                  <Users className="h-5 w-5 text-indigo-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {statsLoading ? "..." : agentStats?.totalReferrals ?? 0}
                </p>
                <p className="text-sm text-indigo-500 flex items-center">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  10% growth
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-green-500 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-lg">
                  Successful Sales
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {statsLoading ? "..." : agentStats?.successfulSales ?? 0}
                </p>
                <p className="text-sm text-green-500 flex items-center">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  7% increase
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-yellow-500 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-lg">
                  Commission Earned
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  ₹{statsLoading ? "..." : agentStats?.totalCommission ?? "0.00"}
                </p>
                <p className="text-sm text-yellow-600 flex items-center">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  Earnings this month
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-red-500 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-lg">
                  Pending Payouts
                  <Clock className="h-5 w-5 text-red-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  ₹{statsLoading ? "..." : agentStats?.pendingCommission ?? "0.00"}
                </p>
                <p className="text-sm text-red-500">Awaiting transfer</p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Links Table Section */}
          <div className="mt-8">
            <Card className="dark:bg-gray-800">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-800 p-4 pb-4 pt-6 sm:p-6">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Referral Links
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="w-full text-black dark:text-white">
                    <TableHeader>
                      <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                        <TableHead className="hidden py-3 text-center sm:table-cell">
                          #
                        </TableHead>
                        <TableHead className="py-3">Course Name</TableHead>
                        <TableHead className="hidden md:table-cell py-3">
                          Referral Link
                        </TableHead>
                        <TableHead className="py-3 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="py-6 text-center text-gray-500"
                          >
                            No courses available.
                          </TableCell>
                        </TableRow>
                      ) : (
                        courses.map((course, index) => (
                          <TableRow
                            key={course.id}
                            className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                          >
                            <TableCell className="hidden text-center font-medium sm:table-cell">
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="sm:block">
                                <p className="font-medium">{course.courseName}</p>
                                <p className="mt-1 text-xs text-gray-500 md:hidden truncate max-w-[200px]">
                                  {course.referralLink}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="truncate max-w-[200px] inline-block">
                                      {course.referralLink}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{course.referralLink}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleCopyLink(course.referralLink)}
                                        className="h-8 w-8 rounded-full bg-teal-50 text-teal-600 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30"
                                        aria-label="Copy referral link"
                                      >
                                        <Copy size={16} />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Copy referral link</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleShareLink(course.referralLink, course.courseName)}
                                        className="h-8 w-8 rounded-full bg-teal-50 text-teal-600 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30"
                                        aria-label="Share referral link"
                                      >
                                        <Share size={16} />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Share referral link</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
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
          </div>

          {/* Activity Chart Section */}
          <div className="mt-8">
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold">
                  <BarChart3 className="mr-2 h-5 w-5 text-indigo-500" />
                  Monthly Sales Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">Chart placeholder</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Sales Table Section */}
          <div className="mt-8">
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
                            No sales found. Try a different search term.
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
                                  sale.status === "Completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                    : sale.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                }`}
                              >
                                {sale.status}
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

            {/* Pagination Controls */}
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
    </div>
  );
}