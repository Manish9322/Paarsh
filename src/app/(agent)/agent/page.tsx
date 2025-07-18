"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import {
  CheckCircle,
  Target,
  UserPlus,
  Percent,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronUp,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFetchAgentQuery, useFetchAgentSalesQuery, useFetchLeadsQuery } from "@/services/api";
import Navbar from "@/components/Layout/Navbar";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Area, Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

// Define interfaces
interface CourseSale {
  id: string;
  courseName: string;
  studentName: string;
  saleDate: string;
  amount: number;
  status: "SUCCESS" | "PENDING";
}

interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
  lastContacted: string;
}

interface CardConfig {
  title: string;
  getValue: (agent: any, isLoading: boolean) => string | number;
  icon: React.ComponentType<{ className?: string }>;
  borderColor: string;
  textColor: string;
  description: string;
}

// Skeleton Components
const SkeletonCard = () => (
  <Card className="bg-white dark:bg-gray-800">
    <CardHeader>
      <div className="flex justify-between items-center">
        <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
      <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </CardContent>
  </Card>
);

const SkeletonChart = () => (
  <Card className="bg-white dark:bg-gray-800">
    <CardHeader>
      <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="h-[300px] w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </CardContent>
  </Card>
);

const SkeletonTable = () => (
  <Card className="bg-white dark:bg-gray-800">
    <CardHeader>
      <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
    </CardContent>
  </Card>
);

// Utility function to filter sales by time period
const filterSalesByTime = (sales: CourseSale[], period: string): CourseSale[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  switch (period) {
    case 'today':
      return sales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        return saleDate >= today;
      });
    case 'yesterday':
      return sales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        return saleDate >= yesterday && saleDate < today;
      });
    case 'monthly':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return sales.filter(sale => new Date(sale.saleDate) >= monthStart);
    case 'yearly':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return sales.filter(sale => new Date(sale.saleDate) >= yearStart);
    default:
      return sales;
  }
};

