"use client";

import UserProtectedRoute from "../../../utils/UserProtectedRoute";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProtectedRoute>
        {children}
    </UserProtectedRoute>
  );
} 