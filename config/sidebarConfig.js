import path from "path";
import { CiChat1 } from "react-icons/ci";
import { FaHome, FaUsers } from "react-icons/fa";
import { LuUsers } from "react-icons/lu";

const sidebarConfig = [
  { name: "Dashboard", icon: <FaHome  />, action: () => console.log("Navigate to Dashboard") },

  {
    name: "Courses",
    icon: <LuUsers />,
    children: [
      { name: "Courses", path: "/admin/courses", action: () => console.log("Navigate to All Courses") },
      { name: "Categories", path: "/admin/categories", action: () => console.log("Navigate to Add Course") },
      { name: "Subcategories", path: "/admin/subcategories", action: () => console.log("Navigate to Manage Courses") },
    ],
  },

  {
    name: "Blogs",
    icon: <LuUsers  />,
    children: [
      { name: "Posts", path: "/admin/posts", action: () => console.log("Navigate to All Categories") },
      { name: "Categories", path: "/admin/categories", action: () => console.log("Navigate to Add Category") },
      { name: "Tags", action: () => console.log("Navigate to Add Category") },
    ],
  },

  { name: "Enquiries", path: "/admin/enquiries", icon: <CiChat1 />, action: () => console.log("Navigate to SubCategories") },
  { name: "Contact Requests", icon: <CiChat1 />, action: () => console.log("Navigate to Blogs") },
];

export default sidebarConfig;
