"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import {
  Users,
  CheckCircle,
  DollarSign,
  Clock,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useFetchAgentStatsQuery } from "../../../services/api";
import Navbar from "@/components/Layout/Navbar";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { courseSalesData, salesData, monthlySalesData } from "../../../../utils/mockData";

const CourseSalesChart = () => {
  const COLORS = ['#8b5cf6', '#0ea5e9', '#f97316', '#10b981'];
  
  return (
    <Card className="col-span-1 md:col-span-1 dark:bg-gray-800">
      <CardHeader>
        <CardTitle>Course Sales Distribution</CardTitle>
        <CardDescription>Sales by course category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
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
              <Tooltip formatter={(value) => [`${value} sales`, undefined]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const SalesHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredSales = salesData.filter(sale => 
    sale.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  return (
    <Card className="mb-6 dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Sales History</CardTitle>
          <CardDescription>Your recent course sales</CardDescription>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search sales..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[200px]"
            />
          </div>
          <Button size="icon" variant="outline">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.date}</TableCell>
                  <TableCell>{sale.courseName}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>${sale.price.toLocaleString()}</TableCell>
                  <TableCell>${sale.commission.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const TargetProgress = () => {
  const isMobile = useIsMobile();
  const [timeFrame, setTimeFrame] = useState('yearly');
  
  const monthlySalesWithTarget = monthlySalesData.map(item => ({
    ...item,
    target: item.month === 'Dec' ? 10000 : 7000
  }));

  return (
    <Card className="mb-6 dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Sales Performance</CardTitle>
          <CardDescription>Monthly sales vs targets</CardDescription>
        </div>
        <Select value={timeFrame} onValueChange={setTimeFrame}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={monthlySalesWithTarget}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `$${value}`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => [`$${value}`, undefined]} />
              <Legend />
              <Bar yAxisId="left" dataKey="sales" name="Monthly Sales" barSize={30}>
                {monthlySalesWithTarget.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.sales >= entry.target ? '#10b981' : '#8b5cf6'} />
                ))}
              </Bar>
              <Area type="monotone" yAxisId="left" dataKey="target" name="Target" stroke="#f59e0b" fill="#f59e0b20" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AgentDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();

  const { data: agentStats, isLoading: statsLoading } = useFetchAgentStatsQuery(undefined);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
          className="rounded-full p-2"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed md:static md:translate-x-0 transition-transform duration-300 ease-in-out`}
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
            <Card className="border-t-4 border-t-indigo-500 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-lg">
                  Referrals
                  <Users className="h-5 w-5 text-indigo-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {statsLoading ? "..." : agentStats?.totalReferrals ?? 0}
                </p>
                <p className="text-sm text-indigo-500 flex items-center">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  10% growth
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-green-500 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-lg">
                  Successful Sales
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {statsLoading ? "..." : agentStats?.successfulSales ?? 0}
                </p>
                <p className="text-sm text-green-500 flex items-center">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  7% increase
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-yellow-500 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-lg">
                  Commission Earned
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  ₹{statsLoading ? "..." : agentStats?.totalCommission ?? "0.00"}
                </p>
                <p className="text-sm text-yellow-600 flex items-center">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  Earnings this month
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-red-500 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-lg">
                  Pending Payouts
                  <Clock className="h-5 w-5 text-red-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  ₹{statsLoading ? "..." : agentStats?.pendingCommission ?? "0.00"}
                </p>
                <p className="text-sm text-red-500">Awaiting transfer</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CourseSalesChart />
            <TargetProgress />
          </div>

          <div className="mt-8">
            <SalesHistory />
          </div>
        </div>
      </div>
    </div>
  );
}