// CourseSalesChart
const CourseSalesChart = ({ salesData, isLoading }) => {
  const COLORS = ['#8b5cf6', '#0ea5e9', '#f97316', '#10b981', '#ef4444'];

  const courseSalesData = isLoading || !salesData
    ? []
    : Object.values(
        salesData.reduce((acc, sale) => {
          const course = sale.courseName;
          if (!acc[course]) {
            acc[course] = { course, sales: 0 };
          }
          acc[course].sales += sale.amount;
          return acc;
        }, {} as Record<string, { course: string; sales: number }>)
      );

  if (isLoading) {
    return <SkeletonChart />;
  }

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-white">Course Sales Distribution</CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">Sales by course category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          {courseSalesData.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No sales data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={courseSalesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="sales"
                  nameKey="course"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {courseSalesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, undefined]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// SalesHistory
const SalesHistory = ({ salesData, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof CourseSale | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [transactionFilter, setTransactionFilter] = useState<"all" | "completed" | "pending">("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "yesterday" | "monthly" | "yearly">("all");
  const salesPerPage = 5;

  const courseSales: CourseSale[] = salesData || [];

  const filteredByTime = filterSalesByTime(courseSales, timeFilter);
  const filteredByStatus = filteredByTime.filter((sale) => {
    if (transactionFilter === "all") return true;
    return transactionFilter === "completed" ? sale.status === "SUCCESS" : sale.status === "PENDING";
  });

  const filteredSales = filteredByStatus.filter((sale) =>
    Object.values(sale).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedSales = [...filteredSales].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (sortField === "amount") {
      return sortOrder === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
    }
    return sortOrder === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const totalPages = Math.ceil(sortedSales.length / salesPerPage);
  const displayedSales = sortedSales.slice(
    (currentPage - 1) * salesPerPage,
    currentPage * salesPerPage
  );

  const handleSort = (field: keyof CourseSale) => {
    setSortField(field);
    setSortOrder(sortField === field && sortOrder === "asc" ? "desc" : "asc");
  };

  if (isLoading) {
    return <SkeletonTable />;
  }

  return (
    <Card className="mb-6 bg-white dark:bg-gray-800">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-4">
        <div>
          <CardTitle className="text-gray-800 dark:text-white">Sales History</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">Your recent course sales</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-[200px]">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full bg-white dark:bg-gray-900 dark:text-white"
            />
          </div>
          <Select 
            value={timeFilter} 
            onValueChange={(value: "all" | "today" | "yesterday" | "monthly" | "yearly") => setTimeFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-900 dark:text-white">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-700 dark:text-gray-100">
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="yearly">This Year</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              onClick={() => setTransactionFilter("all")}
              className={`h-10 ${transactionFilter === "all" ? "bg-teal-600 text-white dark:bg-teal-700" : "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400"}`}
            >
              All
            </Button>
            <Button
              onClick={() => setTransactionFilter("completed")}
              className={`h-10 ${transactionFilter === "completed" ? "bg-teal-600 text-white dark:bg-teal-700" : "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400"}`}
            >
              Completed
            </Button>
            <Button
              onClick={() => setTransactionFilter("pending")}
              className={`h-10 ${transactionFilter === "pending" ? "bg-teal-600 text-white dark:bg-teal-700" : "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400"}`}
            >
              Pending
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                <TableHead className="text-gray-800 dark:text-white">Course Name</TableHead>
                <TableHead className="text-gray-800 dark:text-white" onClick={() => handleSort("studentName")}>
                  <div className="flex items-center">
                    Student Name
                    {sortField === "studentName" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-gray-800 dark:text-white" onClick={() => handleSort("saleDate")}>
                  <div className="flex items-center">
                    Sale Date
                    {sortField === "saleDate" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-gray-800 dark:text-white" onClick={() => handleSort("amount")}>
                  <div className="flex items-center">
                    Amount
                    {sortField === "amount" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-gray-800 dark:text-white" onClick={() => handleSort("status")}>
                  <div className="flex items-center">
                    Status
                    {sortField === "status" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    )}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-gray-500 dark:text-gray-400">
                    No sales found
                  </TableCell>
                </TableRow>
              ) : (
                displayedSales.map((sale) => (
                  <TableRow key={sale.id} className="border-b border-gray-100 dark:border-gray-700">
                    <TableCell className="text-gray-800 dark:text-white">{sale.courseName}</TableCell>
                    <TableCell className="text-gray-800 dark:text-white">{sale.studentName}</TableCell>
                    <TableCell className="text-gray-800 dark:text-white">
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-gray-800 dark:text-white">₹{sale.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                          sale.status === "SUCCESS"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        }`}
                      >
                        {sale.status === "SUCCESS" ? "Completed" : "Pending"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-gray-300 dark:border-gray-700"
            >
              <ChevronLeft className="h-4 w-4 text-gray-800 dark:text-white" />
            </Button>
            <div className="text-sm text-gray-800 dark:text-white">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-gray-300 dark:border-gray-700"
            >
              <ChevronRight className="h-4 w-4 text-gray-800 dark:text-white" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// TargetProgress
const TargetProgress = ({ salesData, salesLoading, salesTarget }) => {
  const [timeFrame, setTimeFrame] = useState('yearly');

  const monthlySalesData = salesLoading || !salesData
    ? []
    : Object.values(
        salesData.reduce((acc, sale) => {
          if (sale.status !== "SUCCESS") return acc;
          const date = new Date(sale.saleDate);
          const month = date.toLocaleString('default', { month: 'short' });
          if (!acc[month]) {
            acc[month] = { month, sales: 0, target: (salesTarget || 0) / 12 };
          }
          acc[month].sales += sale.amount;
          return acc;
        }, {} as Record<string, { month: string; sales: number; target: number }>)
      ).sort((a, b) => new Date(`1 ${(a as { month: string }).month} 2025`).getTime() - new Date(`1 ${(b as { month: string }).month} 2025`).getTime());

  const filteredData = monthlySalesData.filter((item, index) => {
    if (timeFrame === 'monthly') return index >= monthlySalesData.length - 6;
    if (timeFrame === 'quarterly') return index >= monthlySalesData.length - 3;
    return true;
  });

  if (salesLoading) {
    return <SkeletonChart />;
  }

  return (
    <Card className="mb-6 bg-white dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-gray-800 dark:text-white">Sales Performance</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">Monthly sales vs targets</CardDescription>
        </div>
        <Select value={timeFrame} onValueChange={setTimeFrame}>
          <SelectTrigger className="w-[150px] bg-white dark:bg-gray-900 dark:text-white dark:border-gray-700">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-700 dark:text-gray-100">
            <SelectItem value="monthly">Last 6 Months</SelectItem>
            <SelectItem value="quarterly">Last Quarter</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {filteredData.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No sales data available</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={filteredData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'currentColor' }} />
                <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `₹${value}`} tickLine={false} axisLine={false} tick={{ fill: 'currentColor' }} />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, undefined]} />
                <Legend />
                <Bar yAxisId="left" dataKey="sales" name="Monthly Sales" barSize={30}>
                  {filteredData.map((entry: { month: string; sales: number; target: number }, index) => (
                    <Cell key={`cell-${index}`} fill={entry.sales >= entry.target ? '#10b981' : '#8b5cf6'} />
                  ))}
                </Bar>
                <Area type="monotone" yAxisId="left" dataKey="target" name="Target" stroke="#f59e0b" fill="#f59e0b20" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ActiveLeads
const ActiveLeads = ({ leadsData, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 5;

  const leads: Lead[] = leadsData?.map((lead: any) => ({
    id: lead._id,
    name: lead.name || "Unknown",
    email: lead.email || "N/A",
    status: lead.status || "New",
    lastContacted: lead.lastContacted || new Date().toISOString(),
  })) || [];

  const filteredLeads = leads.filter((lead) =>
    Object.values(lead).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const displayedLeads = filteredLeads.slice(
    (currentPage - 1) * leadsPerPage,
    currentPage * leadsPerPage
  );

  if (isLoading) {
    return <SkeletonTable />;
  }

  return (
    <Card className="mb-6 bg-white dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-gray-800 dark:text-white">Active Leads</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">Current lead pipeline</CardDescription>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-[200px] bg-white dark:bg-gray-900 dark:text-white"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                <TableHead className="text-gray-800 dark:text-white">Name</TableHead>
                <TableHead className="text-gray-800 dark:text-white">Email</TableHead>
                <TableHead className="text-gray-800 dark:text-white">Status</TableHead>
                <TableHead className="text-gray-800 dark:text-white">Last Contacted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-gray-500 dark:text-gray-400">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                displayedLeads.map((lead) => (
                  <TableRow key={lead.id} className="border-b border-gray-100 dark:border-gray-700">
                    <TableCell className="text-gray-800 dark:text-white">{lead.name}</TableCell>
                    <TableCell className="text-gray-800 dark:text-white">{lead.email}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                          lead.status === "New"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            : lead.status === "Contacted"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-800 dark:text-white">
                      {new Date(lead.lastContacted).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-gray-300 dark:border-gray-700"
            >
              <ChevronLeft className="h-4 w-4 text-gray-800 dark:text-white" />
            </Button>
            <div className="text-sm text-gray-800 dark:text-white">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-gray-300 dark:border-gray-700"
            >
              <ChevronRight className="h-4 w-4 text-gray-800 dark:text-white" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// SalesTrendChart
const SalesTrendChart = ({ salesData, isLoading }) => {
  const dailySalesData = isLoading || !salesData
    ? []
    : Object.values(
        salesData.reduce((acc, sale) => {
          if (sale.status !== "SUCCESS") return acc;
          const date = new Date(sale.saleDate).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = { date, sales: 0 };
          }
          acc[date].sales += sale.amount;
          return acc;
        }, {} as Record<string, { date: string; sales: number }>)
      ).sort((a: { date: string }, b: { date: string }) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (isLoading) {
    return <SkeletonChart />;
  }

  return (
    <Card className="mb-6 bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-white">Sales Trend</CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">Daily sales over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {dailySalesData.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No sales data available</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={dailySalesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: 'currentColor' }} />
                <YAxis tickFormatter={(value) => `₹${value}`} tickLine={false} axisLine={false} tick={{ fill: 'currentColor' }} />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, undefined]} />
                <Legend />
                <Line type="monotone" dataKey="sales" name="Daily Sales" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function AgentDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { data: agentData, isLoading: agentLoading } = useFetchAgentQuery(undefined);
  const { data: salesData, isLoading: salesLoading } = useFetchAgentSalesQuery(undefined);
  const { data: leadsData, isLoading: leadsLoading } = useFetchLeadsQuery(undefined);

  const courseSales: CourseSale[] = salesData?.data?.completed?.map((tx: any) => ({
    id: tx._id,
    courseName: tx.courseId?.courseName || 'Unknown Course',
    studentName: tx.userId?.name || 'Unknown Student',
    saleDate: tx.createdAt,
    amount: tx.amount || 0,
    status: tx.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
  })) || [];

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      setIsSidebarOpen(!isMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const agent = agentData?.data || {};
  const salesTarget = agent.target?.price || 0;
  const revenue = agent.totalSale || 0;
  const salesCount = agent.countSale || 0;
  const activeLeads = leadsData?.data?.length || 0;

  

  const cardConfig: CardConfig[] = [
    {
      title: 'Conversion Rate',
      getValue: (agent, isLoading) => {
        if (isLoading) return '...';
        const leads = activeLeads || 0;
        const count = agent.countSale || 0;
        return leads === 0 ? '0.0%' : `${((count / leads) * 100).toFixed(1)}%`;
      },
      icon: Percent,
      borderColor: 'purple-500',
      textColor: 'purple-500',
      description: 'Lead to sale conversion',
    },
    {
      title: 'Successful Sales',
      getValue: (agent, isLoading) => (isLoading ? '...' : agent.countSale || 0),
      icon: CheckCircle,
      borderColor: 'green-500',
      textColor: 'green-500',
      description: 'Completed sales',
    },
    {
      title: 'Sales Target Progress',
      getValue: (agent, isLoading) => {
        if (isLoading) return '...';
        const target = agent.target?.price || 0;
        const rev = agent.totalSale || 0;
        return target === 0 ? '0%' : `${((rev / target) * 100).toFixed(0)}%`;
      },
      icon: Target,
      borderColor: 'blue-500',
      textColor: 'blue-500',
      description: `₹${agentLoading ? '...' : revenue.toLocaleString()} / ₹${agentLoading ? '...' : salesTarget.toLocaleString()}`,
    },
    {
      title: 'Active Leads',
      getValue: (agent, isLoading) => (isLoading ? '...' : activeLeads),
      icon: UserPlus,
      borderColor: 'orange-500',
      textColor: 'orange-500',
      description: 'Leads in progress',
    },
  ];

  if (agentLoading || salesLoading || leadsLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-8 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse pl-16 md:pl-0" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <div className="mt-8">
          <SkeletonTable />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="z-10 w-full">
        <Navbar />
      </div>

      <div className="fixed left-0 top-0 z-[100] flex h-16 w-16 items-center justify-center md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-gray-600 hover:bg-teal-100 dark:text-gray-400 dark:hover:bg-teal-900/30"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed md:static md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white dark:bg-gray-800`}
        >
          <Sidebar userRole="agent" />
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white pl-16 md:pl-0">
              Agent Dashboard
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cardConfig.map((card, index) => (
              <Card
                key={index}
                className={`border-t-4 border-t-${card.borderColor} bg-white dark:bg-gray-800`}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-lg text-gray-800 dark:text-white">
                    {card.title}
                    <card.icon className={`h-5 w-5 text-${card.textColor}`} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {card.getValue(agent, agentLoading)}
                  </p>
                  <p className={`text-sm text-${card.textColor}`}>
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CourseSalesChart salesData={courseSales} isLoading={salesLoading} />
            <TargetProgress salesData={courseSales} salesLoading={salesLoading} salesTarget={salesTarget} />
            <SalesTrendChart salesData={courseSales} isLoading={salesLoading} />
            <ActiveLeads leadsData={leadsData?.data} isLoading={leadsLoading} />
          </div>

          <div className="mt-8">
            <SalesHistory salesData={courseSales} isLoading={salesLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}