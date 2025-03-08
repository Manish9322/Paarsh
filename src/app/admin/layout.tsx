// layout.tsx (Keep it as a Server Component)

import AdminProtectedRoute from "../../../utils/AdminProtectedRoute";
import Navbar from "../../components/Layout/Navbar";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProtectedRoute>{children}
    <Navbar />
  </AdminProtectedRoute>;
}
