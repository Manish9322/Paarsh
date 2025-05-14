import { FaHome, FaUser, FaVideo, FaBook, FaQuestion, FaPhone, FaMoneyBill } from "react-icons/fa";
import { RiFilePaperLine, RiSpyFill, RiArticleFill } from "react-icons/ri";

const agentSidebarConfig = [
  { name: "Dashboard", path: "/agent", icon: <FaHome /> },
  { name: "Courses", path: "/agent/courses", icon: <FaBook />},
  { name: "Manual Attribution", path: "/agent/manualattribution", icon: <FaBook />},
  { name: "Sales", path: "/agent/sales", icon: <FaMoneyBill  /> },
 
];

export default agentSidebarConfig;
