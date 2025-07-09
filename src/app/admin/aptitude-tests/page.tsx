"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Menu, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddQuestionsMutation, useFetchQuestionsQuery } from "@/services/api";

interface ParsedQuestion {
  question: string;
  options: { text: string; isCorrect: boolean }[];
  correctAnswer: string;
  category: "aptitude" | "logical" | "quantitative" | "verbal" | "technical";
  explanation?: string;
  isActive: boolean;
  createdAt: string;
}

interface QuestionData {
  id?: string;
  question?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  answer?: string;
  category?: string;
  explanation?: string;
}

const CreateAptitudeTest = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [addQuestions, { isLoading: isAddingQuestions }] = useAddQuestionsMutation();

  // Table state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage, setQuestionsPerPage] = useState<number | "all">(10);

  // Fetch all questions
  const { data, isLoading: isQuestionsLoading, error } = useFetchQuestionsQuery(undefined);
  const allQuestions: ParsedQuestion[] = data?.data || [];

  // Filtered and paginated questions
  const filteredQuestions = allQuestions.filter(
    (q) => typeof q.question === "string" && q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const startIndex = questionsPerPage === "all" ? 0 : (currentPage - 1) * questionsPerPage;
  const totalPages = questionsPerPage === "all" ? 1 : Math.ceil(filteredQuestions.length / (questionsPerPage as number));
  const displayedQuestions = questionsPerPage === "all"
    ? filteredQuestions
    : filteredQuestions.slice(startIndex, startIndex + (questionsPerPage as number));

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
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage <= 3) endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
      if (currentPage >= totalPages - 2) startPage = Math.max(2, totalPages - maxPagesToShow + 2);
      if (startPage > 2) pageNumbers.push("...");
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
      if (endPage < totalPages - 1) pageNumbers.push("...");
      if (totalPages > 1) pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setParsedQuestions([]);
      return;
    }

    const validTypes = ["application/json", "text/csv"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JSON or CSV file");
      setSelectedFile(null);
      setParsedQuestions([]);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      setSelectedFile(null);
      setParsedQuestions([]);
      return;
    }

    setSelectedFile(file);
    parseFile(file);
  };

  const parseFile = (file: File) => {
    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let questions: ParsedQuestion[] = [];

        if (file.type === "application/json") {
          questions = parseJsonFile(content);
        } else if (file.type === "text/csv") {
          questions = parseCsvFile(content);
        }

        if (questions.length > 100) {
          toast.error("Maximum 100 questions allowed per test");
          setParsedQuestions([]);
          return;
        }

        if (questions.length === 0) {
          toast.error("No valid questions found in the file");
          setParsedQuestions([]);
          return;
        }

        setParsedQuestions(questions);
        toast.success(`${questions.length} questions parsed successfully`);
      } catch (error) {
        toast.error("Error parsing file. Please ensure the file is correctly formatted.");
        setParsedQuestions([]);
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsText(file);
  };

  const parseJsonFile = (content: string): ParsedQuestion[] => {
    const data = JSON.parse(content);
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error("JSON file must contain a 'questions' array");
    }

    return data.questions
      .filter((item: any) => isValidQuestion(item))
      .map((item: any) => {
        const correctOption = item.options.find((opt: any) => opt.isCorrect);
        if (!correctOption) {
          throw new Error("Each question must have exactly one correct option");
        }
        return {
          question: item.question,
          options: item.options.map((opt: any) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
          correctAnswer: correctOption.text,
          category: item.category,
          explanation: item.explanation || "",
          isActive: item.isActive !== undefined ? item.isActive : true,
          createdAt: item.createdAt || new Date().toISOString(),
        };
      });
  };

  const parseCsvFile = (content: string): ParsedQuestion[] => {
    const rows = content.split("\n").map((row) => row.split(",").map((cell) => cell.trim()));
    const headers = rows[0];
    const questions: ParsedQuestion[] = [];

    if (
      !headers.includes("question") ||
      !headers.includes("answer") ||
      !headers.includes("category") ||
      !headers.some((header) => header.startsWith("option"))
    ) {
      throw new Error("CSV must include columns: question, option1, option2, option3, option4, answer, category");
    }

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < headers.length) continue;

      const questionData: QuestionData = {};
      headers.forEach((header, index) => {
        questionData[header] = row[index] ? row[index].trim() : "";
      });

      if (
        typeof questionData.question === "string" &&
        questionData.question.trim() &&
        typeof questionData.answer === "string" &&
        questionData.answer.trim() &&
        typeof questionData.option1 === "string" &&
        questionData.option1.trim() &&
        typeof questionData.option2 === "string" &&
        questionData.option2.trim() &&
        typeof questionData.option3 === "string" &&
        questionData.option3.trim() &&
        typeof questionData.option4 === "string" &&
        questionData.option4.trim() &&
        typeof questionData.category === "string" &&
        questionData.category.trim()
      ) {
        const question: ParsedQuestion = {
          question: questionData.question,
          options: [
            { text: questionData.option1, isCorrect: questionData.option1 === questionData.answer },
            { text: questionData.option2, isCorrect: questionData.option2 === questionData.answer },
            { text: questionData.option3, isCorrect: questionData.option3 === questionData.answer },
            { text: questionData.option4, isCorrect: questionData.option4 === questionData.answer },
          ],
          correctAnswer: questionData.answer,
          category: questionData.category as ParsedQuestion["category"],
          explanation: questionData.explanation || "",
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        if (isValidQuestion(question)) {
          questions.push(question);
        }
      }
    }

    return questions;
  };

  const isValidQuestion = (item: any): boolean => {
    return (
      typeof item.question === "string" &&
      item.question.trim() !== "" &&
      Array.isArray(item.options) &&
      item.options.length === 4 &&
      item.options.every(
        (opt: any) => typeof opt.text === "string" && opt.text.trim() !== "" && typeof opt.isCorrect === "boolean"
      ) &&
      item.options.filter((opt: any) => opt.isCorrect).length === 1 &&
      ["aptitude", "logical", "quantitative", "verbal", "technical"].includes(item.category)
    );
  };

  const handleAddQuestions = async () => {
    if (parsedQuestions.length === 0) {
      toast.error("No questions to add. Please upload a valid file.");
      return;
    }

    try {
      await addQuestions({ questions: parsedQuestions }).unwrap();
      toast.success(`${parsedQuestions.length} questions added successfully`);
      setPreviewDialogOpen(false);
      setSelectedFile(null);
      setParsedQuestions([]);
    } catch (error: any) {
      toast.error(error?.data?.message || "Error adding questions");
    }
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
        <h1 className="text-lg font-bold text-gray-800">Create Aptitude Test</h1>
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
          {/* File Upload Card */}
          <Card className="mb-6 overflow-hidden border-none bg-white shadow-md dark:bg-gray-800 dark:text-white">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
              <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                Create Aptitude Test
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Upload Questions File (JSON or CSV)
                </label>
                <Input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileChange}
                  className="h-10 w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  aria-label="Upload questions file"
                />
              </div>
              {selectedFile && parsedQuestions.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {parsedQuestions.length} questions parsed from {selectedFile.name}
                  </p>
                  <Button
                    onClick={() => setPreviewDialogOpen(true)}
                    className="mt-2"
                    disabled={isParsing}
                  >
                    {isParsing ? "Parsing..." : "Preview and Add Questions"}
                    <Upload className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Questions Table Card */}
          <Card className="mb-6 overflow-hidden border-none bg-white shadow-md dark:bg-gray-800 dark:text-white">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Aptitude Questions
                </CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                  <Input
                    type="text"
                    placeholder="Search questions..."
                    className="h-10 w-full rounded border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 dark:text-black md:w-64"
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
                      <TableHead className="py-3">Question</TableHead>
                      <TableHead className="hidden py-3 md:table-cell">Category</TableHead>
                      <TableHead className="hidden py-3 lg:table-cell">Correct Answer</TableHead>
                      <TableHead className="hidden py-3 xl:table-cell">Status</TableHead>
                      <TableHead className="hidden py-3 xl:table-cell">Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isQuestionsLoading ? (
                      Array.from({ length: questionsPerPage === "all" ? 5 : questionsPerPage }).map((_, index) => (
                        <TableRow key={index} className="border-b border-gray-100 dark:border-gray-700 dark:bg-gray-900">
                          <TableCell className="hidden sm:table-cell">
                            <Skeleton className="h-4 w-6" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : displayedQuestions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-6 text-center text-gray-500 dark:text-gray-400">
                          No questions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedQuestions.map((q, index) => (
                        <TableRow
                          key={q.question + q.createdAt}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <TableCell className="hidden text-center font-medium sm:table-cell">
                            {startIndex + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="md:hidden">
                              <p className="font-medium">{q.question}</p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Category: {q.category}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Correct: {q.correctAnswer}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Status: {q.isActive ? "Active" : "Inactive"}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Created: {formatDate(q.createdAt)}
                              </p>
                            </div>
                            <span className="hidden font-medium md:inline">{q.question}</span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{q.category}</TableCell>
                          <TableCell className="hidden lg:table-cell">{q.correctAnswer}</TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                q.isActive
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              }`}
                            >
                              {q.isActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">{formatDate(q.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="mt-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {questionsPerPage === "all" ? 1 : startIndex + 1} to{" "}
                {questionsPerPage === "all" ? filteredQuestions.length : Math.min(startIndex + (questionsPerPage as number), filteredQuestions.length)} of{" "}
                {filteredQuestions.length} questions
                <div className="flex items-center space-x-2 pt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                  <select
                    value={questionsPerPage.toString()}
                    onChange={(e) => {
                      setQuestionsPerPage(e.target.value === "all" ? "all" : parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-8 w-24 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="10">10</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 rounded-md bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                  aria-label="Previous page"
                >
                  <span className="sr-only">Previous</span>
                  ←
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
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    ) : (
                      <span key={`ellipsis-${index}`} className="px-1 text-gray-400">
                        {page}
                      </span>
                    )
                  )}
                </div>
                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 rounded-md bg-blue-50 p-0 text-blue-600 transition-colors hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                  aria-label="Next page"
                >
                  <span className="sr-only">Next</span>
                  →
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

      {/* Preview Questions Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Preview Questions
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
              Review the parsed questions before adding them to the test.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {parsedQuestions.map((question, index) => (
              <div
                key={index}
                className="mb-4 rounded-lg border p-4 dark:border-gray-600 dark:bg-gray-700"
              >
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  Question {index + 1}: {question.question}
                </p>
                <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                  {question.options.map((option, optIndex) => (
                    <li
                      key={optIndex}
                      className={option.isCorrect ? "text-green-600 dark:text-green-400" : ""}
                    >
                      {option.text}
                      {option.isCorrect && " (Correct)"}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Category: {question.category}
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Correct Answer: {question.correctAnswer}
                </p>
                {question.explanation && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Explanation: {question.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setPreviewDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddQuestions}
              className="w-full sm:w-auto"
              disabled={isParsing || isAddingQuestions}
            >
              {isAddingQuestions ? "Adding..." : "Add Questions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

export default CreateAptitudeTest;