"use client";

import { useState, useEffect } from "react";
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
import { Menu, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useFetchCollegesQuery, useGetTestSessionsQuery } from "@/services/api";

interface College {
  _id: string;
  name: string;
}

interface TestSession {
  _id: string;
  student: { _id: string; name: string };
  college: { _id: string; name: string };
  testId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  score: number;
  percentage: number;
  status: "pending" | "active" | "completed";
  passStatus: "pass" | "fail";
}

const AptitudePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState<string | "all">("all");
  const [testSessionsPage, setTestSessionsPage] = useState(1);
  const [testSessionsPerPage, setTestSessionsPerPage] = useState<number | "all">(10);
  const [selectedSession, setSelectedSession] = useState<TestSession | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch colleges for filter dropdown and test sessions
  const { data: collegesData, isLoading: isCollegesLoading, error: collegesError } = useFetchCollegesQuery(undefined);
  const { data: testSessions, isLoading: isTestSessionsLoading, error: testSessionsError } = useGetTestSessionsQuery({
    collegeId: selectedCollegeFilter === "all" ? undefined : selectedCollegeFilter,
  });

  const colleges = collegesData?.colleges || [];

  // Debug colleges and test sessions data
  useEffect(() => {
    console.log("Colleges Data:", collegesData);
    console.log("Colleges:", colleges);
    console.log("Test Sessions Data:", testSessions);
    console.log("Test Sessions Error:", testSessionsError);
  }, [collegesData, colleges, testSessions, testSessionsError]);

  const filteredTestSessions = testSessions?.filter(
    (session: TestSession) =>
      session.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.testId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const testSessionsStartIndex = testSessionsPerPage === "all" ? 0 : (testSessionsPage - 1) * testSessionsPerPage;
  const testSessionsTotalPages = testSessionsPerPage === "all" ? 1 : Math.ceil(filteredTestSessions.length / testSessionsPerPage);
  const displayedTestSessions = testSessionsPerPage === "all" ? filteredTestSessions : filteredTestSessions.slice(testSessionsStartIndex, testSessionsStartIndex + testSessionsPerPage);

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const generatePaginationNumbers = (total: number, current: number) => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (total <= maxPagesToShow) {
      for (let i = 1; i <= total; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      let startPage = Math.max(2, current - 1);
      let endPage = Math.min(total - 1, current + 1);

      if (current <= 3) {
        endPage = Math.min(total - 1, maxPagesToShow - 1);
      }
      if (current >= total - 2) {
        startPage = Math.max(2, total - maxPagesToShow + 2);
      }

      if (startPage > 2) pageNumbers.push("...");
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      if (endPage < total - 1) pageNumbers.push("...");
      if (total > 1) pageNumbers.push(total);
    }
    return pageNumbers;
  };

  // Notify errors or empty states
  if (collegesError) {
    toast.error(`Failed to load colleges for filter: ${collegesError.message || "Unknown error"}`);
  } else if (!isCollegesLoading && colleges.length === 0) {
    toast.warning("No colleges available to filter test sessions.");
  }
  if (testSessionsError) {
    toast.error(`Failed to load test sessions: ${testSessionsError.message || "Unknown error"}`);
  }

  const handleViewSession = (session: TestSession) => {
    setSelectedSession(session);
    setViewDialogOpen(true);
  };

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
        <h1 className="text-lg font-bold text-gray-800">Test Sessions</h1>
        <div className="w-10"></div>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
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
      <main className="flex-1 overflow-y-auto pt-16 md:ml-64">
        <div className="container mx-auto px-4 py-6">
          {/* Test Sessions Card */}
          <Card className="mb-6 overflow-hidden border-none bg-white shadow-md dark:bg-gray-800 dark:text-white">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 pb-4 pt-6 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">Test Sessions</CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                  <Input
                    type="text"
                    placeholder="Search students or test IDs..."
                    className="h-10 w-full rounded border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 dark:text-black md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select
                    value={selectedCollegeFilter}
                    onValueChange={(value) => {
                      console.log("Selected College ID:", value);
                      setSelectedCollegeFilter(value);
                      setTestSessionsPage(1);
                    }}
                    disabled={isCollegesLoading}
                  >
                    <SelectTrigger className="h-10 w-full rounded border border-gray-300 bg-white/90 text-black dark:text-black md:w-64">
                      <SelectValue placeholder={isCollegesLoading ? "Loading colleges..." : colleges.length === 0 ? "No colleges available" : "Select a college"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Colleges</SelectItem>
                      {colleges.length > 0 ? (
                        colleges.map((college: College) => (
                          <SelectItem key={college._id} value={college._id}>
                            {college.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No colleges available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="m-4 overflow-x-auto">
                <Table className="w-full text-black dark:text-white">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                      <TableHead className="hidden py-3 text-center sm:table-cell">#</TableHead>
                      <TableHead className="py-3">Student Name</TableHead>
                      <TableHead className="py-3">Test ID</TableHead>
                      <TableHead className="hidden py-3 md:table-cell">College</TableHead>
                      <TableHead className="hidden py-3 lg:table-cell">Score</TableHead>
                      <TableHead className="hidden py-3 xl:table-cell">Percentage</TableHead>
                      <TableHead className="hidden py-3 xl:table-cell">Pass/Fail</TableHead>
                      <TableHead className="hidden py-3 xl:table-cell">Start Time</TableHead>
                      <TableHead className="hidden py-3 xl:table-cell">End Time</TableHead>
                      <TableHead className="py-3 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isTestSessionsLoading ? (
                      Array.from({ length: testSessionsPerPage === "all" ? 5 : testSessionsPerPage }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell className="hidden sm:table-cell">
                            <Skeleton className="h-6 w-8 mx-auto" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Skeleton className="h-6 w-16 mx-auto" />
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <Skeleton className="h-6 w-16 mx-auto" />
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <Skeleton className="h-6 w-24 mx-auto" />
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <Skeleton className="h-6 w-24 mx-auto" />
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <Skeleton className="h-6 w-24 mx-auto" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-24 mx-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : displayedTestSessions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="py-6 text-center text-gray-500 dark:text-gray-400">
                          No test sessions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedTestSessions.map((session: TestSession, index: number) => (
                        <TableRow
                          key={session._id}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <TableCell className="hidden text-center font-medium sm:table-cell">{testSessionsStartIndex + index + 1}</TableCell>
                          <TableCell>
                            <div className="md:hidden">
                              <p className="font-medium">{session.student.name}</p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Test: {session.testId}</p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">College: {session.college.name}</p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Score: {session.score}</p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Percentage: {session.percentage}%</p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Pass/Fail: {session.passStatus}</p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Started: {formatDate(session.startTime)}</p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Ended: {formatDate(session.endTime)}</p>
                            </div>
                            <span className="hidden font-medium md:inline">{session.student.name}</span>
                          </TableCell>
                          <TableCell>{session.testId}</TableCell>
                          <TableCell className="hidden md:table-cell">{session.college.name}</TableCell>
                          <TableCell className="hidden lg:table-cell">{session.score}</TableCell>
                          <TableCell className="hidden xl:table-cell">{session.percentage}%</TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {/* <span className={session.passStatus === "pass" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                              {session.passStatus.charAt(0).toUpperCase() + session.passStatus.slice(1)}
                            </span> */}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">{formatDate(session.startTime)}</TableCell>
                          <TableCell className="hidden xl:table-cell">{formatDate(session.endTime)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                onClick={() => handleViewSession(session)}
                                className="group relative h-8 w-8 p-0"
                                aria-label="View session details"
                              >
                                <Eye
                                  size={16}
                                  className="text-blue-600 transition-transform group-hover:scale-110 dark:text-blue-400"
                                />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  View details
                                </span>
                              </Button>
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

          {/* View Session Details Dialog */}
          <Dialog open={viewDialogOpen} onOpenChange={(open) => {
            setViewDialogOpen(open);
            if (!open) setSelectedSession(null);
          }}>
            <DialogContent className="max-w-md border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Test Session Details
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Details of the selected test session.
                </DialogDescription>
              </DialogHeader>
              {selectedSession && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">Student Name</label>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{selectedSession.student.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">Test ID</label>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{selectedSession.testId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">College</label>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{selectedSession.college.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">Score</label>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{selectedSession.score}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">Percentage</label>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{selectedSession.percentage}%</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">Pass/Fail</label>
                    <p className={`mt-1 text-sm ${selectedSession.passStatus === "pass" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {/* {selectedSession.passStatus.charAt(0).toUpperCase() + selectedSession.passStatus.slice(1)} */}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">Start Time</label>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{formatDate(selectedSession.startTime)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">End Time</label>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{formatDate(selectedSession.endTime)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">Status</label>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{selectedSession.status}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">Duration</label>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{selectedSession.duration} minutes</p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Pagination for Test Sessions */}
          <div className="mt-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">{testSessionsPerPage === "all" ? 1 : testSessionsStartIndex + 1}</span> to{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {testSessionsPerPage === "all" ? filteredTestSessions.length : Math.min(testSessionsStartIndex + testSessionsPerPage, filteredTestSessions.length)}
                </span>{" "}
                of <span className="font-medium text-gray-700 dark:text-gray-300">{filteredTestSessions.length}</span> test sessions
                <div className="flex items-center space-x-2 pt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                  <Select
                    value={testSessionsPerPage.toString()}
                    onValueChange={(value) => {
                      setTestSessionsPerPage(value === "all" ? "all" : parseInt(value));
                      setTestSessionsPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-24 rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white">
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
                  onClick={() => setTestSessionsPage((prev) => Math.max(prev - 1, 1))}
                  disabled={testSessionsPage === 1}
                  className="h-8 w-8 rounded-md bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="hidden sm:flex sm:items-center sm:space-x-1">
                  {generatePaginationNumbers(testSessionsTotalPages, testSessionsPage).map((page, index) =>
                    typeof page === "number" ? (
                      <Button
                        key={`test-session-page-${page}`}
                        onClick={() => setTestSessionsPage(page)}
                        className={`h-8 w-8 rounded-md p-0 text-sm font-medium ${
                          testSessionsPage === page
                            ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        }`}
                        aria-label={`Page ${page}`}
                        aria-current={testSessionsPage === page ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    ) : (
                      <span key={`test-session-ellipsis-${index}`} className="px-1 text-gray-400">{page}</span>
                    )
                  )}
                </div>
                <Button
                  onClick={() => setTestSessionsPage((prev) => Math.min(prev + 1, testSessionsTotalPages))}
                  disabled={testSessionsPage === testSessionsTotalPages}
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
                  max={testSessionsTotalPages}
                  value={testSessionsPage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 1 && value <= testSessionsTotalPages) {
                      setTestSessionsPage(value);
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
    </div>
  );
};

export default AptitudePage;

