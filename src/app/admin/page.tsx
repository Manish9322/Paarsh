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
  Calendar,
  CalendarDays,
  CalendarIcon
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
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
  
  // Add time filter states
  const [salesTimeFilter, setSalesTimeFilter] = useState("month");
  const [revenueTimeFilter, setRevenueTimeFilter] = useState("month");
  const [courseDistributionTimeFilter, setCourseDistributionTimeFilter] = useState("month");
  // Add filter states for top stat cards
  const [statsCardSalesFilter, setStatsCardSalesFilter] = useState("month");
  const [statsCardRevenueFilter, setStatsCardRevenueFilter] = useState("month");

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

  // Calculate filtered sales and revenue based on selected time period
  const calculateFilteredStats = (timeFilter) => {
    if (!transactionsData?.data) return { sales: 0, revenue: 0 };
    
    const currentDate = new Date();
    
    // Filter transactions based on time filter
    const filteredTransactions = transactionsData.data.filter(transaction => {
      if (transaction.status !== "SUCCESS") return false;
      
      const transactionDate = new Date(transaction.createdAt);
      
      if (timeFilter === "day") {
        // Same day (today)
        return transactionDate.setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0);
      } else if (timeFilter === "week") {
        // Current week (Sunday to Saturday)
        const today = new Date();
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        firstDayOfWeek.setHours(0, 0, 0, 0);
        
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
        lastDayOfWeek.setHours(23, 59, 59, 999);
        
        return transactionDate >= firstDayOfWeek && transactionDate <= lastDayOfWeek;
      } else if (timeFilter === "month") {
        // Same month and year
        return transactionDate.getMonth() === currentDate.getMonth() && 
               transactionDate.getFullYear() === currentDate.getFullYear();
      } else if (timeFilter === "year") {
        // Same year
        return transactionDate.getFullYear() === currentDate.getFullYear();
      }
      
      return true; // Default case (all)
    });
    
    // Calculate sales count and revenue
    const sales = filteredTransactions.length;
    const revenue = filteredTransactions.reduce((acc, transaction) => acc + (transaction.amount || 0), 0);
    
    return { sales, revenue };
  };
  
  // Get filtered stats for top cards
  const salesCardStats = calculateFilteredStats(statsCardSalesFilter);
  const revenueCardStats = calculateFilteredStats(statsCardRevenueFilter);
  
  // Helper function to get appropriate time period label
  const getTimePeriodLabel = (timeFilter) => {
    switch (timeFilter) {
      case "day":
        return "Today's";
      case "week":
        return "This week's";
      case "month":
        return "This month's";
      case "year":
        return "This year's";
      default:
        return "Total";
    }
  };
  
  // Original calculations (for reference)
  // const totalSales = transactionsData?.data?.filter(transaction => transaction.status === "SUCCESS").length || 0;
  // const totalRevenue = transactionsData?.data?.reduce((acc, transaction) => {
  //   if (transaction.status === "SUCCESS") {
  //     return acc + (transaction.amount || 0);
  //   }
  //   return acc;
  // }, 0) || 0;

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

  // Enhanced data processing function with time filtering
  const processTransactionData = (timeFilter) => {
    if (!transactionsData?.data) return null;
    
    const currentDate = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Filter transactions based on time filter
    const filteredTransactions = transactionsData.data.filter(transaction => {
      if (transaction.status !== "SUCCESS") return false;
      
      const transactionDate = new Date(transaction.createdAt);
      
      if (timeFilter === "day") {
        // Same day (today)
        return transactionDate.setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0);
      } else if (timeFilter === "week") {
        // Current week (Sunday to Saturday)
        const today = new Date();
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        firstDayOfWeek.setHours(0, 0, 0, 0);
        
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
        lastDayOfWeek.setHours(23, 59, 59, 999);
        
        return transactionDate >= firstDayOfWeek && transactionDate <= lastDayOfWeek;
      } else if (timeFilter === "month") {
        // Same month and year
        return transactionDate.getMonth() === currentDate.getMonth() && 
               transactionDate.getFullYear() === currentDate.getFullYear();
      } else if (timeFilter === "year") {
        // Same year
        return transactionDate.getFullYear() === currentDate.getFullYear();
      }
      
      return true; // Default case (all)
    });
    
    // For day view: hours in a day
    const hoursLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const hourlyData = Array(24).fill(0);
    const hourlyRevenue = Array(24).fill(0);
    
    // For week view: days of the week
    const weeklyData = Array(7).fill(0);
    const weeklyRevenue = Array(7).fill(0);
    
    // For month view: days in current month
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const daysLabels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
    const dailyData = Array(daysInMonth).fill(0);
    const dailyRevenue = Array(daysInMonth).fill(0);
    
    // For year view: months in a year
    const monthlyData = Array(12).fill(0);
    const monthlyRevenue = Array(12).fill(0);
    
    // Course sales distribution
    const courseSales = {};
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      
      // Process data based on time filter
      if (timeFilter === "day") {
        const hour = date.getHours();
        hourlyData[hour]++;
        hourlyRevenue[hour] += transaction.amount;
      } else if (timeFilter === "week") {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        weeklyData[dayOfWeek]++;
        weeklyRevenue[dayOfWeek] += transaction.amount;
      } else if (timeFilter === "month") {
        const day = date.getDate() - 1; // 0-based index
        dailyData[day]++;
        dailyRevenue[day] += transaction.amount;
      } else if (timeFilter === "year") {
        const month = date.getMonth();
        monthlyData[month]++;
        monthlyRevenue[month] += transaction.amount;
      }
      
      // Course sales distribution
      const courseId = transaction.courseId?._id || transaction.courseId;
      const courseName = transaction.courseId?.courseName || `Course ${courseId}`;
      courseSales[courseName] = (courseSales[courseName] || 0) + 1;
    });
    
    // Get week date range for label
    const getWeekDateRange = () => {
      const today = new Date();
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
      const lastDay = new Date(new Date(firstDay).setDate(firstDay.getDate() + 6));
      
      const formatDate = (date) => {
        return `${date.getDate()} ${months[date.getMonth()]}`;
      };
      
      return `${formatDate(firstDay)} - ${formatDate(lastDay)}`;
    };
    
    // Return appropriate data based on time filter
    if (timeFilter === "day") {
      return {
        labels: hoursLabels,
        salesData: hourlyData,
        revenueData: hourlyRevenue,
        courseSales: {
          labels: Object.keys(courseSales),
          data: Object.values(courseSales)
        },
        periodLabel: "Today"
      };
    } else if (timeFilter === "week") {
      return {
        labels: weekdays,
        salesData: weeklyData,
        revenueData: weeklyRevenue,
        courseSales: {
          labels: Object.keys(courseSales),
          data: Object.values(courseSales)
        },
        periodLabel: getWeekDateRange()
      };
    } else if (timeFilter === "month") {
      return {
        labels: daysLabels,
        salesData: dailyData,
        revenueData: dailyRevenue,
        courseSales: {
          labels: Object.keys(courseSales),
          data: Object.values(courseSales)
        },
        periodLabel: `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`
      };
    } else if (timeFilter === "year") {
      return {
        labels: months,
        salesData: monthlyData,
        revenueData: monthlyRevenue,
        courseSales: {
          labels: Object.keys(courseSales),
          data: Object.values(courseSales)
        },
        periodLabel: currentDate.getFullYear().toString()
      };
    }
  };

  // Get chart data based on selected filters
  const salesChartData = processTransactionData(salesTimeFilter);
  const revenueChartData = processTransactionData(revenueTimeFilter);
  const courseDistributionChartData = processTransactionData(courseDistributionTimeFilter);

  const barChartData = {
    labels: salesChartData?.labels || [],
    datasets: [
      {
        label: 'Sales',
        data: salesChartData?.salesData || [],
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
    labels: revenueChartData?.labels || [],
    datasets: [
      {
        label: 'Revenue',
        data: revenueChartData?.revenueData || [],
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
    labels: courseDistributionChartData?.courseSales?.labels || [],
    datasets: [
      {
        data: courseDistributionChartData?.courseSales?.data || [],
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

  // Update chart titles based on filter
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
            text: 'Sales',
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
        text: `Sales Distribution ${salesChartData?.periodLabel || ""}`,
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
            text: 'Revenue',
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
        text: `Revenue Trends ${revenueChartData?.periodLabel || ""}`,
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
        text: `Course Sales Distribution ${courseDistributionChartData?.periodLabel || ""}`,
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
          <Sidebar userRole="admin" />
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
                  <div className="flex items-center gap-2">
                    <span>Sales</span>
                    <Select 
                      value={statsCardSalesFilter} 
                      onValueChange={setStatsCardSalesFilter}
                    >
                      <SelectTrigger className="w-[100px] h-7 text-xs border-blue-100 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-1 pl-2">
                        <div className="flex items-center w-full">
                          {statsCardSalesFilter === "day" && (
                            <CalendarDays className="h-3.5 w-3.5 mr-1 text-blue-500" />
                          )}
                          {statsCardSalesFilter === "week" && (
                            <Calendar className="h-3.5 w-3.5 mr-1 text-blue-500" />
                          )}
                          {statsCardSalesFilter === "month" && (
                            <Calendar className="h-3.5 w-3.5 mr-1 text-blue-500" />
                          )}
                          {statsCardSalesFilter === "year" && (
                            <CalendarIcon className="h-3.5 w-3.5 mr-1 text-blue-500" />
                          )}
                          <SelectValue placeholder="Period" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">
                          <div className="flex items-center">
                            {/* <CalendarDays className="mr-2 h-4 w-4" /> */}
                            <span>Day</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="week">
                          <div className="flex items-center">
                            {/* <Calendar className="mr-2 h-4 w-4" /> */}
                            <span>Week</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="month">
                          <div className="flex items-center">
                            {/* <Calendar className="mr-2 h-4 w-4" /> */}
                            <span>Month</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="year">
                          <div className="flex items-center">
                            {/* <CalendarIcon className="mr-2 h-4 w-4" /> */}
                            <span>Year</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <CheckSquare className="h-5 w-5 text-blue-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{salesCardStats.sales}</p>
                <p className="mt-1 text-sm text-blue-500 flex items-center">
                  <TrendingUp className="mr-1 inline h-4 w-4" />
                  <span>{getTimePeriodLabel(statsCardSalesFilter)} course purchases</span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-500 dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg font-medium">
                  <div className="flex items-center gap-2">
                    <span>Revenue</span>
                    <Select 
                      value={statsCardRevenueFilter} 
                      onValueChange={setStatsCardRevenueFilter}
                    >
                      <SelectTrigger className="w-[100px] h-7 text-xs border-blue-100 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-1 pl-2">
                        <div className="flex items-center w-full">
                          {statsCardRevenueFilter === "day" && (
                            <CalendarDays className="h-3.5 w-3.5 mr-1 text-blue-500" />
                          )}
                          {statsCardRevenueFilter === "week" && (
                            <Calendar className="h-3.5 w-3.5 mr-1 text-blue-500" />
                          )}
                          {statsCardRevenueFilter === "month" && (
                            <Calendar className="h-3.5 w-3.5 mr-1 text-blue-500" />
                          )}
                          {statsCardRevenueFilter === "year" && (
                            <CalendarIcon className="h-3.5 w-3.5 mr-1 text-blue-500" />
                          )}
                          <SelectValue placeholder="Period" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">
                          <div className="flex items-center">
                            {/* <CalendarDays className="mr-2 h-4 w-4" /> */}
                            <span>Day</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="week">
                          <div className="flex items-center">
                            {/* <Calendar className="mr-2 h-4 w-4" /> */}
                            <span>Week</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="month">
                          <div className="flex items-center">
                            {/* <Calendar className="mr-2 h-4 w-4" /> */}
                            <span>Month</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="year">
                          <div className="flex items-center">
                            {/* <CalendarIcon className="mr-2 h-4 w-4" /> */}
                            <span>Year</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">₹{revenueCardStats.revenue}</p>
                <p className="mt-1 text-sm text-blue-500 flex items-center">
                  <TrendingUp className="mr-1 inline h-4 w-4" />
                  <span>{getTimePeriodLabel(statsCardRevenueFilter)} revenue</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Chart Section */}
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Chart with Time Filter */}
              <Card className="border-t-4 border-t-blue-500 dark:bg-gray-800/95 shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-xl font-semibold">
                      <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                      Sales
                    </CardTitle>
                    <Select 
                      value={salesTimeFilter} 
                      onValueChange={setSalesTimeFilter}
                    >
                      <SelectTrigger className="w-[120px] h-9">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">
                          <div className="flex items-center">
                            <CalendarDays className="mr-2 h-4 w-4" />
                            <span>Day</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="week">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Week</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="month">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Month</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="year">
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>Year</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Track your sales performance
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

              {/* Revenue Line Chart with Time Filter */}
              <Card className="border-t-4 border-t-blue-500 dark:bg-gray-800/95 shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-xl font-semibold">
                      <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
                      Revenue Trends
                    </CardTitle>
                    <Select 
                      value={revenueTimeFilter} 
                      onValueChange={setRevenueTimeFilter}
                    >
                      <SelectTrigger className="w-[120px] h-9">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">
                          <div className="flex items-center">
                            <CalendarDays className="mr-2 h-4 w-4" />
                            <span>Day</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="week">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Week</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="month">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Month</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="year">
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>Year</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
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

            {/* Course Sales Pie Chart with Time Filter */}
            <Card className="border-t-4 border-t-blue-500 dark:bg-gray-800/95 shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl font-semibold">
                    <BookMarked className="mr-2 h-5 w-5 text-blue-500" />
                    Sales by Course
                  </CardTitle>
                  <Select 
                    value={courseDistributionTimeFilter} 
                    onValueChange={setCourseDistributionTimeFilter}
                  >
                    <SelectTrigger className="w-[120px] h-9">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">
                        <div className="flex items-center">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          <span>Day</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="week">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Week</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="month">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Month</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="year">
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>Year</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
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
