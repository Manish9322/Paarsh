"use client";

import React, { useState, useEffect } from "react";
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
  ChevronUp,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { RxCross2 } from "react-icons/rx";
import AddAgentModal from "../../../components/Agent/AddAgent";
import { Input } from "@/components/ui/input";
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useDeleteAgentMutation, useFetchAgentsQuery, useUpdateAgentMutation, useUpdateAgentTargetMutation } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import EditAgentModal from "../../../components/Agent/EditAgent";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define Sales Data type
interface SalesData {
  date: string;
  count: number;
  revenue: number;
  status: 'completed' | 'pending';
}

// Define Agent type
interface Agent {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  agentCode: string;
  totalSale: number;
  countSale: number;
  state: string;
  createdAt: string;
  target?: {
    count?: number;
    price?: number;
  };
  salesData?: SalesData[];
}

// Mock useFetchAgentSalesQuery hook (replace with actual RTK Query hook in @/services/api)
const useFetchAgentSalesQuery = (args: { agentId: string; timeFilter: string } | typeof skipToken) => {
  // This is a placeholder. Implement in @/services/api with actual API call, e.g.:
  /*
  export const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
      fetchAgentSales: builder.query<SalesData[], { agentId: string; timeFilter: string }>({
        query: ({ agentId, timeFilter }) => `/agents/${agentId}/sales?filter=${timeFilter}`,
      }),
    }),
  });
  */
  // Mock return for compilation
  return { data: [] as SalesData[], isLoading: false, error: null };
};

