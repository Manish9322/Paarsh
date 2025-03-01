import { User } from "lucide-react";
import path from "path";

import { CiChat1 } from "react-icons/ci";
import { FaHome, FaUsers } from "react-icons/fa";
import { LuUsers } from "react-icons/lu";

const sidebarConfig = [
  { name: "Dashboard", path: "/admin/dashboard", icon: <FaHome /> },
  { name: "Agent", path: "/admin/agent", icon: <User />, },
  { name: "Users", path: "/admin/users", icon: <User />, },

  {
    name: "Courses",
    icon: <LuUsers />,
    children: [
      { name: "Courses", path: "/admin/courses" },
      { name: "Categories", path: "/admin/categories" },
      { name: "Subcategories", path: "/admin/subcategories" },
    ],
  },

  {
    name: "Blogs",
    icon: <LuUsers />,
    children: [
      { name: "Posts", path: "/admin/posts" },
      { name: "Categories", path: "/admin/categories" },
      { name: "Tags" },
    ],
  },

  { name: "Enquiries", path: "/admin/enquiries", icon: <CiChat1 /> },
  { name: "Contact Requests", icon: <CiChat1 /> },
];

export default sidebarConfig;
