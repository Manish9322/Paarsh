import { FaHome, FaUser, FaVideo, FaBook, FaQuestion, FaPhone, FaGift, FaMoneyBill, FaPencilRuler, FaPen } from "react-icons/fa";
import { IoNotificationsCircleSharp } from "react-icons/io5";
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
    name: "Practice Tests",
    icon: <FaPencilRuler />,
    children: [
      { name: "New Practice Test", path: "/admin/practice-tests" },
      { name: "Practice Test logs", path: "/admin/practice-test-logs" },
    ],
  },
  {
    name: "Aptitude Tests",
    icon: <FaPencilRuler />,
    children: [
      { name: "Aptitude Test Logs", path: "/admin/aptitude-tests" },
      { name: "Aptitude Test Results", path: "/admin/aptitude-test-results" },
    ],
  },
  {
    name: "Blogs",
    icon: <RiArticleFill />,
    children: [
      { name: "Posts", path: "/admin/blogs" },
      { name: "Categories", path: "/admin/categories" },
      { name: "Tags", path: "/admin/tags" },
    ],
  },
  {
    name: "Careers",
    icon: <RiFilePaperLine />,
    children: [
      { name: "Job Posts", path: "/admin/job-posts" },
      { name: "Job Applications", path: "/admin/job-applications" },
    ],
  },
  { name: "Feedbacks", path: "/admin/feedbacks", icon: <FaPen /> },
  { name: "Enquiries", path: "/admin/enquiries", icon: <FaQuestion /> },
  { name: "Meeting Links", path: "/admin/meeting-links", icon: <FaVideo /> },
  { name: "Contact Requests", path: "/admin/contacts", icon: <FaPhone /> },
  { name: "Withdrawal Requests", path: "/admin/withdraw", icon: <FaMoneyBill /> },
  { name: "Transactions", path: "/admin/transactions", icon: <FaMoneyBill /> },
  {name: "visitors", path: "/admin/visitors", icon: <FaUser />},
  {name: "Notifications", path: "/admin/push-notifications", icon: <IoNotificationsCircleSharp />},
  {name: "Referal Program", path: "/admin/referal-program", icon: <FaUser />},
  

];

export default sidebarConfig;