const AgentPage: React.FC = () => {
  const [sortField, setSortField] = useState<keyof Agent | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [targetValue, setTargetValue] = useState<number>(0);
  const [targetType, setTargetType] = useState<"count" | "price">("count");
  const [timeFilter, setTimeFilter] = useState<"daily" | "yesterday" | "weekly" | "monthly" | "yearly">("monthly");
  const [chartMetric, setChartMetric] = useState<"count" | "revenue">("count");

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

  const agentsPerPage = 10;
  const { data: agentData, isLoading: isAgentsLoading } = useFetchAgentsQuery(undefined);
  const agents: Agent[] = agentData?.data || [];
  const startIndex = (currentPage - 1) * agentsPerPage;

  const [_DELETEAGENT, { isLoading: isDeleteLoading, error: deleteError }] =
    useDeleteAgentMutation();
  const [updateAgent] = useUpdateAgentMutation();
  const [updateAgentTarget, { isLoading: isTargetUpdating }] = useUpdateAgentTargetMutation();

  // Fetch sales data dynamically
  const { data: salesData = [], isLoading: isSalesLoading, error: salesError } = useFetchAgentSalesQuery(
    selectedAgent ? { agentId: selectedAgent._id, timeFilter } : skipToken
  );

  useEffect(() => {
    if (selectedAgent && salesData) {
      const completedSales = salesData.filter(sale => sale.status === 'completed');
      setSelectedAgent({ ...selectedAgent, salesData: completedSales });
    }
  }, [selectedAgent?._id, timeFilter, salesData]);

  useEffect(() => {
    if (salesError) {
      toast.error("Failed to fetch sales data. Please try again.");
    }
  }, [salesError]);

  const handleSort = (field: keyof Agent) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredAgents = agents.filter((agent) =>
    Object.values(agent).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    if (!sortField) return 0;
    return sortOrder === "asc"
      ? a[sortField] > b[sortField]
        ? 1
        : -1
      : a[sortField] < b[sortField]
        ? 1
        : -1;
  });

  const totalPages = Math.ceil(sortedAgents.length / agentsPerPage);
  const displayedAgents = sortedAgents.slice(
    (currentPage - 1) * agentsPerPage,
    currentPage * agentsPerPage,
  );

  const confirmDeleteAgent = (agentId: string) => {
    setAgentToDelete(agentId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteAgent = async () => {
    try {
      if (!agentToDelete) return;
      const response = await _DELETEAGENT({ id: agentToDelete }).unwrap();

      if (response?.success) {
        toast.success("Agent deleted successfully");
        setDeleteConfirmOpen(false);
        setAgentToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error(
        error?.data?.message ||
          "Failed to Delete the agent. Please try again.",
      );
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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

  const handleSetTarget = async () => {
    try {
      if (!selectedAgent?._id) return;

      const response = await updateAgentTarget({
        id: selectedAgent._id,
        targetType,
        targetValue
      }).unwrap();
      
      if (response?.success) {
        toast.success(`Target set to ${targetValue} ${targetType === "count" ? "courses" : "rupees"}`);
        setTargetModalOpen(false);
        setTargetValue(0);
      } else {
        throw new Error(response?.message || "Failed to update target");
      }
    } catch (error) {
      console.error("Error setting target:", error);
      toast.error(
        error?.data?.message || error?.message ||
        "Failed to set target. Please try again."
      );
    }
  };

  // Custom tooltip formatter for better readability
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-white p-3 shadow-md dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {chartMetric === "count" ? "Sales Count" : "Revenue"}: {payload[0].value}{chartMetric === "revenue" ? " ₹" : ""}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
        <button
          onClick={toggleSidebar}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Agent Management</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex flex-1">
        <aside
          className={`fixed left-0 top-0 z-40 h-screen w-64 transform overflow-y-auto bg-white shadow-lg transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:sticky md:top-0 md:h-screen md:translate-x-0`}
        >
          <div className="h-16 md:h-0"></div>
          <Sidebar userRole="admin" />
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
          ></div>
        )}

        <main className="w-full flex-1 overflow-x-hidden pt-16">
          <div className="container mx-auto px-4 py-6">
            <Card className="mb-6 overflow-hidden border-none bg-white shadow-md dark:bg-gray-800 dark:text-white">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 pb-4 pt-6 sm:p-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                    Agent Management
                  </CardTitle>
                  <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                    <Input
                      type="text"
                      placeholder="Search agents..."
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white/90 p-2 text-black placeholder:text-gray-500 dark:text-white md:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Select
                      value={timeFilter}
                      onValueChange={(value: typeof timeFilter) => setTimeFilter(value)}
                    >
                      <SelectTrigger className="w-full md:w-48 dark:border-gray-700 dark:bg-gray-900">
                        <SelectValue placeholder="Select time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      className="h-10 w-full bg-white text-blue-600 transition-colors md:w-auto hover:bg-blue-50"
                    >
                      + Add Agent
                    </Button>
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
                          onClick={() => handleSort("firstName")}
                        >
                          <div className="flex items-center">
                            First Name
                            {sortField === "firstName" && (
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
                          onClick={() => handleSort("lastName")}
                        >
                          <div className="flex items-center">
                            Last Name
                            {sortField === "lastName" && (
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
                          onClick={() => handleSort("mobile")}
                        >
                          <div className="flex items-center">
                            Contact
                            {sortField === "mobile" && (
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
                          onClick={() => handleSort("agentCode")}
                        >
                          <div className="flex items-center">
                            AgentCode
                            {sortField === "agentCode" && (
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
                          onClick={() => handleSort("totalSale")}
                        >
                          <div className="flex items-center">
                            Total Sale
                            {sortField === "totalSale" && (
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
                          onClick={() => handleSort("countSale")}
                        >
                          <div className="flex items-center">
                            Sale Count
                            {sortField === "countSale" && (
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
                          className="hidden cursor-pointer py-3 lg:table-cell"
                          onClick={() => handleSort("state")}
                        >
                          <div className="flex items-center">
                            State
                            {sortField === "state" && (
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
                        <TableHead className="hidden py-3 lg:table-cell">
                          Target
                        </TableHead>
                        <TableHead className="py-3 text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isAgentsLoading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                          <TableRow
                            key={index}
                            className="border-b border-gray-100 dark:border-gray-700 dark:bg-gray-900"
                          >
                            <TableCell className="hidden sm:table-cell">
                              <Skeleton className="h-4 w-6" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell className="flex justify-center gap-2 sm:gap-4">
                              <Skeleton className="h-6 w-6 rounded-full" />
                              <Skeleton className="h-6 w-6 rounded-full" />
                              <Skeleton className="h-6 w-6 rounded-full" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : displayedAgents.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="py-6 text-center text-gray-500"
                          >
                            No agents found. Try a different search term or add
                            a new agent.
                          </TableCell>
                        </TableRow>
                      ) : (
                        displayedAgents.map((agent, index) => (
                          <TableRow
                            key={agent.id}
                            className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                          >
                            <TableCell className="hidden text-center font-medium sm:table-cell">
                              {startIndex + index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="sm:hidden">
                                <p className="font-medium">
                                  {agent.firstName} {agent.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Contact: {agent.mobile}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Sales: {agent.countSale}
                                </p>
                                {agent.target?.count > 0 ? (
                                  <p className="text-xs text-blue-600 dark:text-blue-400">
                                    Target: {agent.target.count} courses
                                  </p>
                                ) : agent.target?.price > 0 ? (
                                  <p className="text-xs text-green-600 dark:text-green-400">
                                    Target: ₹{agent.target.price}
                                  </p>
                                ) : null}
                              </div>
                              <span className="hidden sm:inline">
                                {agent.firstName}
                              </span>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {agent.lastName}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {agent.mobile}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {agent.agentCode}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {agent.countSale}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {agent.totalSale}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {agent.state}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {agent.target?.count > 0 ? (
                                <div className="flex items-center">
                                  <span className="mr-1 text-sm font-medium">
                                    {agent.target.count}
                                  </span>
                                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    Courses
                                  </span>
                                </div>
                              ) : agent.target?.price > 0 ? (
                                <div className="flex items-center">
                                  <span className="mr-1 text-sm font-medium">
                                    ₹{agent.target.price}
                                  </span>
                                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                    Revenue
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  No target set
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600 transition-all duration-200 hover:bg-green-100 hover:text-green-700 hover:shadow-md dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 dark:hover:text-green-300"
                                  onClick={() => {
                                    setSelectedAgent(agent);
                                    setViewOpen(true);
                                  }}
                                  aria-label="View agent details"
                                >
                                  <Eye
                                    size={16}
                                    className="transition-transform group-hover:scale-110"
                                  />
                                  <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                    View details
                                  </span>
                                </button>
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                  onClick={() => {
                                    setSelectedAgent(agent);
                                    setEditOpen(true);
                                  }}
                                  aria-label="Edit agent"
                                >
                                  <Edit
                                    size={16}
                                    className="transition-transform group-hover:scale-110"
                                  />
                                  <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                    Edit agent
                                  </span>
                                </button>
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600 transition-all duration-200 hover:bg-purple-100 hover:text-purple-700 hover:shadow-md dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30 dark:hover:text-purple-300"
                                  onClick={() => {
                                    setSelectedAgent(agent);
                                    if (agent.target?.count) {
                                      setTargetType("count");
                                      setTargetValue(agent.target.count);
                                    } else if (agent.target?.price) {
                                      setTargetType("price");
                                      setTargetValue(agent.target.price);
                                    } else {
                                      setTargetType("count");
                                      setTargetValue(0);
                                    }
                                    setTargetModalOpen(true);
                                  }}
                                  aria-label="Set target for agent"
                                >
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="16" 
                                    height="16" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    className="transition-transform group-hover:scale-110"
                                  >
                                    <circle cx="12" cy="12" r="10" />
                                    <circle cx="12" cy="12" r="6" />
                                    <circle cx="12" cy="12" r="2" />
                                  </svg>
                                  <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                    Set target
                                  </span>
                                </button>
                                <button
                                  className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                  onClick={() => confirmDeleteAgent(agent._id)}
                                  aria-label="Delete agent"
                                >
                                  <Trash2
                                    size={16}
                                    className="transition-transform group-hover:scale-110"
                                  />
                                  <span className="absolute -bottom-8 left-1/2 z-10 min-w-max -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                                    Delete agent
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

            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
              <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-lg bg-white p-0 shadow-lg dark:bg-gray-800 dark:text-white">
                <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center justify-between gap-3">
                    <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                      Agent Details
                    </DialogTitle>
                    <RxCross2
                      size={20}
                      className="cursor-pointer"
                      onClick={() => setViewOpen(false)}
                    />
                  </div>
                </DialogHeader>
                {selectedAgent ? (
                  <div className="p-6">
                    <div className="mb-6 flex items-center justify-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <span className="text-2xl font-bold">
                          {selectedAgent.firstName.charAt(0)}
                          {selectedAgent.lastName.charAt(0)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="overflow-hidden rounded-lg border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                        <div className="bg-gray-50 px-4 py-2 dark:bg-gray-700">
                          <h3 className="font-medium text-gray-700 dark:text-gray-300">
                            Personal Information
                          </h3>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                          <div className="grid grid-cols-3 px-4 py-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Full Name
                            </span>
                            <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                              {selectedAgent.firstName} {selectedAgent.lastName}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 px-4 py-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Contact
                            </span>
                            <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                              {selectedAgent.mobile}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 px-4 py-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              State
                            </span>
                            <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                              {selectedAgent.state}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-lg border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                        <div className="bg-gray-50 px-4 py-2 dark:bg-gray-700">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-700 dark:text-gray-300">
                              Sales Performance (Completed Sales)
                            </h3>
                            <div className="flex items-center gap-2">
                              <Select
                                value={chartMetric}
                                onValueChange={(value: "count" | "revenue") => setChartMetric(value)}
                              >
                                <SelectTrigger className="w-32 dark:border-gray-700 dark:bg-gray-900">
                                  <SelectValue placeholder="Select metric" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="count">Sales Count</SelectItem>
                                  <SelectItem value="revenue">Revenue</SelectItem>
                                </SelectContent>
                              </Select>
                              <Select
                                value={timeFilter}
                                onValueChange={(value: typeof timeFilter) => setTimeFilter(value)}
                              >
                                <SelectTrigger className="w-32 dark:border-gray-700 dark:bg-gray-900">
                                  <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="yesterday">Yesterday</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-3 px-4 py-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Total Completed Sales
                            </span>
                            <div className="col-span-2 flex items-center">
                              {isSalesLoading ? (
                                <Skeleton className="h-4 w-20" />
                              ) : (
                                <>
                                  <span className="text-sm text-gray-900 dark:text-gray-200">
                                    {selectedAgent.countSale}
                                  </span>
                                  <div className="ml-2 h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                                    <div
                                      className="h-full rounded-full bg-blue-500"
                                      style={{
                                        width: `${Math.min(selectedAgent.countSale * 5, 100)}%`,
                                      }}
                                    ></div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="mt-4 h-64">
                            {isSalesLoading ? (
                              <div className="flex h-full items-center justify-center">
                                <Skeleton className="h-48 w-full" />
                              </div>
                            ) : salesError ? (
                              <div className="flex h-full items-center justify-center text-sm text-red-500 dark:text-red-400">
                                Error loading sales data
                              </div>
                            ) : selectedAgent.salesData?.length === 0 ? (
                              <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                                No completed sales data available
                              </div>
                            ) : (
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart 
                                  data={selectedAgent.salesData}
                                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                  <XAxis 
                                    dataKey="date" 
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    tickMargin={10}
                                  />
                                  <YAxis 
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    tickFormatter={(value) => chartMetric === "revenue" ? `₹${value}` : value}
                                    width={60}
                                  />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend 
                                    verticalAlign="top" 
                                    height={36}
                                    formatter={(value) => chartMetric === "count" ? "Sales Count" : "Revenue (₹)"}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey={chartMetric}
                                    stroke={chartMetric === "count" ? "#3b82f6" : "#10b981"}
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name={chartMetric === "count" ? "Sales Count" : "Revenue (₹)"}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-lg border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                        <div className="bg-gray-50 px-4 py-2 dark:bg-gray-700">
                          <h3 className="font-medium text-gray-700 dark:text-gray-300">
                            System Information
                          </h3>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                          <div className="grid grid-cols-3 px-4 py-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Created At
                            </span>
                            <span className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                              {new Date(
                                selectedAgent.createdAt,
                              ).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center">
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      No agent selected.
                    </p>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Dialog
              open={deleteConfirmOpen}
              onOpenChange={setDeleteConfirmOpen}
            >
              <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Confirm Deletion
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4 text-center">
                  <Trash2 className="mx-auto mb-4 h-12 w-12 text-red-500 dark:text-red-400" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Are you sure you want to delete this Agent? This action
                    cannot be undone.
                  </p>
                </div>
                <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirmOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAgent}
                    className="w-full sm:w-auto"
                    disabled={isDeleteLoading}
                  >
                    {isDeleteLoading ? "Deleting..." : "Delete Agent"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <EditAgentModal
              editOpen={editOpen}
              setEditOpen={setEditOpen}
              selectedAgent={selectedAgent}
            />

            {targetModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="relative max-h-[90vh] max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 dark:text-white">
                  <div className="mb-4 flex items-center justify-between border-b pb-3">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                      Set Target for {selectedAgent?.firstName} {selectedAgent?.lastName}
                    </h2>
                    <button 
                      onClick={() => setTargetModalOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                      aria-label="Close"
                    >
                      <RxCross2 size={18} />
                    </button>
                  </div>
                  
                  <div className="py-4">
                    <div className="mb-4 space-y-4">
                      <div>
                        <Label htmlFor="targetType" className="mb-2 block text-sm font-medium">
                          Target Type
                        </Label>
                        <Select
                          value={targetType}
                          onValueChange={(value: "count" | "price") => {
                            setTargetType(value);
                            setTargetValue(0);
                          }}
                        >
                          <SelectTrigger id="targetType" className="w-full dark:border-gray-700 dark:bg-gray-900">
                            <SelectValue placeholder="Select target type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="count">Courses Sold Count</SelectItem>
                            <SelectItem value="price">Sales Amount Target</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="targetValue" className="mb-2 block text-sm font-medium">
                          {targetType === "count" ? "Course Sales Target" : "Revenue Target"}
                        </Label>
                        <Input 
                          id="targetValue"
                          type="number" 
                          value={targetValue}
                          onChange={(e) => setTargetValue(Number(e.target.value))}
                          min={0}
                          className="w-full dark:border-gray-700 dark:bg-gray-900"
                          placeholder={`Enter ${targetType === "count" ? "course count" : "revenue"} target`}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {targetType === "count" 
                        ? "This target represents the number of courses the agent should sell." 
                        : "This target represents the total revenue the agent should generate."}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={handleSetTarget}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                      disabled={isTargetUpdating}
                    >
                      {isTargetUpdating ? "Setting Target..." : "Set Target"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 dark:text-white">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {startIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {Math.min(startIndex + agentsPerPage, sortedAgents.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {sortedAgents.length}
                  </span>{" "}
                  agents
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
                    max={totalPages || 1}
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
      </div>

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

      {isModalOpen && (
        <AddAgentModal open={isModalOpen} setOpen={setIsModalOpen} />
      )}
    </div>
  );
};

export default AgentPage;