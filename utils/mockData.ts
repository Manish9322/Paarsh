import { format, subDays } from 'date-fns';

export interface SalesData {
  id: string;
  courseName: string;
  price: number;
  date: string;
  customer: string;
  agent: string;
  commission: number;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  targetMonthly: number;
  currentMonthSales: number;
  totalSales: number;
  conversionRate: number;
}

export interface Course {
  id: string;
  name: string;
  price: number;
  salesCount: number;
  revenue: number;
}

export interface SalesActivity {
  id: string;
  activity: string;
  agent: string;
  courseName: string;
  date: string;
  amount?: number;
}

// Generate mock sales data
export const salesData: SalesData[] = [
  {
    id: "sale-001",
    courseName: "Advanced Web Development",
    price: 599,
    date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    customer: "John Doe",
    agent: "Sarah Miller",
    commission: 119.8
  },
  {
    id: "sale-002",
    courseName: "UI/UX Design Masterclass",
    price: 499,
    date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    customer: "Emma Wilson",
    agent: "Sarah Miller",
    commission: 99.8
  },
  {
    id: "sale-003",
    courseName: "Data Science Bootcamp",
    price: 899,
    date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    customer: "Michael Brown",
    agent: "David Johnson",
    commission: 179.8
  },
  {
    id: "sale-004",
    courseName: "Mobile App Development",
    price: 699,
    date: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
    customer: "Jennifer Lee",
    agent: "Sarah Miller",
    commission: 139.8
  },
  {
    id: "sale-005",
    courseName: "Advanced Web Development",
    price: 599,
    date: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    customer: "Robert Garcia",
    agent: "Alex Turner",
    commission: 119.8
  },
  {
    id: "sale-006",
    courseName: "Data Science Bootcamp",
    price: 899,
    date: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
    customer: "Lisa Wang",
    agent: "David Johnson",
    commission: 179.8
  },
  {
    id: "sale-007",
    courseName: "UI/UX Design Masterclass",
    price: 499,
    date: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    customer: "Thomas Martinez",
    agent: "Sarah Miller",
    commission: 99.8
  },
  {
    id: "sale-008",
    courseName: "Mobile App Development",
    price: 699,
    date: format(subDays(new Date(), 8), 'yyyy-MM-dd'),
    customer: "Sophia Kim",
    agent: "Alex Turner",
    commission: 139.8
  }
];

export const agents: Agent[] = [
  {
    id: "agent-001",
    name: "Sarah Miller",
    email: "sarah.miller@example.com",
    avatar: "https://randomuser.me/api/portraits/women/20.jpg",
    targetMonthly: 8000,
    currentMonthSales: 5800,
    totalSales: 42500,
    conversionRate: 68
  },
  {
    id: "agent-002",
    name: "David Johnson",
    email: "david.johnson@example.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    targetMonthly: 7500,
    currentMonthSales: 6200,
    totalSales: 38700,
    conversionRate: 72
  },
  {
    id: "agent-003",
    name: "Alex Turner",
    email: "alex.turner@example.com",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    targetMonthly: 7000,
    currentMonthSales: 4900,
    totalSales: 31200,
    conversionRate: 65
  }
];

export const courses: Course[] = [
  {
    id: "course-001",
    name: "Advanced Web Development",
    price: 599,
    salesCount: 37,
    revenue: 22163
  },
  {
    id: "course-002",
    name: "UI/UX Design Masterclass",
    price: 499,
    salesCount: 45,
    revenue: 22455
  },
  {
    id: "course-003",
    name: "Data Science Bootcamp",
    price: 899,
    salesCount: 28,
    revenue: 25172
  },
  {
    id: "course-004",
    name: "Mobile App Development",
    price: 699,
    salesCount: 32,
    revenue: 22368
  }
];

export const recentActivities: SalesActivity[] = [
  {
    id: "activity-001",
    activity: "New Sale",
    agent: "Sarah Miller",
    courseName: "Advanced Web Development",
    date: format(subDays(new Date(), 1), 'yyyy-MM-dd HH:mm'),
    amount: 599
  },
  {
    id: "activity-002",
    activity: "Target Reached",
    agent: "David Johnson",
    courseName: "",
    date: format(subDays(new Date(), 2), 'yyyy-MM-dd HH:mm'),
  },
  {
    id: "activity-003",
    activity: "New Sale",
    agent: "Alex Turner",
    courseName: "Mobile App Development",
    date: format(subDays(new Date(), 2), 'yyyy-MM-dd HH:mm'),
    amount: 699
  },
  {
    id: "activity-004",
    activity: "New Sale",
    agent: "Sarah Miller",
    courseName: "UI/UX Design Masterclass",
    date: format(subDays(new Date(), 3), 'yyyy-MM-dd HH:mm'),
    amount: 499
  },
  {
    id: "activity-005",
    activity: "Customer Follow-up",
    agent: "David Johnson",
    courseName: "Data Science Bootcamp",
    date: format(subDays(new Date(), 4), 'yyyy-MM-dd HH:mm'),
  }
];

export const monthlySalesData = [
  { month: 'Jan', sales: 4200 },
  { month: 'Feb', sales: 5100 },
  { month: 'Mar', sales: 5900 },
  { month: 'Apr', sales: 6700 },
  { month: 'May', sales: 5400 },
  { month: 'Jun', sales: 6100 },
  { month: 'Jul', sales: 6600 },
  { month: 'Aug', sales: 7200 },
  { month: 'Sep', sales: 6800 },
  { month: 'Oct', sales: 7500 },
  { month: 'Nov', sales: 8100 },
  { month: 'Dec', sales: 9200 },
];

export const courseSalesData = [
  { course: 'Web Dev', sales: 98 },
  { course: 'UI/UX', sales: 120 },
  { course: 'Data Science', sales: 75 },
  { course: 'Mobile Dev', sales: 85 },
];

// Function to filter sales data by agent ID
export const getAgentSales = (agentName: string) => {
  return salesData.filter(sale => sale.agent === agentName);
};

// Function to calculate the total sales for an agent
export const getAgentTotalSales = (agentName: string) => {
  const agentSales = getAgentSales(agentName);
  return agentSales.reduce((total, sale) => total + sale.price, 0);
};

// Function to calculate the total commission for an agent
export const getAgentTotalCommission = (agentName: string) => {
  const agentSales = getAgentSales(agentName);
  return agentSales.reduce((total, sale) => total + sale.commission, 0);
};

// Function to get current agent (for demo, returning the first agent)
export const getCurrentAgent = () => {
  return agents[0];
};
