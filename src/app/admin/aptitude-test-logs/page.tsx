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
import {
  Menu,
  Search,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
} from "lucide-react";
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
import {
  useGetCollegesQuery,
  useCreateCollegeMutation,
  useUpdateCollegeMutation,
  useDeleteCollegeMutation,
} from "@/services/api";

interface College {
  _id: string;
  name: string;
  email: string;
  testLink: string;
  testDuration: number;
  isActive: boolean;
  createdAt: string;
  testSettings: {
    questionsPerTest: number;
    passingScore: number;
    allowRetake: boolean;
  };
}

const AptitudePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [collegeToDelete, setCollegeToDelete] = useState<string | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [collegesPerPage, setCollegesPerPage] = useState<number | "all">(10);
  const [newCollegeName, setNewCollegeName] = useState("");
  const [newCollegeEmail, setNewCollegeEmail] = useState("");
  const [newTestLink, setNewTestLink] = useState("");
  const [newTestDuration, setNewTestDuration] = useState<number | "">(120);
  const [newQuestionsPerTest, setNewQuestionsPerTest] = useState<number | "">(
    100,
  );
  const [newPassingScore, setNewPassingScore] = useState<number | "">(60);
  const [newAllowRetake, setNewAllowRetake] = useState(false);
  const [editCollegeName, setEditCollegeName] = useState("");
  const [editCollegeEmail, setEditCollegeEmail] = useState("");
  const [editTestLink, setEditTestLink] = useState("");
  const [editTestDuration, setEditTestDuration] = useState<number | "">("");
  const [editQuestionsPerTest, setEditQuestionsPerTest] = useState<number | "">(
    "",
  );
  const [editPassingScore, setEditPassingScore] = useState<number | "">("");
  const [editAllowRetake, setEditAllowRetake] = useState(false);
  const [editIsActive, setEditIsActive] = useState(false);

  // Fetch colleges using useGetCollegesQuery
  const { data: colleges, isLoading, error } = useGetCollegesQuery(undefined);

  // Mutations for college operations
  const [createCollege] = useCreateCollegeMutation();
  const [updateCollege] = useUpdateCollegeMutation();
  const [deleteCollege] = useDeleteCollegeMutation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCreateCollege = async () => {
    if (
      !newCollegeName ||
      !newCollegeEmail ||
      !newTestLink ||
      newTestDuration === "" ||
      newQuestionsPerTest === "" ||
      newPassingScore === ""
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const newCollege: College = {
        _id: `college_${Date.now()}`, // Temporary ID, replaced by API
        name: newCollegeName,
        email: newCollegeEmail,
        testLink: newTestLink,
        testDuration: Number(newTestDuration),
        isActive: true,
        createdAt: new Date().toISOString(),
        testSettings: {
          questionsPerTest: Number(newQuestionsPerTest),
          passingScore: Number(newPassingScore),
          allowRetake: newAllowRetake,
        },
      };

      await createCollege(newCollege).unwrap();
      toast.success("College created successfully");
      setCreateDialogOpen(false);
      setNewCollegeName("");
      setNewCollegeEmail("");
      setNewTestLink("");
      setNewTestDuration(120);
      setNewQuestionsPerTest(100);
      setNewPassingScore(60);
      setNewAllowRetake(false);
    } catch (err) {
      toast.error("Failed to create college. Please try again.");
    }
  };

  const handleEditCollege = async () => {
    if (
      !selectedCollege ||
      !editCollegeName ||
      !editCollegeEmail ||
      !editTestLink ||
      editTestDuration === "" ||
      editQuestionsPerTest === "" ||
      editPassingScore === ""
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const updatedCollege: College = {
        ...selectedCollege,
        name: editCollegeName,
        email: editCollegeEmail,
        testLink: editTestLink,
        testDuration: Number(editTestDuration),
        isActive: editIsActive,
        testSettings: {
          questionsPerTest: Number(editQuestionsPerTest),
          passingScore: Number(editPassingScore),
          allowRetake: editAllowRetake,
        },
      };

      await updateCollege(updatedCollege).unwrap();
      toast.success("College updated successfully");
      setEditDialogOpen(false);
      setSelectedCollege(null);
      setEditCollegeName("");
      setEditCollegeEmail("");
      setEditTestLink("");
      setEditTestDuration("");
      setEditQuestionsPerTest("");
      setEditPassingScore("");
      setEditAllowRetake(false);
      setEditIsActive(false);
    } catch (err) {
      toast.error("Failed to update college. Please try again.");
    }
  };

  const handleDeleteCollege = async (id: string) => {
    try {
      await deleteCollege(id).unwrap();
      setCollegeToDelete(null);
      setDeleteDialogOpen(false);
      toast.success("College deleted successfully");
    } catch (err) {
      toast.error("Failed to delete college. Please try again.");
    }
  };

  const handleViewCollege = (college: College) => {
    setSelectedCollege(college);
    setViewDialogOpen(true);
  };

  const handleOpenEditDialog = (college: College) => {
    setSelectedCollege(college);
    setEditCollegeName(college.name);
    setEditCollegeEmail(college.email);
    setEditTestLink(college.testLink);
    setEditTestDuration(college.testDuration);
    setEditQuestionsPerTest(college.testSettings.questionsPerTest);
    setEditPassingScore(college.testSettings.passingScore);
    setEditAllowRetake(college.testSettings.allowRetake);
    setEditIsActive(college.isActive);
    setEditDialogOpen(true);
  };

  const filteredColleges = colleges?.filter(
    (college: College) =>
      college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.email.toLowerCase().includes(searchTerm.toLowerCase()),
  ) || [];

  const startIndex =
    collegesPerPage === "all" ? 0 : (currentPage - 1) * collegesPerPage;
  const totalPages =
    collegesPerPage === "all"
      ? 1
      : Math.ceil(filteredColleges.length / collegesPerPage);
  const displayedColleges =
    collegesPerPage === "all"
      ? filteredColleges
      : filteredColleges.slice(startIndex, startIndex + collegesPerPage);

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

  if (error) {
    toast.error("Failed to load colleges. Please try again.");
  }

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
        <h1 className="text-lg font-bold text-gray-800">Colleges</h1>
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
                  Colleges Management
                </CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                  <Input
                    type="text"
                    placeholder="Search colleges..."
                    className="h-10 w-full rounded border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 dark:text-black md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="h-10 w-full rounded bg-white text-blue-600 transition-colors hover:bg-blue-50 md:w-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New College
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Table */}
              <div className="m-4 overflow-x-auto">
                <Table className="w-full text-black dark:text-white">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                      <TableHead className="hidden py-3 text-center sm:table-cell">
                        #
                      </TableHead>
                      <TableHead className="py-3">College Name</TableHead>
                      <TableHead className="hidden py-3 md:table-cell">
                        Email
                      </TableHead>
                      <TableHead className="hidden py-3 lg:table-cell">
                        Test Duration
                      </TableHead>
                      <TableHead className="hidden py-3 xl:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="hidden py-3 xl:table-cell">
                        Created At
                      </TableHead>
                      <TableHead className="py-3 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: collegesPerPage === "all" ? 5 : collegesPerPage }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell className="hidden sm:table-cell">
                            <Skeleton className="h-6 w-8 mx-auto" />
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
                          <TableCell>
                            <Skeleton className="h-6 w-24 mx-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : displayedColleges.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="py-6 text-center text-gray-500 dark:text-gray-400"
                        >
                          No colleges found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedColleges.map((college: College, index: number) => (
                        <TableRow
                          key={college._id}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <TableCell className="hidden text-center font-medium sm:table-cell">
                            {startIndex + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="md:hidden">
                              <p className="font-medium">{college.name}</p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {college.email}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Duration: {college.testDuration} mins
                              </p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Status: {college.isActive ? "Active" : "Inactive"}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Created: {formatDate(college.createdAt)}
                              </p>
                            </div>
                            <span className="hidden font-medium md:inline">
                              {college.name}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {college.email}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {college.testDuration} mins
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {college.isActive ? "Active" : "Inactive"}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {formatDate(college.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                onClick={() => handleViewCollege(college)}
                                aria-label="View college"
                              >
                                <Eye
                                  size={16}
                                  className="transition-transform group-hover:scale-110"
                                />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  View college
                                </span>
                              </button>
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-yellow-50 text-yellow-600 transition-all duration-200 hover:bg-yellow-100 hover:text-yellow-700 hover:shadow-md dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30 dark:hover:text-yellow-300"
                                onClick={() => handleOpenEditDialog(college)}
                                aria-label="Edit college"
                              >
                                <Edit2
                                  size={16}
                                  className="transition-transform group-hover:scale-110"
                                />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  Edit college
                                </span>
                              </button>
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                onClick={() => {
                                  setCollegeToDelete(college._id);
                                  setDeleteDialogOpen(true);
                                }}
                                aria-label="Delete college"
                              >
                                <Trash2
                                  size={16}
                                  className="transition-transform group-hover:scale-110"
                                />
                                <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                  Delete college
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

          {/* Create College Dialog */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent className="max-w-2xl dark:bg-gray-800 dark:text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Create New College
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Enter the details for the new college.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    College Name
                  </label>
                  <Input
                    type="text"
                    value={newCollegeName}
                    onChange={(e) => setNewCollegeName(e.target.value)}
                    placeholder="Enter college name"
                    className="mt-1 h-10 w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={newCollegeEmail}
                    onChange={(e) => setNewCollegeEmail(e.target.value)}
                    placeholder="Enter college email"
                    className="mt-1 h-10 w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Test Link
                  </label>
                  <Input
                    type="text"
                    value={newTestLink}
                    onChange={(e) => setNewTestLink(e.target.value)}
                    placeholder="Enter test link"
                    className="mt-1 h-10 w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Test Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={newTestDuration}
                    onChange={(e) => setNewTestDuration(Number(e.target.value))}
                    placeholder="Enter test duration"
                    className="mt-1 h-10 w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Questions Per Test
                  </label>
                  <Input
                    type="number"
                    value={newQuestionsPerTest}
                    onChange={(e) => setNewQuestionsPerTest(Number(e.target.value))}
                    placeholder="Enter number of questions"
                    className="mt-1 h-10 w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Passing Score (%)
                  </label>
                  <Input
                    type="number"
                    value={newPassingScore}
                    onChange={(e) => setNewPassingScore(Number(e.target.value))}
                    placeholder="Enter passing score"
                    className="mt-1 h-10 w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="newAllowRetake"
                    checked={newAllowRetake}
                    onChange={(e) => setNewAllowRetake(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-700"
                  />
                  <label
                    htmlFor="newAllowRetake"
                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Allow Retake
                  </label>
                </div>
              </div>
              <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setNewCollegeName("");
                    setNewCollegeEmail("");
                    setNewTestLink("");
                    setNewTestDuration(120);
                    setNewQuestionsPerTest(100);
                    setNewPassingScore(60);
                    setNewAllowRetake(false);
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCollege}
                  className="w-full sm:w-auto"
                  disabled={isLoading || !!error}
                >
                  Create College
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View College Dialog */}
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="max-w-2xl dark:bg-gray-800 dark:text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  View College
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Details of the selected college.
                </DialogDescription>
              </DialogHeader>
              {selectedCollege && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      College Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedCollege.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedCollege.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Test Link
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedCollege.testLink}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Test Duration
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedCollege.testDuration} mins
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Questions Per Test
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedCollege.testSettings.questionsPerTest}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Passing Score
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedCollege.testSettings.passingScore}%
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Allow Retake
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedCollege.testSettings.allowRetake ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Status
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedCollege.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              )}
              <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit College Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-2xl dark:bg-gray-800 dark:text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Edit College
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Update the details for the college.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    College Name
                  </label>
                  <Input
                    type="text"
                    value={editCollegeName}
                    onChange={(e) => setEditCollegeName(e.target.value)}
                    placeholder="Enter college name"
                    className="mt-1 h-10 w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={editCollegeEmail}
                    onChange={(e) => setEditCollegeEmail(e.target.value)}
                    placeholder="Enter college email"
                    className="mt-1 h-10 w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Test Link
                  </label>
                  <Input
                    type="text"
                    value={editTestLink}
                    onChange={(e) => setEditTestLink(e.target.value)}
                    placeholder="Enter test link"
                    className="mt-1 h-10 w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Test Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={editTestDuration}
                    onChange={(e) => setEditTestDuration(Number(e.target.value))}
                    placeholder="Enter test duration"
                    className="mt-1 h-10 w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Questions Per Test
                  </label>
                  <Input
                    type="number"
                    value={editQuestionsPerTest}
                    onChange={(e) => setEditQuestionsPerTest(Number(e.target.value))}
                    placeholder="Enter number of questions"
                    className="mt-1 h-10 w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Passing Score (%)
                  </label>
                  <Input
                    type="number"
                    value={editPassingScore}
                    onChange={(e) => setEditPassingScore(Number(e.target.value))}
                    placeholder="Enter passing score"
                    className="mt-1 h-10 w-full rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editAllowRetake"
                    checked={editAllowRetake}
                    onChange={(e) => setEditAllowRetake(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-700"
                  />
                  <label
                    htmlFor="editAllowRetake"
                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Allow Retake
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-700"
                  />
                  <label
                    htmlFor="editIsActive"
                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Active
                  </label>
                </div>
              </div>
              <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false);
                    setSelectedCollege(null);
                    setEditCollegeName("");
                    setEditCollegeEmail("");
                    setEditTestLink("");
                    setEditTestDuration("");
                    setEditQuestionsPerTest("");
                    setEditPassingScore("");
                    setEditAllowRetake(false);
                    setEditIsActive(false);
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditCollege}
                  className="w-full sm:w-auto"
                  disabled={isLoading || !!error}
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
                  Are you sure you want to delete this college? This action cannot be undone.
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
                  onClick={() => collegeToDelete && handleDeleteCollege(collegeToDelete)}
                  className="w-full sm:w-auto"
                >
                  Delete College
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Pagination */}
          <div className="mt-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {collegesPerPage === "all" ? 1 : startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {collegesPerPage === "all"
                    ? filteredColleges.length
                    : Math.min(startIndex + collegesPerPage, filteredColleges.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {filteredColleges.length}
                </span>{" "}
                colleges
                <div className="flex items-center space-x-2 pt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Show:
                  </span>
                  <Select
                    value={collegesPerPage.toString()}
                    onValueChange={(value) => {
                      setCollegesPerPage(value === "all" ? "all" : parseInt(value));
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
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    ) : (
                      <span key={`ellipsis-${index}`} className="px-1 text-gray-400">
                        {page}
                      </span>
                    ),
                  )}
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