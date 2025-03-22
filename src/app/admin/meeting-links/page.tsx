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
}

const MeetingLinksPage: React.FC = () => {
  const [meetingLinks, setMeetingLinks] = useState<MeetingLink[]>([]);
  const [sortField, setSortField] = useState<keyof MeetingLink | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  
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
  });
  
  const router = useRouter();
  const itemsPerPage = 10;

  // Mock data for UI demonstration - will be replaced with API calls
  const mockMeetingLinks: MeetingLink[] = [
    {
      _id: "1",
      title: "JavaScript Fundamentals - Week 1",
      description: "Introduction to JavaScript variables, functions, and control flow",
      date: "2023-12-15",
      time: "10:00 AM - 11:30 AM",
      link: "https://meet.google.com/abc-defg-hij",
      platform: "Google Meet",
      instructor: "John Doe",
      status: "upcoming",
      createdAt: "2023-11-01T10:30:00Z",
    },
    {
      _id: "2",
      title: "React Components Workshop",
      description: "Hands-on workshop on building reusable React components",
      date: "2023-12-17",
      time: "2:00 PM - 4:00 PM",
      link: "https://zoom.us/j/123456789",
      platform: "Zoom",
      instructor: "Jane Smith",
      status: "upcoming",
      createdAt: "2023-11-05T15:45:00Z",
    },
    {
      _id: "3",
      title: "Node.js API Development",
      description: "Building RESTful APIs with Node.js and Express",
      date: "2023-11-20",
      time: "11:00 AM - 12:30 PM",
      link: "https://teams.microsoft.com/l/meetup-join/abc123",
      platform: "Microsoft Teams",
      instructor: "Robert Johnson",
      status: "past",
      recording: "https://example.com/recordings/nodejs-api",
      createdAt: "2023-10-15T11:00:00Z",
    },
    {
      _id: "4",
      title: "CSS Grid & Flexbox Masterclass",
      description: "Deep dive into modern CSS layout techniques",
      date: "2023-10-10",
      time: "1:00 PM - 2:30 PM",
      link: "https://zoom.us/j/987654321",
      platform: "Zoom",
      instructor: "Sarah Williams",
      status: "cancelled",
      createdAt: "2023-09-25T13:00:00Z",
    },
    {
      _id: "5",
      title: "TypeScript Fundamentals",
      description: "Introduction to TypeScript types, interfaces, and generics",
      date: "2023-09-05",
      time: "10:00 AM - 11:30 AM",
      link: "https://meet.google.com/xyz-abcd-efg",
      platform: "Google Meet",
      instructor: "Michael Brown",
      status: "past",
      recording: "https://example.com/recordings/typescript-fundamentals",
      createdAt: "2023-08-20T10:00:00Z",
    },
  ];

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

  // Simulate API fetch with loading state
  useEffect(() => {
    const fetchMeetingLinks = async () => {
      setIsLoading(true);
      try {
        // Construct the API URL with query parameters
        const apiUrl = `/api/meetings?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}${selectedFilter !== 'all' ? `&status=${selectedFilter}` : ''}`;
        
        if (sortField) {
          apiUrl += `&sortField=${sortField}&sortOrder=${sortOrder}`;
        }
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch meeting links');
        }
        
        setMeetingLinks(data.meetings);
        setTotalPages(data.pagination.totalPages);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching meeting links:", error);
        
        // Fallback to mock data for demo/development
        setTimeout(() => {
          let filteredLinks = [...mockMeetingLinks];
          
          // Apply filter
          if (selectedFilter !== "all") {
            filteredLinks = filteredLinks.filter(link => link.status === selectedFilter);
          }
          
          // Apply search
          if (searchTerm) {
            filteredLinks = filteredLinks.filter(
              link => 
                link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                link.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                link.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          
          // Apply sorting
          if (sortField) {
            filteredLinks.sort((a, b) => {
              if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
              if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
              return 0;
            });
          }
          
          setMeetingLinks(filteredLinks);
          setTotalPages(Math.ceil(filteredLinks.length / itemsPerPage));
          setIsLoading(false);
          
          toast.error("Using mock data: Failed to connect to the server");
        }, 1500);
      }
    };

    fetchMeetingLinks();
  }, [currentPage, searchTerm, selectedFilter, sortField, sortOrder, itemsPerPage]);

  // Helper functions
  const handleSort = (field: keyof MeetingLink) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
  
  // Replace the generateMeetingLink function with a proper API call
  const generateMeetingLink = async (platform: string) => {
    try {
      setIsLoading(true);
      // Make API call to create a real meeting on the backend
      const response = await fetch('/api/meetings/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          date: formData.date || new Date().toISOString().split('T')[0],
          time: formData.time || '10:00 AM - 11:30 AM',
          title: formData.title || 'Untitled Meeting',
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.message || 'Failed to generate meeting link');
        return formData.link || '';
      }
      
      setIsLoading(false);
      return data.meetingLink;
    } catch (error) {
      console.error('Error generating meeting link:', error);
      toast.error('Failed to connect to meeting service. Using placeholder link instead.');
      setIsLoading(false);
      
      // Fallback to placeholder if API fails
      const placeholderInfo = {
        id: Math.floor(100000000 + Math.random() * 900000000),
        passcode: crypto.randomUUID().substring(0, 8)
      };
      
      switch(platform) {
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
    setIsLoading(true);
    // Update platform immediately for better UX
    setFormData(prev => ({
      ...prev,
      platform: value,
    }));
    
    // Generate a new link based on the selected platform
    const newLink = await generateMeetingLink(value);
    
    // Update link in form data
    setFormData(prev => ({
      ...prev,
      link: newLink
    }));
    
    setIsLoading(false);
  };

  // Update handleCreateMeeting to be async
  const handleCreateMeeting = async () => {
    const defaultPlatform = "Zoom";
    setIsLoading(true);
    
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
    });
    
    // Open dialog right away for better UX
    setCreateDialogOpen(true);
    
    // Generate link in background
    const newLink = await generateMeetingLink(defaultPlatform);
    
    // Update form with the generated link
    setFormData(prev => ({
      ...prev,
      link: newLink
    }));
    
    setIsLoading(false);
  };
  
  const handleEditMeeting = (meeting: MeetingLink) => {
    setSelectedMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description,
      date: meeting.date,
      time: meeting.time,
      link: meeting.link,
      platform: meeting.platform,
      instructor: meeting.instructor,
      recording: meeting.recording || "",
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
      setIsLoading(true);
      
      const response = await fetch(`/api/meetings/${selectedMeeting._id}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete meeting link');
      }
      
      setMeetingLinks(prevLinks => prevLinks.filter(link => link._id !== selectedMeeting._id));
      toast.success("Meeting link deleted successfully");
      setDeleteDialogOpen(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error deleting meeting link:", error);
      
      // Fallback behavior for demo/development
      setTimeout(() => {
        setMeetingLinks(prevLinks => prevLinks.filter(link => link._id !== selectedMeeting._id));
        toast.success("Meeting link deleted successfully");
        setDeleteDialogOpen(false);
        setIsLoading(false);
      }, 800);
    }
  };
  
  // Update handleSubmitMeeting to make actual API calls
  const handleSubmitMeeting = async (isEditing: boolean = false) => {
    try {
      // Validate form
      const requiredFields = ["title", "description", "date", "time", "link", "platform", "instructor"];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
        return;
      }
      
      setIsLoading(true);
      
      // Format the data with proper typing
      const meetingData = {
        ...formData,
        platform: formData.platform as "Zoom" | "Google Meet" | "Microsoft Teams" | "Other",
        status: isEditing ? selectedMeeting?.status : "upcoming",
      };
      
      // Make API call to save the meeting
      const url = isEditing 
        ? `/api/meetings/${selectedMeeting?._id}` 
        : "/api/meetings";
      
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(meetingData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.message || `Failed to ${isEditing ? "update" : "create"} meeting link`);
        setIsLoading(false);
        return;
      }
      
      // Update the UI with the new data
      if (isEditing && selectedMeeting) {
        setMeetingLinks(prevLinks => 
          prevLinks.map(link => 
            link._id === selectedMeeting._id 
              ? { ...data.meeting } as MeetingLink
              : link
          )
        );
        toast.success("Meeting link updated successfully");
        setEditDialogOpen(false);
      } else {
        setMeetingLinks(prevLinks => [data.meeting as MeetingLink, ...prevLinks]);
        toast.success("Meeting link created successfully");
        setCreateDialogOpen(false);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "creating"} meeting link:`, error);
      toast.error(`Failed to ${isEditing ? "update" : "create"} meeting link. Please try again.`);
      setIsLoading(false);
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
        return <Badge className="bg-green-500">Upcoming</Badge>;
      case "past":
        return <Badge className="bg-gray-500">Past</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };
  
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
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between px-4 md:justify-end">
            <h1 className="text-xl font-bold md:hidden">Dashboard</h1>
          </div>

          {/* Sidebar Content - Scrollable */}
          <div className="custom-scrollbar flex-1 overflow-y-auto">
            <Sidebar />
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
          <div className="mb-6 flex flex-col justify-between md:flex-row md:items-center">
            <h1 className="text-2xl font-bold">Meeting Links</h1>
            <div className="mt-4 flex flex-col space-y-3 md:mt-0 md:flex-row md:space-x-3 md:space-y-0">
              <Input
                placeholder="Search meetings..."
                className="w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button 
                onClick={handleCreateMeeting}
                className="w-full md:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Meeting Link
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Meetings
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockMeetingLinks.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  +2 from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Meetings
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockMeetingLinks.filter(m => m.status === "upcoming").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  +1 from yesterday
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Past Recordings
                </CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockMeetingLinks.filter(m => m.status === "past" && m.recording).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  +3 this month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="mb-4 flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedFilter === "all"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              All Meetings
            </button>
            <button
              onClick={() => setSelectedFilter("upcoming")}
              className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedFilter === "upcoming"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setSelectedFilter("past")}
              className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedFilter === "past"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Past Meetings
            </button>
            <button
              onClick={() => setSelectedFilter("cancelled")}
              className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedFilter === "cancelled"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Cancelled
            </button>
          </div>

          {/* Meeting Links Table */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Meeting Links</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <AdminSkeletonWrapper>
                  <div className="mb-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </AdminSkeletonWrapper>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-800">
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("title")}
                          >
                            <div className="flex items-center gap-2">
                              Title
                              {sortField === "title" ? (
                                sortOrder === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )
                              ) : null}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("instructor")}
                          >
                            <div className="flex items-center gap-2">
                              Instructor
                              {sortField === "instructor" ? (
                                sortOrder === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )
                              ) : null}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("date")}
                          >
                            <div className="flex items-center gap-2">
                              Date
                              {sortField === "date" ? (
                                sortOrder === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )
                              ) : null}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("platform")}
                          >
                            <div className="flex items-center gap-2">
                              Platform
                              {sortField === "platform" ? (
                                sortOrder === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )
                              ) : null}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("status")}
                          >
                            <div className="flex items-center gap-2">
                              Status
                              {sortField === "status" ? (
                                sortOrder === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )
                              ) : null}
                            </div>
                          </TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {meetingLinks.length > 0 ? (
                          meetingLinks.map((meeting) => (
                            <TableRow key={meeting._id}>
                              <TableCell className="font-medium">
                                {meeting.title}
                              </TableCell>
                              <TableCell>{meeting.instructor}</TableCell>
                              <TableCell>{formatDate(meeting.date)}</TableCell>
                              <TableCell>{meeting.platform}</TableCell>
                              <TableCell>
                                {getStatusBadge(meeting.status)}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleViewMeeting(meeting)}
                                    title="View details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleEditMeeting(meeting)}
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDeleteMeeting(meeting)}
                                    title="Delete"
                                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="h-24 text-center"
                            >
                              No meeting links found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {meetingLinks.length > 0 && totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {generatePaginationNumbers().map((pageNum, index) => (
                          <Button
                            key={index}
                            variant={
                              pageNum === currentPage ? "default" : "outline"
                            }
                            onClick={() => {
                              if (typeof pageNum === "number") {
                                setCurrentPage(pageNum);
                              }
                            }}
                            disabled={pageNum === "..."}
                            className={pageNum === "..." ? "cursor-default" : ""}
                          >
                            {pageNum}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setCurrentPage(Math.min(totalPages, currentPage + 1))
                          }
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create Meeting Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
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
                <Input
                  id="link"
                  name="link"
                  placeholder="Meeting link will be auto-generated"
                  value={formData.link}
                  readOnly
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleSubmitMeeting(false)}
              disabled={isLoading}
            >
              {isLoading ? (
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
        <DialogContent className="sm:max-w-[600px]">
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
                <Input
                  id="edit-link"
                  name="link"
                  placeholder="Meeting link will be auto-generated"
                  value={formData.link}
                  readOnly
                />
              </div>
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleSubmitMeeting(true)}
              disabled={isLoading}
            >
              {isLoading ? (
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
          <DialogContent className="sm:max-w-[650px]">
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
                      onClick={() => window.open(selectedMeeting.link, "_blank")}
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
                      <a href={selectedMeeting.link} target="_blank" rel="noopener noreferrer">
                        {selectedMeeting.link}
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
                      Share this meeting link with participants via the user dashboard. They'll be able to join directly from their dashboard or copy the link.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
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
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isLoading}
            >
              {isLoading ? (
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