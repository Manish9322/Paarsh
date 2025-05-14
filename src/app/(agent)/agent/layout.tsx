
import AgentProtectedRoute from "../../../../utils/AgentProtectedRoute";
import Navbar from "../../../components/Layout/Navbar";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AgentProtectedRoute>{children}
    <Navbar />
  </AgentProtectedRoute>;
}
