"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { 
  useDeleteAgentMutation, 
  useFetchAgentsQuery, 
  useUpdateAgentMutation, 
  useCreateAgentTargetMutation,
  useFetchAgentPerformanceQuery,
  useFetchAgentSalesAdminQuery
} from "@/services/api";
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

// Define Sales Data type for graph
interface SalesData {
  date: string;
  count: number;
  revenue: number;
  status: 'completed' | 'pending';
}

// Define Raw API Sales Record type based on API response
interface RawSalesRecord {
  _id: string;
  agentId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    agentCode: string;
  };
  amount: number;
  saleDate: string;
  status: 'SUCCESS' | 'PENDING';
  targetId?: {
    _id: string;
    targetAmount: number;
    targetCount: number;
    startDate: string;
    endDate: string;
    status: string;
    targetType: string;
  };
}

// Define Target type based on API response
interface Target {
  _id: string;
  agentId: string;
  targetAmount: number;
  targetCount: number;
  achievedAmount: number;
  achievedCount: number;
  startDate: string;
  endDate: string;
  status: string;
  targetType: string;
  amountProgress: string;
  countProgress: string;
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
  email: string;
  createdAt: string;
  activeTarget?: {
    targetAmount: number;
    targetCount: number;
  };
}

// Define Performance Data type
interface PerformanceData {
  agent: {
    name: string;
    agentCode: string;
    totalSale: number;
    countSale: number;
  };
  currentTarget: {
    _id: string;
    agentId: string;
    startDate: string;
    endDate: string;
    targetCount: number;
    targetAmount: number;
    achievedCount: number;
    achievedAmount: number;
    status: string;
    targetType: string;
    countProgress: string;
    amountProgress: string;
    isCountAchieved: boolean;
    isAmountAchieved: boolean;
  } | null;
  history: Array<{
    _id: string;
    agentId: string;
    startDate: string;
    endDate: string;
    targetCount: number;
    targetAmount: number;
    achievedCount: number;
    achievedAmount: number;
    status: string;
    targetType: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
  }>;
  summary: {
    totalTargets: number;
    completedTargets: number;
    achievedTargets: number;
    successRate: string;
  };
}

