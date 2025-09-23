"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Menu,
  Loader2,
  X,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useBulkUploadQuestionsMutation,
  useFetchQuestionsQuery,
  useDeleteQuestionMutation,
  useUpdateQuestionMutation,
} from "@/services/api";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BulkUploadQuestions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<"json" | "csv" | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage, setQuestionsPerPage] = useState<number | "all">(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all"); // Changed initial value to "all"
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  const [bulkUploadQuestions, { isLoading: isUploading }] =
    useBulkUploadQuestionsMutation();
  const {
    data: questionsData,
    isLoading: isLoadingQuestions,
    refetch,
  } = useFetchQuestionsQuery(undefined);

  console.log("Questions data on bulk upload page : ", questionsData);

  const [deleteQuestion] = useDeleteQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.name.endsWith(".json")
      ? "json"
      : file.name.endsWith(".csv")
        ? "csv"
        : null;
    if (!fileType) {
      toast.error("Please select a JSON or CSV file");
      return;
    }

    setFileName(file.name);
    setFileType(fileType);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      setFileContent(content);

      try {
        let questions;
        if (fileType === "json") {
          questions = JSON.parse(content);
        } else {
          questions = content.split("\n").slice(0, 5); // Show first 5 lines for CSV
        }
        setParsedQuestions(questions);
        setShowPreview(true);
      } catch (error) {
        toast.error("Error parsing file");
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!fileContent || !fileType) return;

    try {
      await bulkUploadQuestions({
        fileContent,
        fileType,
      }).unwrap();

      toast.success("Questions uploaded successfully");
      setShowPreview(false);
      setFileContent(null);
      setFileName("");
      setFileType(null);
      setValidationErrors([]);
    } catch (error) {
      console.error("Upload error:", error);
      if (error.data?.validationErrors) {
        setValidationErrors(error.data.validationErrors);
        toast.error(
          "Some questions failed validation. Please check the errors below.",
        );
      } else {
        toast.error(error.data?.message || "Error uploading questions");
      }
    }
  };

  // New functions for question management
  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;
    try {
      await deleteQuestion(questionToDelete).unwrap();
      toast.success("Question deleted successfully");
      setDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  const handleViewQuestion = (question: any) => {
    setSelectedQuestion(question);
    setPreviewModalOpen(true);
  };

  const handleEditQuestion = (question: any) => {
    setSelectedQuestion(question);
    setEditModalOpen(true);
  };

  // Update the delete handler function
  const handleDeleteClick = (question: any) => {
    setQuestionToDelete(question._id);
    setSelectedQuestion(question);
    setDeleteDialogOpen(true);
  };

  // Update how we access the questions array
  const questions = questionsData || [];
  const validCategories = [
    "aptitude",
    "logical",
    "quantitative",
    "verbal",
    "technical",
  ];

  const filteredQuestions = questions.filter((question: any) => {
  const searchLower = searchTerm.toLowerCase();
  const matchesSearch =
    question.question.toLowerCase().includes(searchLower) ||
    question.category.toLowerCase().includes(searchLower) ||
    question.correctAnswer.toLowerCase().includes(searchLower) ||
    (question.explanation && question.explanation.toLowerCase().includes(searchLower)) ||
    question.options.some((option: any) => option.text.toLowerCase().includes(searchLower));

  const matchesCategory =
    selectedCategory === "all"
      ? true
      : question.category === selectedCategory;

  return matchesSearch && matchesCategory;
});

  const startIndex =
    questionsPerPage === "all"
      ? 0
      : (currentPage - 1) *
        (typeof questionsPerPage === "number" ? questionsPerPage : 10);
  const totalPages =
    questionsPerPage === "all"
      ? 1
      : Math.ceil(
          filteredQuestions.length /
            (typeof questionsPerPage === "number" ? questionsPerPage : 10),
        );

  const displayedQuestions =
    questionsPerPage === "all"
      ? filteredQuestions
      : filteredQuestions.slice(
          startIndex,
          startIndex +
            (typeof questionsPerPage === "number" ? questionsPerPage : 10),
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
        <h1 className="text-lg font-bold text-gray-800">
          Bulk Upload Questions
        </h1>
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
          <Card className="mb-6 overflow-hidden border-none bg-white shadow-md dark:bg-gray-800 dark:text-white">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Bulk Upload Questions
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {validationErrors.length > 0 && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Errors</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-2">
                      {validationErrors.map((error, index) => (
                        <div
                          key={index}
                          className="rounded bg-red-50 p-3 dark:bg-red-900/20"
                        >
                          <p className="font-medium">
                            Question {error.questionIndex + 1}:
                          </p>
                          <ul className="ml-4 list-disc">
                            {error.errors.map(
                              (err: string, errIndex: number) => (
                                <li key={errIndex} className="text-sm">
                                  {err}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="mb-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                <div className="mb-6">
                  <h2 className="mb-2 text-lg font-semibold">Upload File</h2>
                  <p className="mb-4 text-gray-600 dark:text-gray-300">
                    Please upload a JSON or CSV file containing the questions.
                    Make sure the file follows the required format.
                  </p>

                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                      variant="outline"
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                    >
                      Select File
                    </Button>
                    <span className="text-gray-600 dark:text-gray-300">
                      {fileName || "No file selected"}
                    </span>
                  </div>

                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".json,.csv"
                    onChange={handleFileSelect}
                  />
                </div>

                <div className="mt-6">
                  <h3 className="mb-2 font-semibold">Required Format:</h3>
                  <div className="rounded bg-gray-50 p-4 dark:bg-gray-700">
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-2 text-sm font-semibold">
                          JSON Format:
                        </h4>
                        <p className="whitespace-pre-wrap font-mono text-sm">
                          {`{
  "question": "What is 2 + 2?",
  "options": [
    { "text": "3", "isCorrect": false },
    { "text": "4", "isCorrect": true },
    { "text": "5", "isCorrect": false },
    { "text": "6", "isCorrect": false }
  ],
  "correctAnswer": "4",
  "category": "aptitude",
  "explanation": "Basic addition"
}`}
                        </p>
                      </div>
                      <div>
                        <h4 className="mb-2 text-sm font-semibold">
                          CSV Format:
                        </h4>
                        <p className="font-mono text-sm">
                          question,option1,option2,option3,option4,correctAnswer,category,explanation
                          <br />
                          &quot;What is 2 +
                          2?&quot;,&quot;3&quot;,&quot;4&quot;,&quot;5&quot;,&quot;6&quot;,&quot;4&quot;,&quot;aptitude&quot;,&quot;Basic
                          addition&quot;
                        </p>
                      </div>
                      <div>
                        <h4 className="mb-2 text-sm font-semibold">Notes:</h4>
                        <ul className="list-disc space-y-1 pl-4 text-sm">
                          <li>
                            Category must be one of: aptitude, logical,
                            quantitative, verbal, technical
                          </li>
                          <li>All questions must have exactly 4 options</li>
                          <li>
                            The correctAnswer must match one of the options
                            exactly
                          </li>
                          <li>Explanation is optional</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Questions Table Card */}
          <Card className="mt-6 overflow-hidden border-none bg-white shadow-md dark:bg-gray-800 dark:text-white">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Questions List
                </CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                  <Input
                    type="text"
                    placeholder="Search questions..."
                    className="h-10 w-full rounded border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 dark:text-black md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="h-10 w-full bg-white text-black md:w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {validCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Correct Answer</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingQuestions ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-4 text-center">
                          Loading questions...
                        </TableCell>
                      </TableRow>
                    ) : displayedQuestions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-4 text-center">
                          No questions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedQuestions.map((question: any, index: number) => (
                        <TableRow key={question._id}>
                          <TableCell>{startIndex + index + 1}</TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate">{question.question}</div>
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">
                              {question.category}
                            </span>
                          </TableCell>
                          <TableCell>{question.correctAnswer}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-blue-600"
                                onClick={() => handleViewQuestion(question)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-green-600"
                                onClick={() => handleEditQuestion(question)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-600"
                                onClick={() => handleDeleteClick(question)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="mt-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {questionsPerPage === "all" ? 1 : startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {questionsPerPage === "all"
                        ? filteredQuestions.length
                        : Math.min(
                            startIndex +
                              (typeof questionsPerPage === "number"
                                ? questionsPerPage
                                : 10),
                            filteredQuestions.length,
                          )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {filteredQuestions.length}
                    </span>{" "}
                    questions
                    <div className="flex items-center space-x-2 pt-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Show :
                      </span>
                      <Select
                        value={questionsPerPage.toString()}
                        onValueChange={(value) => {
                          setQuestionsPerPage(
                            value === "all" ? "all" : parseInt(value),
                          );
                          setCurrentPage(1);
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
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="h-8 w-8 rounded-md bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
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
                            className={`h-8 w-8 rounded-md p-0 text-sm font-medium ${
                              currentPage === page
                                ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                            }`}
                            aria-label={`Page ${page}`}
                            aria-current={
                              currentPage === page ? "page" : undefined
                            }
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
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 rounded-md bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="hidden items-center space-x-2 lg:flex">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Go to page :
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
                      className="h-8 w-16 rounded-md border-gray-300 text-center text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      aria-label="Go to page"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* File Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview File Content</DialogTitle>
            <DialogDescription>
              Review the content before uploading. Make sure all questions are
              formatted correctly.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {fileType === "json" ? (
              <pre className="rounded-lg bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
                {JSON.stringify(parsedQuestions, null, 2)}
              </pre>
            ) : (
              <div className="rounded-lg bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
                {Array.isArray(parsedQuestions)
                  ? parsedQuestions.map((line: string, index: number) => (
                      <div key={index}>{line}</div>
                    ))
                  : typeof parsedQuestions === "object"
                    ? JSON.stringify(parsedQuestions, null, 2)
                    : String(parsedQuestions)}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Questions"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Question:</h3>
                <p className="mt-1">{selectedQuestion.question}</p>
              </div>
              <div>
                <h3 className="font-semibold">Options:</h3>
                <div className="mt-2 space-y-2">
                  {selectedQuestion.options.map(
                    (option: any, index: number) => (
                      <div
                        key={option._id}
                        className={`rounded-lg p-2 ${
                          option.isCorrect
                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                            : "bg-gray-50 dark:bg-gray-800"
                        }`}
                      >
                        {index + 1}. {option.text}
                        {option.isCorrect && (
                          <span className="ml-2 text-sm">(Correct Answer)</span>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Category:</h3>
                <p className="mt-1 capitalize">{selectedQuestion.category}</p>
              </div>
              {selectedQuestion.explanation && (
                <div>
                  <h3 className="font-semibold">Explanation:</h3>
                  <p className="mt-1">{selectedQuestion.explanation}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPreviewModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Question</label>
                <Input
                  value={selectedQuestion.question}
                  onChange={(e) =>
                    setSelectedQuestion({
                      ...selectedQuestion,
                      question: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Options</label>
                {selectedQuestion.options.map((option: any, index: number) => (
                  <div key={option._id} className="flex items-center gap-2">
                    <Input
                      value={option.text}
                      onChange={(e) => {
                        const newOptions = [...selectedQuestion.options];
                        newOptions[index] = {
                          ...option,
                          text: e.target.value,
                        };
                        // Update correctAnswer if this option is marked as correct
                        const newCorrectAnswer =
                          newOptions.find((opt) => opt.isCorrect)?.text ||
                          selectedQuestion.correctAnswer;
                        setSelectedQuestion({
                          ...selectedQuestion,
                          options: newOptions,
                          correctAnswer: newCorrectAnswer,
                        });
                      }}
                    />
                    <input
                      type="radio"
                      checked={option.isCorrect}
                      onChange={() => {
                        const newOptions = selectedQuestion.options.map(
                          (opt: any, i: number) => ({
                            ...opt,
                            isCorrect: i === index,
                          }),
                        );
                        setSelectedQuestion({
                          ...selectedQuestion,
                          options: newOptions,
                          correctAnswer: newOptions[index].text,
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={selectedQuestion.category}
                  onValueChange={(value) =>
                    setSelectedQuestion({
                      ...selectedQuestion,
                      category: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {validCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Explanation (Optional)
                </label>
                <Input
                  value={selectedQuestion.explanation}
                  onChange={(e) =>
                    setSelectedQuestion({
                      ...selectedQuestion,
                      explanation: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                // Validate before sending update
                const correctOption = selectedQuestion.options.find(
                  (opt: any) => opt.isCorrect,
                );
                if (!correctOption) {
                  toast.error("Please select one correct option");
                  return;
                }
                if (correctOption.text !== selectedQuestion.correctAnswer) {
                  toast.error(
                    "Correct answer must match the selected option's text",
                  );
                  return;
                }
                try {
                  await updateQuestion({
                    id: selectedQuestion._id,
                    ...selectedQuestion,
                  }).unwrap();
                  toast.success("Question updated successfully");
                  setEditModalOpen(false);
                  refetch();
                } catch (error) {
                  toast.error("Failed to update question");
                  console.error("Update error:", error);
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (questionToDelete) {
                  try {
                    await deleteQuestion(questionToDelete).unwrap();
                    toast.success("Question deleted successfully");
                    setDeleteDialogOpen(false);
                    refetch();
                  } catch (error) {
                    toast.error("Failed to delete question");
                    console.error("Delete error:", error);
                  }
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
