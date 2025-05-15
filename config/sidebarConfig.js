import { FaHome, FaUser, FaVideo, FaBook, FaQuestion, FaPhone, FaGift, FaMoneyBill } from "react-icons/fa";
import { RiFilePaperLine, RiSpyFill, RiArticleFill } from "react-icons/ri";

const sidebarConfig = [
  { name: "Dashboard", path: "/admin", icon: <FaHome /> },
  { name: "Agent", path: "/admin/agent", icon: <RiSpyFill /> },
  { name: "Users", path: "/admin/users", icon: <FaUser /> },
  { name: "Offers", path: "/admin/offers", icon: <FaGift /> },
  {
    name: "Courses",
    icon: <FaBook />,
    children: [
      { name: "Courses", path: "/admin/course" },
      { name: "Categories", path: "/admin/categories" },
      { name: "Subcategories", path: "/admin/subcategories" },
    ],
  },
  {
    name: "Blogs",
    icon: <RiArticleFill />,
    children: [
      { name: "Posts", path: "/admin/posts" },
      { name: "Categories", path: "/admin/categories" },
      { name: "Tags", path: "/admin/tags" },
    ],
  },
  { name: "Job Applications", path: "/admin/job-applications", icon: <RiFilePaperLine /> },
  { name: "Enquiries", path: "/admin/enquiries", icon: <FaQuestion /> },
  { name: "Meeting Links", path: "/admin/meeting-links", icon: <FaVideo /> },
  { name: "Contact Requests", path: "/admin/contacts", icon: <FaPhone /> },
  { name: "Withdrawal Requests", path: "/admin/withdraw", icon: <FaMoneyBill /> },
  { name: "Transactions", path: "/admin/transactions", icon: <FaMoneyBill /> },

];

export default sidebarConfig;
