"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Trash2, ChevronLeft, ChevronRight, BookPlus, Menu, Pencil, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { RxCross2 } from "react-icons/rx";
import {
  useFetchPracticeTestsQuery,
  useAddPracticeTestMutation,
  useUpdatePracticeTestMutation,
  useDeletePracticeTestMutation,
  useFetchCourcesQuery,
  useFetchCategoriesQuery, // Fixed typo
} from "@/services/api";

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

interface PracticeTest {
  _id: string;
  testName: string;
  linkedCourses: string[] | { _id: string; courseName: string }[];
  skill: string;
  level: "Easy" | "Intermediate" | "Difficult";
  questionCount: number;
  duration: string;
  createdAt: string;
  questions: Question[];
}

interface Course {
  _id: string;
  courseName: string;
}

interface Category {
  name: string;
  keywords: string[];
  _id: string;
}

const PracticeTestPage: React.FC = () => {
  const [viewOpen, setViewOpen] = useState(false);
  const [addTestOpen, setAddTestOpen] = useState(false);
  const [editTestOpen, setEditTestOpen] = useState(false); // Added for edit modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  const [testToEdit, setTestToEdit] = useState<PracticeTest | null>(null); // Added for edit modal
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTest, setSelectedTest] = useState<PracticeTest | null>(null);
  const testsPerPage = 10;

  // Fetch data
  const { data: practiceTestsData, isLoading, error } = useFetchPracticeTestsQuery(undefined);
  const { data: coursesData } = useFetchCourcesQuery(undefined); // Fixed typo
  const [addPracticeTest] = useAddPracticeTestMutation();
  const [updatePracticeTest] = useUpdatePracticeTestMutation();
  const [deletePracticeTest] = useDeletePracticeTestMutation();

  const practiceTests: PracticeTest[] = practiceTestsData?.data || [];
  const availableCourses: Course[] = coursesData?.data || [];


  // Fetch categories data
  const { data: categoriesData, isLoading: isCategoriesLoading } = useFetchCategoriesQuery(undefined);
  const categories: Category[] = categoriesData?.data || [];

  console.log("Categories on Question bank page :", categories);
  console.log(" Keywords in all categories:", categories.map(category => category.keywords).flat());

  // Step 1: Extract all keywords dynamically
  const keywordOptions = Array.from(
    new Set(
      categories
        .map(category => category.keywords) // get the keyword strings
        .flat()                             // flatten the array
        .join(",")                          // join all into one string
        .split(",")                         // split by comma
        .map(kw => kw.trim())               // trim spaces
        .filter(Boolean)                    // remove empty strings
    )
  );
  console.log("Extracted Keywords:", keywordOptions);

  // Filter tests based on search term
  const filteredTests = practiceTests.filter((test) =>
    [test.testName, test.skill, test.level, test.duration, test.questionCount.toString()].some(
      (field) => field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredTests.length / testsPerPage);
  const startIndex = (currentPage - 1) * testsPerPage;
  const displayedTests = filteredTests.slice(startIndex, startIndex + testsPerPage);

  // Generate pagination numbers
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

  // Handle delete test
  const confirmDeleteTest = (testId: string) => {
    setTestToDelete(testId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteTest = async () => {
    if (!testToDelete) return;
    try {
      await deletePracticeTest({ id: testToDelete }).unwrap(); // Updated to match API payload
      toast.success("Practice test deleted successfully");
      setDeleteConfirmOpen(false);
      setTestToDelete(null);
    } catch (error) {
      toast.error("Failed to delete practice test");
    }
  };

  // Handle view test
  const handleViewTest = (test: PracticeTest) => {
    setSelectedTest(test);
    setViewOpen(true);
  };

  // Handle edit test
  const handleEditTest = (test: PracticeTest) => {
    setTestToEdit(test);
    setEditTestOpen(true);
  };

  // Handle add test
  const handleAddTest = async (
    newTest: Omit<PracticeTest, "_id" | "createdAt"> & { linkedCourses: string[] }
  ) => {
    try {
      await addPracticeTest(newTest).unwrap();
      toast.success("Practice test added successfully");
      setAddTestOpen(false);
    } catch (error) {
      toast.error("Failed to add practice test");
    }
  };

  // Handle update test
  const handleUpdateTest = async (
    updatedTest: Omit<PracticeTest, "createdAt"> & { linkedCourses: string[] }
  ) => {
    try {
      await updatePracticeTest(updatedTest).unwrap();
      toast.success("Practice test updated successfully");
      setEditTestOpen(false);
      setTestToEdit(null);
    } catch (error) {
      toast.error("Failed to update practice test");
    }
  };

  // Get badge color based on level
  const getLevelBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "difficult":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Practice Test Modal Component (used for both Add and Edit)
  const PracticeTestModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (
      test: Omit<PracticeTest, "_id" | "createdAt"> & { linkedCourses: string[] } |
        Omit<PracticeTest, "createdAt"> & { linkedCourses: string[] }
    ) => void;
    courses: Course[];
    practiceTests: PracticeTest[];
    isEditMode?: boolean;
    initialTest?: PracticeTest | null;
  }> = ({ isOpen, onClose, onSubmit, courses, practiceTests, isEditMode = false, initialTest }) => {
    const form = useForm<{
      testName: string;
      linkedCourses: string[];
      skill: string;
      level: "Easy" | "Intermediate" | "Difficult";
      questionCount: string;
      duration: string;
      questions: Question[];
    }>({
      defaultValues: initialTest
        ? {
          testName: initialTest.testName,
          linkedCourses: Array.isArray(initialTest.linkedCourses)
            ? initialTest.linkedCourses.map((course) =>
              typeof course === "string" ? course : course._id
            )
            : [],
          skill: initialTest.skill,
          level: initialTest.level,
          questionCount: initialTest.questionCount.toString(),
          duration: initialTest.duration,
          questions: initialTest.questions,
        }
        : {
          testName: "",
          linkedCourses: [],
          skill: "React",
          level: "Easy",
          questionCount: "",
          duration: "",
          questions: [{ questionText: "", options: ["", "", "", ""], correctAnswer: "" }],
        },
    });

    const questions = form.watch("questions");

    const addQuestion = () => {
      form.setValue("questions", [
        ...questions,
        { questionText: "", options: ["", "", "", ""], correctAnswer: "" },
      ]);
    };

    const removeQuestion = (index: number) => {
      if (questions.length > 1) {
        form.setValue("questions", questions.filter((_, i) => i !== index));
      } else {
        toast.error("At least one question is required");
      }
    };

    const updateQuestion = (index: number, field: keyof Question, value: string | string[]) => {
      const updatedQuestions = [...questions];
      updatedQuestions[index][field] = value as never;
      form.setValue("questions", updatedQuestions);
    };

    const onFormSubmit = (data: {
      testName: string;
      linkedCourses: string[];
      skill: string;
      level: "Easy" | "Intermediate" | "Difficult";
      questionCount: string;
      duration: string;
      questions: Question[];
    }) => {
      if (!data.testName || !data.questionCount || !data.duration || !data.linkedCourses.length) {
        toast.error("Please fill in all test details");
        return;
      }
      if (
        data.questions.some((q) => !q.questionText || q.options.some((o) => !o) || !q.correctAnswer)
      ) {
        toast.error("Please fill in all question fields");
        return;
      }
      if (parseInt(data.questionCount) !== data.questions.length) {
        toast.error("Question count must match the number of questions added");
        return;
      }
      const testData = {
        ...(isEditMode && initialTest ? { _id: initialTest._id } : {}),
        testName: data.testName,
        linkedCourses: data.linkedCourses,
        skill: data.skill,
        level: data.level,
        questionCount: parseInt(data.questionCount),
        duration: data.duration,
        questions: data.questions,
      };
      onSubmit(testData as any); // Type assertion for union type
      form.reset();
      onClose();
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {isEditMode ? "Edit Practice Test" : "Add New Practice Test"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="testName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Test Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter test name"
                        className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        disabled={isEditMode} // Disable in edit mode
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="linkedCourses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Linked Courses</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const currentValues = field.value || [];
                        if (!currentValues.includes(value)) {
                          field.onChange([...currentValues, value]);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                          <SelectValue placeholder="Select courses" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="dark:bg-gray-800">
                        {courses.map((course) => (
                          <SelectItem
                            key={course._id}
                            value={course._id}
                            className="dark:text-white dark:focus:bg-gray-700"
                          >
                            {course.courseName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {field.value?.map((courseId) => {
                        const course = courses.find((c) => c._id === courseId);
                        return course ? (
                          <div
                            key={courseId}
                            className="flex items-center gap-1 bg-blue-50 dark:bg-gray-700 px-2 py-1 rounded-md"
                          >
                            <span className="text-sm text-blue-700 dark:text-blue-300">
                              {course.courseName}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-blue-100 dark:hover:bg-gray-600"
                              onClick={() => field.onChange(field.value.filter((id) => id !== courseId))}
                            >
                              ×
                            </Button>
                          </div>
                        ) : null;
                      })}
                    </div>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Skill
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                          <SelectValue placeholder="Select skill" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="dark:bg-gray-800 max-h-60 overflow-y-auto">
                        {keywordOptions.map((skill) => (
                          <SelectItem key={skill} value={skill} className="dark:text-white">
                            {skill}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Level
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="dark:bg-gray-800">
                        {["Easy", "Intermediate", "Difficult"].map((level) => (
                          <SelectItem key={level} value={level} className="dark:text-white">
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="questionCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Number of Questions
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="Enter number of questions"
                        className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Duration
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., 30 mins"
                        className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Questions
                  </label>
                  <Button
                    type="button"
                    onClick={addQuestion}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
                  >
                    Add Question
                  </Button>
                </div>
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className="space-y-2 rounded-md border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Question {index + 1}
                      </label>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(index)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <RxCross2 size={16} />
                        </Button>
                      )}
                    </div>
                    <Input
                      value={question.questionText}
                      onChange={(e) => updateQuestion(index, "questionText", e.target.value)}
                      placeholder="Enter question text"
                      className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <Input
                          key={optIndex}
                          value={option}
                          onChange={(e) => {
                            const updatedOptions = [...question.options];
                            updatedOptions[optIndex] = e.target.value;
                            updateQuestion(index, "options", updatedOptions);
                          }}
                          placeholder={`Option ${optIndex + 1}`}
                          className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      ))}
                    </div>
                    <select
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(index, "correctAnswer", e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select correct answer</option>
                      {question.options.map((option, optIndex) => (
                        <option key={optIndex} value={option} disabled={!option}>
                          {option || `Option ${optIndex + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  {isEditMode ? "Update Test" : "Add Test"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  };

  // View Test Modal Component
  const ViewTestModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    test: PracticeTest | null;
  }> = ({ isOpen, onClose, test }) => {
    if (!test) return null;
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {test.testName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              <strong>Skill:</strong> {test.skill}
            </p>
            <p>
              <strong>Level:</strong> {test.level}
            </p>
            <p>
              <strong>Question Count:</strong> {test.questionCount}
            </p>
            <p>
              <strong>Duration:</strong> {test.duration}
            </p>
            <p>
              <strong>Linked Courses:</strong>{" "}
              {Array.isArray(test.linkedCourses) &&
                test.linkedCourses
                  .map((course) => (typeof course === "string" ? course : course.courseName))
                  .join(", ")}
            </p>
            <div>
              <strong>Questions:</strong>
              {test.questions.map((question, index) => (
                <div key={index} className="mt-2 rounded-md border p-4 dark:border-gray-700">
                  <p>
                    <strong>Question {index + 1}:</strong> {question.questionText}
                  </p>
                  <ul className="ml-4 list-disc">
                    {question.options.map((option, optIndex) => (
                      <li
                        key={optIndex}
                        className={option === question.correctAnswer ? "text-green-600" : ""}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                  <p>
                    <strong>Correct Answer:</strong> {question.correctAnswer}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm dark:bg-gray-800 md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">
          Practice Test Management
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 transform bg-white shadow-lg transition-transform duration-300 dark:bg-gray-800 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <Sidebar userRole="admin" />
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main className="w-full flex-1 overflow-x-hidden pt-16">
        <div className="container mx-auto px-4 py-6">
          <Card className="border-none bg-white shadow-md dark:bg-gray-800">
            <CardHeader className="bg-gradient-to-r rounded-t from-blue-600 to-blue-800 p-4">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Practice Test Management
                </CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                  <Input
                    type="text"
                    className="h-10 rounded border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white md:w-64"
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button
                    onClick={() => setAddTestOpen(true)}
                    className="bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-white"
                  >
                    <BookPlus className="mr-2 h-5 w-5" />
                    Add New Test
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : error ? (
                <p className="text-red-500">Error loading practice tests</p>
              ) : filteredTests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <p className="mt-2 text-lg font-medium text-gray-500 dark:text-gray-400">
                    No Practice Tests Found
                  </p>
                  <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                    Try adding a new test or adjusting your search.
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Name</TableHead>
                        <TableHead>Skill</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Questions</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Courses</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedTests.map((test) => (
                        <TableRow key={test._id}>
                          <TableCell>{test.testName}</TableCell>
                          <TableCell>{test.skill}</TableCell>
                          <TableCell>
                            <Badge className={getLevelBadgeColor(test.level)}>{test.level}</Badge>
                          </TableCell>
                          <TableCell>{test.questionCount}</TableCell>
                          <TableCell>{test.duration}</TableCell>
                          <TableCell>
                            {Array.isArray(test.linkedCourses) &&
                              test.linkedCourses
                                .map((course) => (typeof course === "string" ? course : course.courseName))
                                .join(", ")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewTest(test)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTest(test)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => confirmDeleteTest(test._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <div className="flex gap-2">
                        {generatePaginationNumbers().map((page, index) =>
                          typeof page === "string" ? (
                            <span key={index} className="px-2">
                              ...
                            </span>
                          ) : (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          )
                        )}
                      </div>
                      <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      <PracticeTestModal
        isOpen={addTestOpen}
        onClose={() => setAddTestOpen(false)}
        onSubmit={handleAddTest}
        courses={availableCourses}
        practiceTests={practiceTests}
      />
      <PracticeTestModal
        isOpen={editTestOpen}
        onClose={() => {
          setEditTestOpen(false);
          setTestToEdit(null);
        }}
        onSubmit={handleUpdateTest}
        courses={availableCourses}
        practiceTests={practiceTests}
        isEditMode={true}
        initialTest={testToEdit}
      />
      <ViewTestModal isOpen={viewOpen} onClose={() => setViewOpen(false)} test={selectedTest} />
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this practice test? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTest}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PracticeTestPage;
