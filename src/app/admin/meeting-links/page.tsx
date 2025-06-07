"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminSkeletonWrapper } from "@/components/ui/admin-skeleton-wrapper";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronUp,
  ChevronDown,
  Eye,
  Trash2,
  Menu,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Calendar,
  Clock,
  Video,
  Edit,
  Plus,
  RefreshCw,
  Link as LinkIcon,
  User,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  useFetchMeetingLinksQuery,
  useAddMeetingLinkMutation,
  useUpdateMeetingLinkMutation,
  useDeleteMeetingLinkMutation,
  useGenerateMeetingLinkMutation,
  useUpdateMeetingStatusMutation
} from "@/services/api";

// Define Meeting Link type
interface MeetingLink {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  link: string;
  platform: "Google Meet" | "Zoom" | "Microsoft Teams" | "Other";
  instructor: string;
  status: "upcoming" | "past" | "cancelled";
  recording?: string;
  createdAt: string;
  meetingId?: string;
  passcode?: string;
  duration?: number;
  hostUrl?: string;
  participantUrl?: string;
  startUrl?: string;
  joinUrl?: string;
}

const MeetingLinksPage: React.FC = () => {
  const [sortField, setSortField] = useState<keyof MeetingLink | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [itemsPerPage] = useState(10);

  // Meeting dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingLink | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    link: "",
    platform: "Zoom",
    instructor: "",
    recording: "",
    duration: 60,
  });

  // RTK Query hooks
  const { data: meetingLinksData, isLoading, refetch } = useFetchMeetingLinksQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
    status: selectedFilter !== 'all' ? selectedFilter : undefined,
    sortField: sortField || undefined,
    sortOrder: sortOrder
  });

  console.log("meetingLinksData", meetingLinksData);

  const [addMeetingLink, { isLoading: isAddingMeeting }] = useAddMeetingLinkMutation();
  const [updateMeetingLink, { isLoading: isUpdatingMeeting }] = useUpdateMeetingLinkMutation();
  const [deleteMeetingLink, { isLoading: isDeletingMeeting }] = useDeleteMeetingLinkMutation();
  const [generateMeetingLink, { isLoading: isGeneratingLink }] = useGenerateMeetingLinkMutation();
  const [updateMeetingStatus] = useUpdateMeetingStatusMutation();

  const router = useRouter();

  // Extract meeting links and pagination from data
  const meetingLinks = meetingLinksData?.data?.meetings || [];

  // Update totalPages when data changes
  useEffect(() => {
    if (meetingLinksData?.data?.pagination) {
      setTotalPages(meetingLinksData.data.pagination.totalPages);
    }
  }, [meetingLinksData]);

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Helper functions
  const handleSort = (field: keyof MeetingLink) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Function to generate real-time meeting link
  const generateRealTimeMeetingLink = async (platform: string) => {
    try {
      const response = await generateMeetingLink({
        platform,
        title: formData.title || 'Untitled Meeting',
        date: formData.date || new Date().toISOString().split('T')[0],
        time: formData.time || '10:00',
        duration: formData.duration || 60
      }).unwrap();

      if (response.success && response.meetingLink) {
        return response.meetingLink;
      } else {
        toast.error(response.message || 'Failed to generate meeting link');
        return formData.link || '';
      }
    } catch (error) {
      console.error('Error generating meeting link:', error);
      toast.error('Failed to connect to meeting service. Using placeholder link instead.');

      // Fallback to placeholder if API fails
      const placeholderInfo = {
        id: Math.floor(100000000 + Math.random() * 900000000),
        passcode: Math.random().toString(36).substring(2, 10)
      };

      switch (platform) {
        case "Zoom":
          return `https://zoom.us/j/${placeholderInfo.id}?pwd=${placeholderInfo.passcode}`;
        case "Google Meet":
          return `https://meet.google.com/lookup/${placeholderInfo.passcode.substring(0, 3)}-${placeholderInfo.passcode.substring(3, 6)}-${placeholderInfo.passcode.substring(6, 9)}`;
        case "Microsoft Teams":
          return `https://teams.microsoft.com/l/meetup-join/19:meeting_${placeholderInfo.id}%40thread.v2/0?context=%7B%22Tid%22:%22placeholder%22%7D`;
        default:
          return `https://meet.jit.si/${placeholderInfo.passcode.replace(/-/g, '')}`;
      }
    }
  };

  // Update handleSelectChange to handle async function
  const handleSelectChange = async (value: string) => {
    // Update platform immediately for better UX
    setFormData(prev => ({
      ...prev,
      platform: value,
    }));

    // Generate a new link based on the selected platform
    const newLink = await generateRealTimeMeetingLink(value);

    // Update link in form data
    setFormData(prev => ({
      ...prev,
      link: newLink
    }));
  };

  // Update handleCreateMeeting to be async
  const handleCreateMeeting = async () => {
    const defaultPlatform = "Zoom";

    // Reset form data with default values
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split('T')[0], // Today's date
      time: "",
      link: "", // Will be set after API call
      platform: defaultPlatform,
      instructor: "",
      recording: "",
      duration: 60,
    });

    // Open dialog right away for better UX
    setCreateDialogOpen(true);

    // Generate link in background
    const newLink = await generateRealTimeMeetingLink(defaultPlatform);

    // Update form with the generated link
    setFormData(prev => ({
      ...prev,
      link: newLink
    }));
  };

  const handleEditMeeting = (meeting: MeetingLink) => {
    setSelectedMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description,
      date: new Date(meeting.date).toISOString().split('T')[0],
      time: meeting.time,
      link: meeting.link,
      platform: meeting.platform,
      instructor: meeting.instructor,
      recording: meeting.recording || "",
      duration: meeting.duration || 60,
    });
    setEditDialogOpen(true);
  };

  const handleViewMeeting = (meeting: MeetingLink) => {
    setSelectedMeeting(meeting);
    setViewDialogOpen(true);
  };

  const handleDeleteMeeting = (meeting: MeetingLink) => {
    setSelectedMeeting(meeting);
    setDeleteDialogOpen(true);
  };

  // Update confirmDelete to use the API
  const confirmDelete = async () => {
    if (!selectedMeeting) return;

    try {
      await deleteMeetingLink(selectedMeeting._id).unwrap();

      toast.success("Meeting link deleted successfully");
      setDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error deleting meeting link:", error);
      toast.error("Failed to delete meeting link");
    }
  };

  // Update handleSubmitMeeting to make actual API calls
  const handleSubmitMeeting = async (isEditing: boolean = false) => {
    try {
      // Validate form
      const requiredFields = ["title", "description", "date", "time", "platform", "instructor"];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
        return;
      }

      // Format the data with proper typing
      const meetingData = {
        ...formData,
        platform: formData.platform as "Zoom" | "Google Meet" | "Microsoft Teams" | "Other",
        status: isEditing ? selectedMeeting?.status : "upcoming",
      };

      if (isEditing && selectedMeeting) {
        // Update existing meeting
        await updateMeetingLink({
          id: selectedMeeting._id,
          ...meetingData
        }).unwrap();

        toast.success("Meeting link updated successfully");
        setEditDialogOpen(false);
      } else {
        // Create new meeting
        await addMeetingLink(meetingData).unwrap();

        toast.success("Meeting link created successfully");
        setCreateDialogOpen(false);
      }

      // Refresh the meeting list
      refetch();
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "creating"} meeting link:`, error);
      toast.error(`Failed to ${isEditing ? "update" : "create"} meeting link. Please try again.`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCopyLink = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })} at ${timeString}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-green-500 dark:text-white/70">Upcoming</Badge>;
      case "past":
        return <Badge className="bg-gray-500 dark:text-white">Past</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500 dark:text-white/90">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-500 dark:text-white">Unknown</Badge>;
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;

  // Generate pagination numbers
  const generatePaginationNumbers = () => {
    const pageNumbers = [];
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

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header with Menu Button */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Meeting Links</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Sidebar - fixed position with proper scrolling */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between px-4 md:justify-end">
            <h1 className="text-xl font-bold md:hidden">Dashboard</h1>
          </div>

          {/* Sidebar Content - Scrollable */}
          <div className="custom-scrollbar flex-1 overflow-y-auto">
            <Sidebar  userRole="admin"/>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto pt-16 md:ml-64">
        <div className="container mx-auto px-4 py-6">
          {/* Page Header */}
          <Card className="mb-6 overflow-hidden border-none bg-white shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                  Meeting Links Management
                </CardTitle>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                  <Input
                    type="text"
                    placeholder="Search meetings..."
                    className="h-10 w-full rounded border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 md:w-64"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      // Optionally trigger refetch if needed
                      if (e.target.value === '') {
                        refetch();
                      }
                    }}
                    aria-label="Search meetings"
                  />
                  <Button
                    onClick={handleCreateMeeting}
                    className="w-full md:w-auto rounded-md hover:bg-white/90 text-blue-800 bg-white"
                    disabled={isGeneratingLink}
                  >
                    {isGeneratingLink ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Meeting Link
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 dark:bg-gray-700">
              {/* Stats Cards */}
              <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="border-t-4 border-t-blue-700 dark:bg-gray-900 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Meetings
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          {meetingLinksData?.data?.pagination?.totalItems || 0}
                        </div>
                        <p className="text-xs text-blue-600 text-muted-foreground">
                          {meetingLinksData?.data?.stats?.growth?.total > 0
                            ? `+${meetingLinksData.data.stats.growth.total} from last week`
                            : meetingLinksData?.data?.stats?.growth?.total < 0
                              ? `${meetingLinksData.data.stats.growth.total} from last week`
                              : "No change from last week"}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card className="border-t-4 border-t-blue-700 dark:bg-gray-900 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Upcoming Meetings
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          {meetingLinksData?.data?.stats?.upcoming || 0}
                        </div>
                        <p className="text-xs text-blue-600 text-muted-foreground">
                          {meetingLinksData?.data?.stats?.growth?.upcoming > 0
                            ? `+${meetingLinksData.data.stats.growth.upcoming} from last week`
                            : meetingLinksData?.data?.stats?.growth?.upcoming < 0
                              ? `${meetingLinksData.data.stats.growth.upcoming} from last week`
                              : "No change from last week"}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card className="border-t-4 border-t-blue-700 dark:bg-gray-900 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Past Recordings
                    </CardTitle>
                    <Video className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          {meetingLinksData?.data?.stats?.recordings || 0}
                        </div>
                        <p className="text-xs text-blue-600 text-muted-foreground">
                          {meetingLinksData?.data?.stats?.growth?.recordings > 0
                            ? `+${meetingLinksData.data.stats.growth.recordings} this month`
                            : meetingLinksData?.data?.stats?.growth?.recordings < 0
                              ? `${meetingLinksData.data.stats.growth.recordings} this month`
                              : "No change this month"}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Filter Tabs */}
              <div className="mb-4 flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedFilter("all")}
                  className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${selectedFilter === "all"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                  All Meetings
                </button>
                <button
                  onClick={() => setSelectedFilter("upcoming")}
                  className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${selectedFilter === "upcoming"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setSelectedFilter("past")}
                  className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${selectedFilter === "past"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                  Past Meetings
                </button>
                <button
                  onClick={() => setSelectedFilter("cancelled")}
                  className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${selectedFilter === "cancelled"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                  Cancelled
                </button>
              </div>

            </CardContent>





            {/* Meeting Links Table */}

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="w-full text-black">
                  <TableHeader>
                    <TableRow className="border-b dark:border-b-gray-800 border-gray-200 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white">
                      <TableHead className="hidden py-3 sm:table-cell">#</TableHead>
                      <TableHead
                        className="cursor-pointer py-3"
                        onClick={() => handleSort("title")}
                      >
                        <div className="flex items-center">
                          Title
                          {sortField === "title" && (
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
                      <TableHead className="hidden py-3 md:table-cell">Instructor</TableHead>
                      <TableHead className="hidden py-3 lg:table-cell">Date & Time</TableHead>
                      <TableHead className="hidden py-3 xl:table-cell">Platform</TableHead>
                      <TableHead className="py-3">Status</TableHead>
                      <TableHead className="py-3 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 7 }).map((_, index) => (
                        <TableRow key={index} className="border-b border-gray-100">
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
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Skeleton className="h-8 w-8 rounded-full" />
                              <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : meetingLinks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-6 text-center text-gray-500">
                          No meetings found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      meetingLinks.map((meeting, index) => (
                        <TableRow
                          key={meeting._id}
                          className="border-b dark:border-gray-700 dark:text-white border-gray-100 transition-colors hover:bg-gray-50 dark:bg-gray-700"
                        >
                          <TableCell className="hidden text-center font-medium sm:table-cell">
                            {startIndex + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="md:hidden">
                              <p className="font-medium">{meeting.title}</p>
                              <p className="mt-1 text-xs text-gray-500">
                                {meeting.instructor}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {formatDateTime(meeting.date, meeting.time)}
                              </p>
                            </div>
                            <span className="hidden font-medium md:inline">
                              {meeting.title}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {meeting.instructor}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {formatDateTime(meeting.date, meeting.time)}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {meeting.platform}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(meeting.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                onClick={() => handleViewMeeting(meeting)}
                                aria-label="View meeting details"
                              >
                                <Eye size={16} className="transition-transform group-hover:scale-110" />
                              </button>
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                onClick={() => handleEditMeeting(meeting)}
                                aria-label="Edit meeting"
                              >
                                <Edit size={16} className="transition-transform group-hover:scale-110" />
                              </button>
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                onClick={() => handleDeleteMeeting(meeting)}
                                aria-label="Delete meeting"
                              >
                                <Trash2 size={16} className="transition-transform group-hover:scale-110" />
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

          {/* Add the custom scrollbar styles */}
          <style jsx global>{`
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
      </main>

      {/* Create Meeting Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle>Create New Meeting Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title*</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. JavaScript Fundamentals"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor*</Label>
                <Input
                  id="instructor"
                  name="instructor"
                  placeholder="e.g. John Doe"
                  value={formData.instructor}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description*</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide details about this meeting..."
                value={formData.description}
                onChange={handleInputChange}
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date*</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time*</Label>
                <Input
                  id="time"
                  name="time"
                  placeholder="e.g. 10:00 AM - 11:30 AM"
                  value={formData.time}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform*</Label>
                <Select
                  name="platform"
                  value={formData.platform}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Zoom">Zoom</SelectItem>
                    <SelectItem value="Google Meet">Google Meet</SelectItem>
                    <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="link">Meeting Link* (Auto-generated)</Label>
                {isGeneratingLink ? (
                  <div className="flex h-10 items-center rounded-md border border-input bg-gray-100 px-3">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin text-gray-500" />
                    <span className="text-sm text-gray-500">Generating link...</span>
                  </div>
                ) : (
                  <Input
                    id="link"
                    name="link"
                    placeholder="Meeting link will be auto-generated"
                    value={formData.link}
                    readOnly
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)*</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="15"
                max="240"
                placeholder="60"
                value={formData.duration}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={isAddingMeeting || isGeneratingLink}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmitMeeting(false)}
              disabled={isAddingMeeting || isGeneratingLink}
            >
              {isAddingMeeting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Meeting"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Meeting Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle>Edit Meeting Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title*</Label>
                <Input
                  id="edit-title"
                  name="title"
                  placeholder="e.g. JavaScript Fundamentals"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-instructor">Instructor*</Label>
                <Input
                  id="edit-instructor"
                  name="instructor"
                  placeholder="e.g. John Doe"
                  value={formData.instructor}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description*</Label>
              <Textarea
                id="edit-description"
                name="description"
                placeholder="Provide details about this meeting..."
                value={formData.description}
                onChange={handleInputChange}
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date*</Label>
                <Input
                  id="edit-date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Time*</Label>
                <Input
                  id="edit-time"
                  name="time"
                  placeholder="e.g. 10:00 AM - 11:30 AM"
                  value={formData.time}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-platform">Platform*</Label>
                <Select
                  name="platform"
                  value={formData.platform}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Zoom">Zoom</SelectItem>
                    <SelectItem value="Google Meet">Google Meet</SelectItem>
                    <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-link">Meeting Link* (Auto-generated)</Label>
                {isGeneratingLink ? (
                  <div className="flex h-10 items-center rounded-md border border-input bg-gray-100 px-3">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin text-gray-500" />
                    <span className="text-sm text-gray-500">Generating link...</span>
                  </div>
                ) : (
                  <Input
                    id="edit-link"
                    name="link"
                    placeholder="Meeting link will be auto-generated"
                    value={formData.link}
                    readOnly
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duration (minutes)*</Label>
              <Input
                id="edit-duration"
                name="duration"
                type="number"
                min="15"
                max="240"
                placeholder="60"
                value={formData.duration}
                onChange={handleInputChange}
              />
            </div>

            {selectedMeeting?.status === "past" && (
              <div className="space-y-2">
                <Label htmlFor="edit-recording">Recording URL (optional)</Label>
                <Input
                  id="edit-recording"
                  name="recording"
                  placeholder="e.g. https://example.com/recordings/meeting-recording"
                  value={formData.recording}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isUpdatingMeeting || isGeneratingLink}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmitMeeting(true)}
              disabled={isUpdatingMeeting || isGeneratingLink}
            >
              {isUpdatingMeeting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Meeting"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Meeting Dialog */}
      {selectedMeeting && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[650px] dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle>Meeting Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-bold">{selectedMeeting.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedMeeting.status)}
                    <span className="text-sm text-gray-500">
                      {formatDateTime(selectedMeeting.date, selectedMeeting.time)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(selectedMeeting._id, selectedMeeting.link)}
                  >
                    {copiedId === selectedMeeting._id ? (
                      <>
                        <Check size={16} className="mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  {selectedMeeting.status === "upcoming" && (
                    <Button
                      size="sm"
                      onClick={() => window.open(selectedMeeting.joinUrl || selectedMeeting.link, "_blank")}
                    >
                      <LinkIcon size={16} className="mr-2" />
                      Open Link
                    </Button>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <h4 className="font-medium mb-2">Meeting Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Platform</p>
                    <p className="font-medium">{selectedMeeting.platform}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Instructor</p>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1.5 text-blue-500" />
                      <p className="font-medium">{selectedMeeting.instructor}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Meeting Link</p>
                    <p className="font-medium text-blue-600 hover:underline">
                      <a href={selectedMeeting.joinUrl || selectedMeeting.link} target="_blank" rel="noopener noreferrer">
                        {selectedMeeting.joinUrl || selectedMeeting.link}
                      </a>
                    </p>
                  </div>
                  {selectedMeeting.recording && (
                    <div>
                      <p className="text-sm text-gray-500">Recording</p>
                      <p className="font-medium text-blue-600 hover:underline">
                        <a href={selectedMeeting.recording} target="_blank" rel="noopener noreferrer">
                          View Recording
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedMeeting.description}
                </p>
              </div>

              {selectedMeeting.status === "upcoming" && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-700 dark:text-blue-400">Tips for Sharing</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                      Share this meeting link with participants via the user dashboard. Theyll be able to join directly from their dashboard or copy the link.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <div className="flex gap-2 justify-between w-full">
                <div>
                  {selectedMeeting.status === "upcoming" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        try {
                          await updateMeetingStatus({
                            id: selectedMeeting._id,
                            status: "cancelled"
                          }).unwrap();
                          toast.success("Meeting cancelled successfully");
                          setViewDialogOpen(false);
                          refetch();
                        } catch (error) {
                          console.error("Error cancelling meeting:", error);
                          toast.error("Failed to cancel meeting");
                        }
                      }}
                    >
                      Cancel Meeting
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setViewDialogOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleEditMeeting(selectedMeeting);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this meeting link? This action cannot be undone.
            </p>
            {selectedMeeting && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                <p className="font-medium">{selectedMeeting.title}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDateTime(selectedMeeting.date, selectedMeeting.time)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeletingMeeting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeletingMeeting}
            >
              {isDeletingMeeting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Meeting"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeetingLinksPage; 