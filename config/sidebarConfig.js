import { CiChat1 } from "react-icons/ci";
import { FaHome, FaRegUser } from "react-icons/fa";
import { LuUsers } from "react-icons/lu";
import { FaVideo } from "react-icons/fa";
import { RiFilePaperLine } from "react-icons/ri";


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
  
  { name: "Job Applications", path: "/admin/job-applications", icon: <RiFilePaperLine /> },
  { name: "Enquiries", path: "/admin/enquiries", icon: <CiChat1 /> },
  { name: "Meeting Links", path: "/admin/meeting-links", icon: <FaVideo /> },
  { name: "Contact Requests", path: "/admin/contacts", icon: <CiChat1 /> },
];

export default sidebarConfig;
