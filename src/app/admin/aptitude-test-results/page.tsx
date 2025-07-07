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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Menu, Search, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface StudentResult {
  _id: string;
  studentName: string;
  collegeName: string;
  marksObtained: number;
  result: "Pass" | "Fail";
  answers: Array<{
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
  studentDetails: {
    email: string;
    phone: string;
    enrollmentDate: string;
  };
}

const TestResultsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [viewAnswersDialogOpen, setViewAnswersDialogOpen] = useState(false);
  const [resultToDelete, setResultToDelete] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState<number | "all">(10);
  const [editMarks, setEditMarks] = useState<number | "">("");
  const [editResult, setEditResult] = useState<"Pass" | "Fail" | "">("");

  // Mock data, replace with API call
  const [results, setResults] = useState<StudentResult[]>([
    {
      _id: "result_1",
      studentName: "John Doe",
      collegeName: "XYZ University",
      marksObtained: 85,
      result: "Pass",
      answers: [
        {
          question: "What is 2 + 2?",
          studentAnswer: "4",
          correctAnswer: "4",
          isCorrect: true,
        },
        {
          question: "What is the capital of France?",
          studentAnswer: "Paris",
          correctAnswer: "Paris",
          isCorrect: true,
        },
        {
          question: "What is the square root of 16?",
          studentAnswer: "5",
          correctAnswer: "4",
          isCorrect: false,
        },
      ],
      studentDetails: {
        email: "john.doe@example.com",
        phone: "+1234567890",
        enrollmentDate: new Date().toISOString(),
      },
    },
    {
      _id: "result_2",
      studentName: "Jane Smith",
      collegeName: "ABC College",
      marksObtained: 65,
      result: "Fail",
      answers: [
        {
          question: "What is 2 + 2?",
          studentAnswer: "4",
          correctAnswer: "4",
          isCorrect: true,
        },
        {
          question: "What is the capital of France?",
          studentAnswer: "Florida",
          correctAnswer: "Paris",
          isCorrect: false,
        },
        {
          question: "What is the square root of 16?",
          studentAnswer: "4",
          correctAnswer: "4",
          isCorrect: true,
        },
      ],
      studentDetails: {
        email: "jane.smith@example.com",
        phone: "+0987654321",
        enrollmentDate: new Date().toISOString(),
      },
    },
  ]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleEditResult = () => {
    if (!selectedResult || editMarks === "" || editResult === "") {
      toast.error("Please fill in all fields");
      return;
    }

    setResults(results.map((result) =>
      result._id === selectedResult._id
        ? { ...result, marksObtained: Number(editMarks), result: editResult }
        : result
    ));
    setEditDialogOpen(false);
    setSelectedResult(null);
    setEditMarks("");
    setEditResult("");
    toast.success("Result updated successfully");
  };

  const handleDeleteResult = (id: string) => {
    setResults(results.filter((result) => result._id !== id));
    setDeleteDialogOpen(false);
    setResultToDelete(null);
    toast.success("Result deleted successfully");
  };

  const filteredResults = results.filter((result) =>
    result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.collegeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIndex = resultsPerPage === "all" ? 0 : (currentPage - 1) * resultsPerPage;
  const totalPages = resultsPerPage === "all" ? 1 : Math.ceil(filteredResults.length / resultsPerPage);
  const displayedResults = resultsPerPage === "all"
    ? filteredResults
    : filteredResults.slice(startIndex, startIndex + resultsPerPage);

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
        <h1 className="text-lg font-bold text-gray-800">Test Results</h1>
        <div className="w-10"></div>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
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
          <Card className="mb-6 overflow-hidden border-none bg-white shadow-md dark:bg-gray-800 dark:text-white">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Test Results Management
                </CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                  <Input
                    type="text"
                    placeholder="Search results..."
                    className="h-10 w-full rounded border border-gray-300 bg-white/90 p-2 text-black dark:text-black placeholder:text-gray-500 md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Table */}
              <div className="overflow-x-auto m-4">
                <Table className="w-full text-black dark:text-white">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                      <TableHead className="hidden py-3 text-center sm:table-cell">#</TableHead>
                      <TableHead className="py-3">Student Name</TableHead>
                      <TableHead className="hidden py-3 md:table-cell">College</TableHead>
                      <TableHead className="hidden py-3 lg:table-cell">Marks</TableHead>
                      <TableHead className="hidden py-3 xl:table-cell">Result</TableHead>
                      <TableHead className="py-3 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-6 text-center text-gray-500 dark:text-gray-400">
                          No results found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedResults.map((result, index) => (
                        <TableRow
                          key={result._id}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <TableCell className="hidden text-center font-medium sm:table-cell">
                            {startIndex + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="md:hidden">
                              <p className="font-medium">{result.studentName}</p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {result.collegeName}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Marks: {result.marksObtained}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Result: {result.result}
                              </p>
                            </div>
                            <span className="hidden font-medium md:inline">{result.studentName}</span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {result.collegeName}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {result.marksObtained}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${result.result === "Pass"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                }`}
                            >
                              {result.result}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600 transition-all duration-200 hover:bg-green-100 hover:text-green-700 hover:shadow-md dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 dark:hover:text-green-300"
                                onClick={() => {
                                  setSelectedResult(result);
                                  setViewAnswersDialogOpen(true);
                                }}
                                aria-label="View answers"
                              >
                                <Eye size={16} className="transition-transform group-hover:scale-110" />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  View answers
                                </span>
                              </button>
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                onClick={() => {
                                  setSelectedResult(result);
                                  setViewDetailsDialogOpen(true);
                                }}
                                aria-label="View student details"
                              >
                                <Eye size={16} className="transition-transform group-hover:scale-110" />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  View student details
                                </span>
                              </button>
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-yellow-50 text-yellow-600 transition-all duration-200 hover:bg-yellow-100 hover:text-yellow-700 hover:shadow-md dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30 dark:hover:text-yellow-300"
                                onClick={() => {
                                  setSelectedResult(result);
                                  setEditMarks(result.marksObtained);
                                  setEditResult(result.result);
                                  setEditDialogOpen(true);
                                }}
                                aria-label="Edit result"
                              >
                                <Edit2 size={16} className="transition-transform group-hover:scale-110" />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  Edit result
                                </span>
                              </button>
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                onClick={() => {
                                  setResultToDelete(result._id);
                                  setDeleteDialogOpen(true);
                                }}
                                aria-label="Delete result"
                              >
                                <Trash2 size={16} className="transition-transform group-hover:scale-110" />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  Delete result
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

          {/* View Answers Dialog */}
          <Dialog open={viewAnswersDialogOpen} onOpenChange={setViewAnswersDialogOpen}>
            <DialogContent className="max-w-2xl dark:bg-gray-800 dark:text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Student Answers
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Review the student's answers and the correct answers.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {selectedResult?.answers.map((answer, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      Question {index + 1}: {answer.question}
                    </p>
                    <p className="mt-2 text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-200">Student's Answer:</span>{" "}
                      <span className={answer.isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        {answer.studentAnswer}
                      </span>
                    </p>
                    <p className="mt-1 text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-200">Correct Answer:</span>{" "}
                      {answer.correctAnswer}
                    </p>
                    <p className="mt-1 text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-200">Status:</span>{" "}
                      <span className={answer.isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        {answer.isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setViewAnswersDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Student Details Dialog */}
          <Dialog open={viewDetailsDialogOpen} onOpenChange={setViewDetailsDialogOpen}>
            <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Student Details
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Details for {selectedResult?.studentName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Email</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedResult?.studentDetails.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Phone</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedResult?.studentDetails.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Enrollment Date</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedResult?.studentDetails.enrollmentDate && formatDate(selectedResult.studentDetails.enrollmentDate)}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setViewDetailsDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Result Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Edit Result
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Update the result for {selectedResult?.studentName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Marks Obtained
                  </label>
                  <Input
                    type="number"
                    value={editMarks}
                    onChange={(e) => setEditMarks(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Enter marks"
                    className="mt-1 h-10 w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Result
                  </label>
                  <Select
                    value={editResult}
                    onValueChange={(value: "Pass" | "Fail") => setEditResult(value)}
                  >
                    <SelectTrigger className="mt-1 h-10 w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800">
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pass">Pass</SelectItem>
                      <SelectItem value="Fail">Fail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false);
                    setSelectedResult(null);
                    setEditMarks("");
                    setEditResult("");
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditResult}
                  className="w-full sm:w-auto"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete this result? This action cannot be undone.
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
                  onClick={() => resultToDelete && handleDeleteResult(resultToDelete)}
                  className="w-full sm:w-auto"
                >
                  Delete Result
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Pagination */}
          <div className="mt-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-medium text-gray-700 dark:text-gray-300">{resultsPerPage === "all" ? 1 : startIndex + 1}</span> to{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {resultsPerPage === "all" ? filteredResults.length : Math.min(startIndex + resultsPerPage, filteredResults.length)}
                </span>{" "}
                of <span className="font-medium text-gray-700 dark:text-gray-300">{filteredResults.length}</span> results
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                <Select
                  value={resultsPerPage.toString()}
                  onValueChange={(value) => {
                    setResultsPerPage(value === "all" ? "all" : parseInt(value));
                    setCurrentPage(1);
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

export default TestResultsPage;