"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Navbar from "@/components/Navbar/Navbar";
import { useTheme } from "next-themes";
import {
  Users,
  DollarSign,
  CheckSquare,
  BookMarked,
  BarChart3,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFetchCourcesQuery, useFetchUserQuery, useFetchUsersQuery, useFetchTransactionsQuery } from "@/services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

export default function AdminPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();

  const {
    data: userData,
    isLoading,
    error,
  } = useFetchUserQuery(undefined);
  console.log("User Data logged inside AdminPage:", userData);

  const { data: usersData } = useFetchUsersQuery(undefined)
  console.log("All Users Data logged inside AdminPage:", usersData);

  const { data: transactionsData } = useFetchTransactionsQuery(undefined);
  console.log("All Transactions Data:", transactionsData);

  const { data: coursesData } = useFetchCourcesQuery(undefined)
  
  // Calculate total number of users
  const totalUsers = usersData?.data?.length || 0;

  // Calculate total number of courses
  const totalCourses = coursesData?.data?.length || 0;

  // Calculate Sales and Revenue
  const totalSales = transactionsData?.data?.filter(transaction => transaction.status === "SUCCESS").length || 0;
  console.log("total sales count based on status:", totalSales);

  // Calculate total revenue from successful transactions only
  const totalRevenue = transactionsData?.data?.reduce((acc, transaction) => {
    // Only add amount if transaction status is "SUCCESS"
    if (transaction.status === "SUCCESS") {
      return acc + (transaction.amount || 0);
    }
    return acc;
  }, 0) || 0;

  // Register ChartJS components
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
  );

  // Process transactions data for charts
  const processTransactionData = () => {
    if (!transactionsData?.data) return null;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = Array(12).fill(0);
    const monthlyRevenue = Array(12).fill(0);
    const courseSales = {};

    transactionsData.data.forEach(transaction => {
      if (transaction.status === "SUCCESS") {
        const date = new Date(transaction.createdAt);
        const month = date.getMonth();
        
        // Monthly sales count
        monthlyData[month]++;
        
        // Monthly revenue
        monthlyRevenue[month] += transaction.amount;

        // Course sales distribution
        const courseId = transaction.courseId?._id || transaction.courseId;
        const courseName = transaction.courseId?.courseName || `Course ${courseId}`;
        courseSales[courseName] = (courseSales[courseName] || 0) + 1;
      }
    });

    return {
      labels: months,
      salesData: monthlyData,
      revenueData: monthlyRevenue,
      courseSales: {
        labels: Object.keys(courseSales),
        data: Object.values(courseSales)
      }
    };
  };

  const chartData = processTransactionData();

  const barChartData = {
    labels: chartData?.labels || [],
    datasets: [
      {
        label: 'Monthly Sales',
        data: chartData?.salesData || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)',
        barThickness: 'flex' as const,
        maxBarThickness: 32
      },
    ],
  };

  const lineChartData = {
    labels: chartData?.labels || [],
    datasets: [
      {
        label: 'Total Revenue',
        data: chartData?.revenueData || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          return gradient;
        },
        tension: 0.3,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgb(59, 130, 246)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2
      },
    ],
  };

  const pieChartData = {
    labels: chartData?.courseSales?.labels || [],
    datasets: [
      {
        data: chartData?.courseSales?.data || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.85)',  // Blue
          'rgba(147, 51, 234, 0.85)',  // Purple
          'rgba(236, 72, 153, 0.85)',  // Pink
          'rgba(34, 197, 94, 0.85)',   // Green
          'rgba(249, 115, 22, 0.85)',  // Orange
          'rgba(79, 70, 229, 0.85)',   // Indigo
          'rgba(220, 38, 38, 0.85)',   // Red
          'rgba(8, 145, 178, 0.85)',   // Cyan
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(147, 51, 234)',
          'rgb(236, 72, 153)',
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)',
          'rgb(79, 70, 229)',
          'rgb(220, 38, 38)',
          'rgb(8, 145, 178)',
        ],
        borderWidth: 2,
        hoverOffset: 12,
        hoverBorderWidth: 3
      },
    ],
  };

  // Enhanced chart options with better label styling
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'center' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: 'normal' as const
          },
          color: '#64748b',
          generateLabels: (chart) => [{
            text: 'Monthly Sales',
            fillStyle: 'rgba(59, 130, 246, 0.8)',
            strokeStyle: 'rgb(59, 130, 246)',
            lineWidth: 2,
            hidden: false,
            index: 0,
            datasetIndex: 0
          }]
        }
      },
      title: {
        display: true,
        text: 'Monthly Sales Distribution',
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: 'bold' as const
        },
        padding: { bottom: 25 },
        color: '#1e293b'
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(243, 244, 246)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { 
          size: 13,
          family: "'Inter', sans-serif",
          weight: 'bold' as const
        },
        bodyFont: { 
          size: 12,
          family: "'Inter', sans-serif",
          weight: 'normal' as const
        },
        displayColors: false,
        callbacks: {
          title: (items) => `${items[0].label}`,
          label: (context) => `Sales: ${context.parsed.y}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          color: '#64748b',
          padding: 8
        }
      },
      y: {
        beginAtZero: true,
        border: {
          display: false
        },
        grid: {
          color: 'rgba(243, 244, 246, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          color: '#64748b',
          padding: 8,
          callback: (value) => value + ' sales'
        }
      }
    }
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'center' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: 'normal' as const
          },
          color: '#64748b',
          generateLabels: (chart) => [{
            text: 'Total Revenue',
            fillStyle: 'rgba(59, 130, 246, 0.8)',
            strokeStyle: 'rgb(59, 130, 246)',
            lineWidth: 2,
            hidden: false,
            index: 0,
            datasetIndex: 0
          }]
        }
      },
      title: {
        display: true,
        text: 'Revenue Trends Over Time',
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: 'bold' as const
        },
        padding: { bottom: 25 },
        color: '#1e293b'
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(243, 244, 246)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { 
          size: 13,
          family: "'Inter', sans-serif",
          weight: 'bold' as const
        },
        bodyFont: { 
          size: 12,
          family: "'Inter', sans-serif",
          weight: 'normal' as const
        },
        displayColors: false,
        callbacks: {
          title: (items) => `${items[0].label}`,
          label: (context) => `Revenue: ₹${context.parsed.y.toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          color: '#64748b',
          padding: 8
        }
      },
      y: {
        beginAtZero: true,
        border: {
          display: false
        },
        grid: {
          color: 'rgba(243, 244, 246, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          color: '#64748b',
          padding: 8,
          callback: (value) => '₹' + value.toLocaleString('en-IN')
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        align: 'center' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: 'normal' as const
          },
          color: '#64748b'
        }
      },
      title: {
        display: true,
        text: 'Course Sales Distribution',
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: 'bold' as const
        },
        padding: { bottom: 25 },
        color: '#1e293b'
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(243, 244, 246)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { 
          size: 13,
          family: "'Inter', sans-serif",
          weight: 'bold' as const
        },
        bodyFont: { 
          size: 12,
          family: "'Inter', sans-serif",
          weight: 'normal' as const
        },
        callbacks: {
          title: (items) => items[0].label,
          label: (context) => {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value * 100) / total).toFixed(1);
            return `${value} sales (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%',
    radius: '85%'
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <div className="z-10 w-full">
        <Navbar />
      </div>

      {/* Mobile Sidebar Toggle - Fixed position with better visibility */}
      <div className="fixed left-0 top-0 z-[100] flex h-16 w-16 items-center justify-center md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full p-2 transition-all duration-200 ${isSidebarOpen
              ? "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
              : "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
            }`}
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed on mobile, static on desktop */}
        <div
          className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } fixed md:static md:translate-x-0 z-20 h-[calc(100vh-64px)] transition-transform duration-300 ease-in-out`}
        >
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white pl-16 md:pl-0">
              Admin Dashboard
            </h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-t-4 border-t-blue-500 dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg font-medium">
                  <span>Total Users</span>
                  <Users className="h-5 w-5 text-blue-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalUsers}</p>
                <p className="mt-1 text-sm text-blue-500 flex items-center">
                  <TrendingUp className="mr-1 inline h-4 w-4" />
                  <span>Registered users</span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-500 dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg font-medium">
                  <span>Total Courses</span>
                  <BookMarked className="h-5 w-5 text-blue-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalCourses}</p>
                <p className="mt-1 text-sm text-blue-500 flex items-center">
                  <TrendingUp className="mr-1 inline h-4 w-4" />
                  <span>Available courses</span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-500 dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg font-medium">
                  <span>Sales</span>
                  <CheckSquare className="h-5 w-5 text-blue-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalSales}</p>
                <p className="mt-1 text-sm text-blue-500 flex items-center">
                  <TrendingUp className="mr-1 inline h-4 w-4" />
                  <span>Total course purchases</span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-500 dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg font-medium">
                  <span>Revenue</span>
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">₹{totalRevenue}</p>
                <p className="mt-1 text-sm text-blue-500 flex items-center">
                  <TrendingUp className="mr-1 inline h-4 w-4" />
                  <span>Total revenue</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Chart Section */}
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Sales Bar Chart */}
              <Card className="border-t-4 border-t-blue-500 dark:bg-gray-800/95 shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-xl font-semibold">
                    <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                    Monthly Sales
                  </CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Track your monthly sales performance
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] p-4">
                    {transactionsData ? (
                      <Bar options={barChartOptions} data={barChartData} />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <p className="text-gray-500 dark:text-gray-400 mb-3">Loading data...</p>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Line Chart */}
              <Card className="border-t-4 border-t-blue-500 dark:bg-gray-800/95 shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-xl font-semibold">
                    <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
                    Revenue Trends
                  </CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Monitor your revenue growth over time
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] p-4">
                    {transactionsData ? (
                      <Line options={lineChartOptions} data={lineChartData} />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <p className="text-gray-500 dark:text-gray-400 mb-3">Loading data...</p>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Course Sales Pie Chart */}
            <Card className="border-t-4 border-t-blue-500 dark:bg-gray-800/95 shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-xl font-semibold">
                  <BookMarked className="mr-2 h-5 w-5 text-blue-500" />
                  Sales by Course
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Analyze the distribution of sales across courses
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] p-4">
                  {transactionsData ? (
                    <Pie options={pieChartOptions} data={pieChartData} />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <p className="text-gray-500 dark:text-gray-400 mb-3">Loading data...</p>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