// Define Sales API Response type based on provided API
interface SalesApiResponse {
  agent: {
    id: string;
    name: string;
    email: string;
    agentCode: string;
    totalSale: number;
    countSale: number;
  };
  sales: {
    all: RawSalesRecord[];
    monthly: RawSalesRecord[];
    yearly: RawSalesRecord[];
  };
  summary: {
    total: {
      amount: number;
      count: number;
    };
    monthly: {
      amount: number;
      count: number;
    };
    yearly: {
      amount: number;
      count: number;
    };
  };
  activeTargets: Target[];
  targetProgress: Array<{
    targetId: string;
    targetType: string;
    targetAmount: number;
    targetCount: number;
    achievedAmount: number;
    achievedCount: number;
    amountProgress: string;
    countProgress: string;
    startDate: string;
    endDate: string;
    status: string;
  }>;
}

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
  const [targetForm, setTargetForm] = useState({
    startDate: "",
    endDate: "",
    targetCount: 0,
    targetAmount: 0,
    targetType: "monthly" as "monthly" | "quarterly" | "yearly" | "custom",
    notes: "",
  });
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

  const [deleteAgent, { isLoading: isDeleteLoading }] = useDeleteAgentMutation();
  const [createAgentTarget, { isLoading: isTargetCreating }] = useCreateAgentTargetMutation();
  const { data: performanceData, isLoading: isPerformanceLoading } = 
    useFetchAgentPerformanceQuery(selectedAgent ? { id: selectedAgent._id } : skipToken);

  // Fetch sales data using the new RTK query
  const { data: salesDataResponse, isLoading: isSalesLoading } = useFetchAgentSalesAdminQuery(
    selectedAgent ? { agentId: selectedAgent._id } : skipToken
  );

  // Transform and aggregate sales data for the graph
  const completedSales = useMemo(() => {
    if (!salesDataResponse?.data?.sales?.all) {
      return [];
    }

    // Transform raw sales records to SalesData format
    const transformedSales: SalesData[] = salesDataResponse.data.sales.all
      .filter(sale => sale.status === 'SUCCESS') // Only completed sales
      .map((sale: RawSalesRecord) => ({
        date: new Date(sale.saleDate).toISOString().split('T')[0], // Format as YYYY-MM-DD
        count: 1, // Each sale counts as 1
        revenue: sale.amount, // Use sale.amount as revenue
        status: 'completed',
      }));

    // Aggregate by date
    const aggregatedSales = transformedSales.reduce((acc: { [key: string]: SalesData }, sale) => {
      const { date, count, revenue } = sale;
      if (!acc[date]) {
        acc[date] = { date, count: 0, revenue: 0, status: 'completed' };
      }
      acc[date].count += count;
      acc[date].revenue += revenue;
      return acc;
    }, {});

    // Convert to array and sort by date
    return Object.values(aggregatedSales).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [salesDataResponse]);

  // Apply time filter to completedSales
  const filteredCompletedSales = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeFilter) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        break;
      case 'weekly':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(0); // All time
    }

    return completedSales.filter(sale => new Date(sale.date) >= startDate);
  }, [completedSales, timeFilter]);

  useEffect(() => {
    if (salesDataResponse?.success === false) {
      toast.error("Failed to fetch sales data. Please try again.");
    }
    if (performanceData?.success === false) {
      toast.error("Failed to fetch performance data. Please try again.");
    }
  }, [salesDataResponse, performanceData]);

  const handleSort = (field: keyof Agent) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredAgents = agents.filter((agent) =>
    Object.values(agent).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField] ?? '';
    const bValue = b[sortField] ?? '';
    return sortOrder === "asc"
      ? aValue > bValue ? 1 : -1
      : aValue < bValue ? 1 : -1;
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
      const response = await deleteAgent({ id: agentToDelete }).unwrap();

      if (response?.success) {
        toast.success("Agent deleted successfully");
        setDeleteConfirmOpen(false);
        setAgentToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error("Failed to delete the agent. Please try again.");
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

      const formData = {
        agentId: selectedAgent._id,
        startDate: targetForm.startDate,
        endDate: targetForm.endDate,
        targetCount: targetForm.targetCount,
        targetAmount: targetForm.targetAmount,
        targetType: targetForm.targetType,
        notes: targetForm.notes,
      };

      const response = await createAgentTarget(formData).unwrap();
      
      if (response?.success) {
        toast.success(`Target set successfully for ${selectedAgent.firstName} ${selectedAgent.lastName}`);
        setTargetModalOpen(false);
        setTargetForm({
          startDate: "",
          endDate: "",
          targetCount: 0,
          targetAmount: 0,
          targetType: "monthly",
          notes: "",
        });
      } else {
        throw new Error(response?.message || "Failed to create target");
      }
    } catch (error) {
      console.error("Error setting target:", error);
      toast.error("Failed to set target. Please try again.");
    }
  };

  // Custom tooltip formatter for graph
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
          } md:sticky md:top-0 Sharp Grok, AI assistant created by xAI
