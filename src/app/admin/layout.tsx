// layout.tsx (Keep it as a Server Component)

import AdminProtectedRoute from "utils/adminProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProtectedRoute>{children}</AdminProtectedRoute>;
}
