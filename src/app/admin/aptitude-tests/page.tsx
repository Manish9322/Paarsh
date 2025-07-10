"use client";

import { useState, useEffect } from "react";
import { FaRegCopy } from "react-icons/fa6";
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
import { Menu, Plus, Trash2, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Sidebar from "@/components/Sidebar/Sidebar";
import {
  useFetchCollegesQuery,
  useLazyGetTestsQuery,
  useCreateTestMutation,
  useDeleteTestMutation,
} from "@/services/api";

interface College {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  testIds: string[];
}

interface Test {
  testId: string;
  college: string;
  testDuration: number;
  testSettings: {
    questionsPerTest: number;
    passingScore: number;
    allowRetake: boolean;
  };
  createdAt: string;
  testLink: string;
  studentCount: number;
}

interface TestWithCollegeName extends Test {
  collegeName: string;
}

const AptitudePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [createTestDialogOpen, setCreateTestDialogOpen] = useState(false);
  const [deleteTestDialogOpen, setDeleteTestDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<{ testId: string; collegeId: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [testsPerPage, setTestsPerPage] = useState<number | "all">(10);
  const [testForm, setTestForm] = useState({
    collegeId: "",
    testDuration: "",
    questionsPerTest: "",
    passingScore: "",
    allowRetake: false,
  });
  const [allTests, setAllTests] = useState<TestWithCollegeName[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState(false);

  const { data: collegesData, isLoading: isLoadingColleges, error: collegesError } = useFetchCollegesQuery(undefined);
  const [triggerGetTests, { isLoading: isLoadingTestsQuery, error: testsError }] = useLazyGetTestsQuery();
  const [createTest, { isLoading: isCreatingTest }] = useCreateTestMutation();
  const [deleteTest, { isLoading: isDeletingTest }] = useDeleteTestMutation();

  const colleges = collegesData?.colleges || [];

  // Fetch tests for all colleges
  useEffect(() => {
    const fetchAllTests = async () => {
      setIsLoadingTests(true);
      try {
        const testsPromises = colleges.map(async (college: College) => {
          const tests = await triggerGetTests(college._id).unwrap();
          return tests.map((test: Test) => ({
            ...test,
            studentCount: 0,
            collegeName: college.name,
          }));
        });
        const testsArrays = await Promise.all(testsPromises);
        const flattenedTests = testsArrays.flat();
        setAllTests(flattenedTests);
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to load tests");
      } finally {
        setIsLoadingTests(false);
      }
    };

    if (colleges.length > 0) {
      fetchAllTests();
    }
  }, [colleges, triggerGetTests]);

  // Handle errors
  useEffect(() => {
    if (collegesError) {
      toast.error(collegesError?.data?.message || "Failed to load colleges");
    }
    if (testsError) {
      toast.error(testsError?.data?.message || "Failed to load tests");
    }
  }, [collegesError, testsError]);

  // Filter tests based on search term
  const filteredTests = allTests.filter(
    (test: TestWithCollegeName) =>
      test.testId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.collegeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate tests
  const startIndex = testsPerPage === "all" ? 0 : (currentPage - 1) * testsPerPage;
  const displayedTests = testsPerPage === "all"
    ? filteredTests
    : filteredTests.slice(startIndex, startIndex + testsPerPage);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCreateTest = async () => {
    const { collegeId, testDuration, questionsPerTest, passingScore, allowRetake } = testForm;
    if (!collegeId || !testDuration || !questionsPerTest || !passingScore) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      const response = await createTest({
        collegeId,
        testDuration: parseInt(testDuration),
        testSettings: {
          questionsPerTest: parseInt(questionsPerTest),
          passingScore: parseInt(passingScore),
          allowRetake,
        },
      }).unwrap();
      setCreateTestDialogOpen(false);
      setTestForm({ collegeId: "", testDuration: "", questionsPerTest: "", passingScore: "", allowRetake: false });
      toast.success(`Test created successfully: ${response.data.testLink}`);
      // Refresh tests
      const tests = await triggerGetTests(collegeId).unwrap();
      const college = colleges.find((c: College) => c._id === collegeId);
      setAllTests((prev) => [
        ...prev,
        ...tests.map((test: Test) => ({
          ...test,
          studentCount: 0,
          collegeName: college?.name || "",
        })),
      ]);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create test");
    }
  };

  const handleDeleteTest = async () => {
    if (!testToDelete) return;
    try {
      await deleteTest(testToDelete).unwrap();
      setDeleteTestDialogOpen(false);
      setTestToDelete(null);
      toast.success("Test deleted successfully");
      // Remove deleted test from state
      setAllTests((prev) => prev.filter((test) => test.testId !== testToDelete.testId));
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete test");
    }
  };

  const handleCopyLink = async (testLink: string) => {
    try {
      await navigator.clipboard.writeText(testLink);
      toast.success("Test link copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy test link");
    }
  };

  const handleShareLink = async (testLink: string, testId: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Aptitude Test: ${testId}`,
          text: `Take the aptitude test: ${testId}`,
          url: testLink,
        });
        toast.success("Test link shared successfully");
      } catch (err) {
        toast.error("Failed to share test link");
      }
    } else {
      try {
        await navigator.clipboard.writeText(testLink);
        toast.success("Test link copied to clipboard (sharing not supported)");
      } catch (err) {
        toast.error("Failed to copy test link");
      }
    }
  };

  const totalPages = testsPerPage === "all" ? 1 : Math.ceil(filteredTests.length / testsPerPage);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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

      if (startPage > 2) pageNumbers.push("...");
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      if (endPage < totalPages - 1) pageNumbers.push("...");
      if (totalPages > 1) pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm dark:bg-gray-800 md:hidden">
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </Button>
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">Aptitude Management</h1>
        <div className="w-10"></div>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 md:justify-end">
            <h1 className="text-xl font-bold md:hidden dark:text-white">Dashboard</h1>
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
        <div className="container mx-auto px-4 py-12">
          <Card className="mb-6 border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Aptitude Tests Management
                </CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                  <Input
                    type="text"
                    placeholder="Search tests or colleges..."
                    className="h-10 w-full rounded border border-gray-200 bg-white/90 p-2 text-black placeholder:text-gray-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button
                    onClick={() => setCreateTestDialogOpen(true)}
                    className="h-10 w-full rounded bg-white text-blue-600 hover:bg-blue-50 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600 md:w-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Test
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="m-4 overflow-x-auto">
                <Table className="w-full text-black dark:text-white">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                      <TableHead className="hidden py-3 text-center sm:table-cell">
                        #
                      </TableHead>
                      <TableHead className="py-3">College Name</TableHead>
                      <TableHead className="py-3">Test ID</TableHead>
                      <TableHead className="py-3 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingColleges || isLoadingTests ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell className="hidden sm:table-cell">
                            <Skeleton className="h-6 w-8" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-48" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-48" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-24" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : displayedTests.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="py-6 text-center text-gray-500 dark:text-gray-400"
                        >
                          No tests found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedTests.map((test: TestWithCollegeName, index: number) => (
                        <TableRow
                          key={test.testId}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <TableCell className="hidden text-center font-medium sm:table-cell">
                            {startIndex + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="md:hidden">
                              <p className="font-medium">{test.collegeName}</p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Test: {test.testId}
                              </p>
                            </div>
                            <span className="hidden font-medium md:inline">
                              {test.collegeName}
                            </span>
                          </TableCell>
                          <TableCell>{test.testId}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                onClick={() => handleCopyLink(test.testLink)}
                                className="group relative h-8 w-8 p-0"
                                aria-label="Copy test link"
                              >
                                <FaRegCopy
                                  size={16}
                                  className="text-green-600 transition-transform group-hover:scale-110 dark:text-green-400"
                                />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  Copy test link
                                </span>
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => handleShareLink(test.testLink, test.testId)}
                                className="group relative h-8 w-8 p-0"
                                aria-label="Share test link"
                              >
                                <Share2
                                  size={16}
                                  className="text-blue-600 transition-transform group-hover:scale-110 dark:text-blue-400"
                                />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  Share test link
                                </span>
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setTestToDelete({ testId: test.testId, collegeId: test.college });
                                  setDeleteTestDialogOpen(true);
                                }}
                                className="group relative h-8 w-8 p-0"
                                aria-label="Delete test"
                              >
                                <Trash2
                                  size={16}
                                  className="text-red-600 transition-transform group-hover:scale-110 dark:text-red-400"
                                />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  Delete test
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

          {/* Create Test Dialog */}
          <Dialog open={createTestDialogOpen} onOpenChange={(open) => {
            setCreateTestDialogOpen(open);
            if (!open) setTestForm({ collegeId: "", testDuration: "", questionsPerTest: "", passingScore: "", allowRetake: false });
          }}>
            <DialogContent className="max-w-md border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Create New Test
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Select a college and enter test details.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    College
                  </label>
                  <Select
                    value={testForm.collegeId}
                    onValueChange={(value) => setTestForm({ ...testForm, collegeId: value })}
                  >
                    <SelectTrigger className="w-full rounded border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50">
                      <SelectValue placeholder="Select a college" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college: College) => (
                        <SelectItem key={college._id} value={college._id}>
                          {college.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Test Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={testForm.testDuration}
                    onChange={(e) => setTestForm({ ...testForm, testDuration: e.target.value })}
                    placeholder="Enter duration in minutes"
                    className="w-full rounded border border-gray-200 bg-gray-50 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700/50"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Questions Per Test
                  </label>
                  <Input
                    type="number"
                    value={testForm.questionsPerTest}
                    onChange={(e) => setTestForm({ ...testForm, questionsPerTest: e.target.value })}
                    placeholder="Enter number of questions"
                    className="w-full rounded border border-gray-200 bg-gray-50 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700/50"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Passing Score
                  </label>
                  <Input
                    type="number"
                    value={testForm.passingScore}
                    onChange={(e) => setTestForm({ ...testForm, passingScore: e.target.value })}
                    placeholder="Enter passing score"
                    className="w-full rounded border border-gray-200 bg-gray-50 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700/50"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={testForm.allowRetake}
                    onChange={(e) => setTestForm({ ...testForm, allowRetake: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700/50"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                    Allow Retake
                  </label>
                </div>
              </div>
              <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setCreateTestDialogOpen(false)}
                  className="w-full rounded border-blue-500 px-6 py-3 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30 sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTest}
                  disabled={isCreatingTest}
                  className="w-full rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 sm:w-auto"
                >
                  Create Test
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Test Confirmation Dialog */}
          <Dialog open={deleteTestDialogOpen} onOpenChange={(open) => {
            setDeleteTestDialogOpen(open);
            if (!open) setTestToDelete(null);
          }}>
            <DialogContent className="max-w-md border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete this test? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteTestDialogOpen(false)}
                  className="w-full rounded border-blue-500 px-6 py-3 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30 sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteTest}
                  disabled={isDeletingTest}
                  className="w-full rounded bg-red-500 px-6 py-3 text-white hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 sm:w-auto"
                >
                  Delete Test
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Pagination */}
          <div className="mt-6 rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800 dark:text-white">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {testsPerPage === "all" ? 1 : startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {testsPerPage === "all"
                    ? filteredTests.length
                    : Math.min(startIndex + testsPerPage, filteredTests.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {filteredTests.length}
                </span>{" "}
                tests
                <div className="flex items-center space-x-2 pt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Show:
                  </span>
                  <Select
                    value={testsPerPage.toString()}
                    onValueChange={(value) => {
                      setTestsPerPage(value === "all" ? "all" : parseInt(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-24 rounded border-gray-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white">
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
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 rounded bg-blue-50 p-0 text-blue-600 hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-700 dark:disabled:text-gray-600"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="hidden sm:flex sm:items-center sm:space-x-1">
                  {generatePaginationNumbers().map((page, index) =>
                    typeof page === "number" ? (
                      <Button
                        key={`page-${page}`}
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 rounded p-0 text-sm font-medium ${
                          currentPage === page
                            ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        }`}
                        aria-label={`Page ${page}`}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    ) : (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-1 text-gray-400"
                      >
                        {page}
                      </span>
                    ),
                  )}
                </div>

                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 rounded bg-blue-50 p-0 text-blue-600 hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-700 dark:disabled:text-gray-600"
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
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 1 && value <= totalPages) {
                      setCurrentPage(value);
                    }
                  }}
                  className="h-8 w-16 rounded border-gray-200 text-center text-sm dark:border-gray-600 dark:bg-gray-700/50 dark:text-white"
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