md:h-screen md:translate-x-0`}
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
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
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
                            key={`skeleton-row-${index}`}
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
                            colSpan={10}
                            className="py-6 text-center text-gray-500"
                          >
                            No agents found. Try a different search term diaries or add a new agent.
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
                                {agent.activeTarget ? (
                                  <div className="space-y-1">
                                    {agent.activeTarget.targetCount > 0 && (
                                      <p className="text-xs text-blue-600 dark:text-blue-400">
                                        Target Courses: {agent.activeTarget.targetCount}
                                      </p>
                                    )}
                                    {agent.activeTarget.targetAmount > 0 && (
                                      <p className="text-xs text-green-600 dark:text-green-400">
                                        Target Revenue: ₹{agent.activeTarget.targetAmount}
                                      </p>
                                    )}
                                  </div>
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
                              ₹{agent.totalSale}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {agent.countSale}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {agent.state}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {agent.activeTarget ? (
                                <div className="space-y-1">
                                  {agent.activeTarget.targetCount > 0 && (
                                    <div className="flex items-center">
                                      <span className="mr-1 text-sm font-medium">
                                        {agent.activeTarget.targetCount}
                                      </span>
                                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                        Courses
                                      </span>
                                    </div>
                                  )}
                                  {agent.activeTarget.targetAmount > 0 && (
                                    <div className="flex items-center">
                                      <span className="mr-1 text-sm font-medium">
                                        ₹{agent.activeTarget.targetAmount}
                                      </span>
                                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                        Revenue
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  No active target
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
                                    setTargetForm({
                                      startDate: "",
                                      endDate: "",
                                      targetCount: 0,
                                      targetAmount: 0,
                                      targetType: "monthly",
                                      notes: "",
                                    });
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
                            <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                              {selectedAgent.firstName} {selectedAgent.lastName}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 px-4 py-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Email
                            </span>
                            <span className="col-span-2 text-sm text-gray-600 dark:text-gray-400">
                              {selectedAgent.email}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 px-4 py-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Contact
                            </span>
                            <span className="col-span-2 text-sm text-gray-600 dark:text-gray-400">
                              {selectedAgent.mobile}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 px-4 py-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              State
                            </span>
                            <span className="col-span-2 text-sm text-gray-600 dark:text-gray-400">
                              {selectedAgent.state}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 px-4 py-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Agent Code
                            </span>
                            <span className="col-span-2 text-sm text-gray-600 dark:text-gray-400">
                              {selectedAgent.agentCode}
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
                          {isSalesLoading ? (
                            <div className="space-y-4">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-48 w-full" />
                            </div>
                          ) : !salesDataResponse?.success ? (
                            <div className="flex h-64 items-center justify-center text-sm text-red-500 dark:text-red-400">
                              Error loading sales data
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-3 gap-4 px-4 py-3">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Total Sales Count
                                </span>
                                <div className="col-span-2 flex items-center">
                                  <span className="text-sm text-gray-900 dark:text-gray-200">
                                    {salesDataResponse?.data?.summary?.total?.count || 0}
                                  </span>
                                  <div className="ml-2 h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                                    <div
                                      className="h-full rounded-full bg-blue-500"
                                      style={{
                                        width: `${Math.min((salesDataResponse?.data?.summary?.total?.count || 0) * 5, 100)}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4 px-4 py-3">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Total Revenue
                                </span>
                                <div className="col-span-2 flex items-center">
                                  <span className="text-sm text-gray-900 dark:text-gray-200">
                                    ₹{salesDataResponse?.data?.summary?.total?.amount || 0}
                                  </span>
                                  <div className="ml-2 h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                                    <div
                                      className="h-full rounded-full bg-green-500"
                                      style={{
                                        width: `${Math.min((salesDataResponse?.data?.summary?.total?.amount || 0) / 1000, 100)}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4 px-4 py-3">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Monthly Sales
                                </span>
                                <div className="col-span-2 flex items-center">
                                  <span className="text-sm text-gray-900 dark:text-gray-200">
                                    {salesDataResponse?.data?.summary?.monthly?.count || 0} (₹{salesDataResponse?.data?.summary?.monthly?.amount || 0})
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4 px-4 py-3">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Yearly Sales
                                </span>
                                <div className="col-span-2 flex items-center">
                                  <span className="text-sm text-gray-900 dark:text-gray-200">
                                    {salesDataResponse?.data?.summary?.yearly?.count || 0} (₹{salesDataResponse?.data?.summary?.yearly?.amount || 0})
                                  </span>
                                </div>
                              </div>
                              <div className="mt-4 h-64">
                                {filteredCompletedSales.length === 0 ? (
                                  <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                                    No completed sales data available for the selected period
                                  </div>
                                ) : (
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart 
                                      data={filteredCompletedSales}
                                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                      <XAxis 
                                        dataKey="date" 
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        tickMargin={10}
                                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      />
                                      <YAxis 
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        tickFormatter={(value) => chartMetric === "revenue" ? `₹${value.toLocaleString()}` : value.toString()}
                                        width={80}
                                      />
                                      <Tooltip content={<CustomTooltip />} />
                                      <Legend 
                                        verticalAlign="top" 
                                        height={36}
                                        formatter={() => chartMetric === "count" ? "Sales Count" : "Revenue (₹)"}
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
                            </>
                          )}
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-lg border border-gray-100 transition-all hover:shadow-md dark:border-gray-700">
                        <div className="bg-gray-50 px-4 py-2 dark:bg-gray-700">
                          <h3 className="font-medium text-gray-700 dark:text-gray-300">
                            Target Performance
                          </h3>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                          {isPerformanceLoading ? (
                            <div className="p-4">
                              <Skeleton className="h-4 w-full mb-2" />
                              <Skeleton className="h-4 w-full mb-2" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          ) : !performanceData?.success ? (
                            <div className="p-4 text-center text-sm text-red-500 dark:text-red-400">
                              Error loading target performance data
                            </div>
                          ) : (
                            <>
                              <div className="px-4 py-3">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Current Target
                                </h4>
                                {performanceData?.data?.currentTarget ? (
                                  <div className="mt-2 space-y-2">
                                    <div className="grid grid-cols-3 gap-4">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Type
                                      </span>
                                      <span className="col-span-2 text-sm text-gray-900 dark:text-white capitalize">
                                        {performanceData.data.currentTarget.targetType}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Period
                                      </span>
                                      <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                                        {new Date(performanceData.data.currentTarget.startDate).toLocaleDateString()} - 
                                        {new Date(performanceData.data.currentTarget.endDate).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Course Sales Target
                                      </span>
                                      <div className="col-span-2 flex items-center">
                                        <span className="text-sm text-gray-900 dark:text-white">
                                          {performanceData.data.currentTarget.achievedCount} / {performanceData.data.currentTarget.targetCount}
                                        </span>
                                        <div className="ml-2 h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                                          <div
                                            className="h-full rounded-full bg-blue-500"
                                            style={{ width: `${performanceData.data.currentTarget.countProgress}%` }}
                                          ></div>
                                        </div>
                                        <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                                          ({performanceData.data.currentTarget.countProgress}%)
                                        </span>
                                        {performanceData.data.currentTarget.isCountAchieved && (
                                          <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                            Achieved
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Revenue Target
                                      </span>
                                      <div className="col-span-2 flex items-center">
                                        <span className="text-sm text-gray-900 dark:text-white">
                                          ₹{performanceData.data.currentTarget.achievedAmount.toLocaleString()} / ₹{performanceData.data.currentTarget.targetAmount.toLocaleString()}
                                        </span>
                                        <div className="ml-2 h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                                          <div
                                            className="h-full rounded-full bg-green-500"
                                            style={{ width: `${performanceData.data.currentTarget.amountProgress}%` }}
                                          ></div>
                                        </div>
                                        <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                                          ({performanceData.data.currentTarget.amountProgress}%)
                                        </span>
                                        {performanceData.data.currentTarget.isAmountAchieved && (
                                          <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                            Achieved
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Status
                                      </span>
                                      <span className="col-span-2 text-sm text-gray-900 dark:text-white capitalize">
                                        {performanceData.data.currentTarget.status}
                                      </span>
                                    </div>
                                    {performanceData.data.currentTarget.notes && (
                                      <div className="grid grid-cols-3 gap-4">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          Notes
                                        </span>
                                        <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                                          {performanceData.data.currentTarget.notes}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    No current target
                                  </p>
                                )}
                              </div>
                              <div className="px-4 py-3">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Target History
                                </h4>
                                {performanceData?.data?.history?.length > 0 ? (
                                  <div className="mt-2 space-y-4">
                                    {performanceData.data.history.map((target) => (
                                      <div key={target._id} className="space-y-2 border-t border-gray-100 pt-2 dark:border-gray-700">
                                        <div className="grid grid-cols-3 gap-4">
                                          <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Type
                                          </span>
                                          <span className="col-span-2 text-sm text-gray-900 dark:text-white capitalize">
                                            {target.targetType}
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                          <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Period
                                          </span>
                                          <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                                            {new Date(target.startDate).toLocaleDateString()} - 
                                            {new Date(target.endDate).toLocaleDateString()}
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                          <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Course Sales
                                          </span>
                                          <div className="col-span-2 flex items-center">
                                            <span className="text-sm text-gray-900 dark:text-white">
                                              {target.achievedCount} / {target.targetCount}
                                            </span>
                                            <div className="ml-2 h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                                              <div
                                                className="h-full rounded-full bg-blue-500"
                                                style={{ width: `${(target.achievedCount / target.targetCount * 100).toFixed(2)}%` }}
                                              ></div>
                                            </div>
                                            <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                                              ({(target.achievedCount / target.targetCount * 100).toFixed(2)}%)
                                            </span>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                          <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Revenue
                                          </span>
                                          <div className="col-span-2 flex items-center">
                                            <span className="text-sm text-gray-900 dark:text-white">
                                              ₹{target.achievedAmount.toLocaleString()} / ₹{target.targetAmount.toLocaleString()}
                                            </span>
                                            <div className="ml-2 h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                                              <div
                                                className="h-full rounded-full bg-green-500"
                                                style={{ width: `${(target.achievedAmount / target.targetAmount * 100).toFixed(2)}%` }}
                                              ></div>
                                            </div>
                                            <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                                              ({(target.achievedAmount / target.targetAmount * 100).toFixed(2)}%)
                                            </span>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                          <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Status
                                          </span>
                                          <span className="col-span-2 text-sm text-gray-900 dark:text-white capitalize">
                                            {target.status}
                                          </span>
                                        </div>
                                        {target.notes && (
                                          <div className="grid grid-cols-3 gap-4">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                              Notes
                                            </span>
                                            <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                                              {target.notes}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    No target history
                                  </p>
                                )}
                              </div>
                              <div className="px-4 py-3">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Target Summary
                                </h4>
                                <div className="mt-2 space-y-2">
                                  <div className="grid grid-cols-3 gap-4">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      Total Targets
                                    </span>
                                    <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                                      {performanceData?.data?.summary?.totalTargets || 0}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      Completed Targets
                                    </span>
                                    <span className="col-span-2 text-sm text-gray-900 dark:text-white">
                                      {performanceData?.data?.summary?.completedTargets || 0}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      Achieved Targets
                                    </span>
                                    <div className="col-span-2 flex items-center">
                                      <span className="text-sm text-gray-900 dark:text-white">
                                        {performanceData?.data?.summary?.achievedTargets || 0}
                                      </span>
                                      <div className="ml-2 h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                                        <div
                                          className="h-full rounded-full bg-purple-500"
                                          style={{
                                            width: `${(performanceData?.data?.summary?.achievedTargets / performanceData?.data?.summary?.totalTargets * 100) || 0}%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                                        ({performanceData?.data?.summary?.successRate || '0'}%)
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
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
                  
                  <div className="py-4 space-y-4">
                    <div>
                      <Label htmlFor="targetType" className="mb-2 block text-sm font-medium">
                        Target Type
                      </Label>
                      <Select
                        value={targetForm.targetType}
                        onValueChange={(value: "monthly" | "quarterly" | "yearly" | "custom") => 
                          setTargetForm({ ...targetForm, targetType: value })}
                      >
                        <SelectTrigger id="targetType" className="w-full dark:border-gray-700 dark:bg-gray-900">
                          <SelectValue placeholder="Select target type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="startDate" className="mb-2 block text-sm font-medium">
                        Start Date
                      </Label>
                      <Input 
                        id="startDate"
                        type="date" 
                        value={targetForm.startDate}
                        onChange={(e) => setTargetForm({ ...targetForm, startDate: e.target.value })}
                        className="w-full dark:border-gray-700 dark:bg-gray-900"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="endDate" className="mb-2 block text-sm font-medium">
                        End Date
                      </Label>
                      <Input 
                        id="endDate"
                        type="date" 
                        value={targetForm.endDate}
                        onChange={(e) => setTargetForm({ ...targetForm, endDate: e.target.value })}
                        className="w-full dark:border-gray-700 dark:bg-gray-900"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="targetCount" className="mb-2 block text-sm font-medium">
                        Course Sales Target
                      </Label>
                      <Input 
                        id="targetCount"
                        type="number" 
                        value={targetForm.targetCount}
                        onChange={(e) => setTargetForm({ ...targetForm, targetCount: Number(e.target.value) })}
                        min={0}
                        className="w-full dark:border-gray-700 dark:bg-gray-900"
                        placeholder="Enter course count target"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="targetAmount" className="mb-2 block text-sm font-medium">
                        Revenue Target
                      </Label>
                      <Input 
                        id="targetAmount"
                        type="number" 
                        value={targetForm.targetAmount}
                        onChange={(e) => setTargetForm({ ...targetForm, targetAmount: Number(e.target.value) })}
                        min={0}
                        className="w-full dark:border-gray-700 dark:bg-gray-900"
                        placeholder="Enter revenue target"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notes" className="mb-2 block text-sm font-medium">
                        Notes
                      </Label>
                      <Input 
                        id="notes"
                        type="text" 
                        value={targetForm.notes}
                        onChange={(e) => setTargetForm({ ...targetForm, notes: e.target.value })}
                        className="w-full dark:border-gray-700 dark:bg-gray-900"
                        placeholder="Enter any additional notes"
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Set the target period and goals for the agent.
                  </div>
                  
                  <div className="mt-6 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setTargetModalOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSetTarget}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 sm:w-auto"
                      disabled={isTargetCreating || !targetForm.startDate || !targetForm.endDate}
                    >
                      {isTargetCreating ? "Setting Target..." : "Set Target"}
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