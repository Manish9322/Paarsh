"use client";

import UserProtectedRoute from "../../../components/UserProtectedRoute";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProtectedRoute>
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </UserProtectedRoute>
  );
} 