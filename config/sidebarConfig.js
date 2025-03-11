import { CiChat1 } from "react-icons/ci";
import { FaHome, FaRegUser } from "react-icons/fa";
import { LuUsers } from "react-icons/lu";

const sidebarConfig = [
  { name: "Dashboard", path: "/admin/dashboard", icon: <FaHome /> },
  { name: "Agent", path: "/admin/agent", icon: <FaRegUser /> },
  { name: "Users", path: "/admin/users", icon: <FaRegUser /> },

  {
    name: "Courses",
    icon: <LuUsers />,
    children: [
      { name: "Courses", path: "/admin/course" },
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
      { name: "Tags", path: "/admin/tags" },
    ],
  },

  { name: "Enquiries", path: "/admin/enquiries", icon: <CiChat1 /> },
  { name: "Contact Requests", path: "/admin/contacts", icon: <CiChat1 /> },
];

export default sidebarConfig;
