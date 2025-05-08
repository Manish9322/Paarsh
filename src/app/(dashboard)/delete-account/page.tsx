"use client";

import { useState } from "react";
import { User, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useFetchUserQuery, useDeleteUserMutation } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/slices/userAuthSlice";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function DeleteAccountPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: userData } = useFetchUserQuery(undefined);
  const [deleteUser] = useDeleteUserMutation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      const response = await deleteUser({
        email: formData.email,
        password: formData.password
      }).unwrap();

      if (response.success) {
        toast.success("Account deleted successfully");
        handleLogout();
      }
    } catch (error) {
      if (error?.status === 404) {
        toast.error("User not found");
      } else if (error?.status === 400) {
        toast.error("Incorrect password");
      } else if (error?.status === 403) {
        toast.error("Unauthorized to delete this account");
      } else {
        toast.error("Failed to delete account. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="rounded-md border border-red-200 bg-white p-8 shadow-lg transition-all hover:shadow-xl dark:border-red-800/30 dark:bg-gray-800/90 dark:shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-red-100 ring-8 ring-red-50/10 dark:from-red-900/30 dark:to-red-800/30">
              <User className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Delete Account</h1>
            <div className="mx-auto max-w-md">
              <p className="text-gray-600 dark:text-gray-300">
                This action will permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-md">
            <div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Please verify your credentials to proceed
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-11 transition-colors focus:border-red-500 focus:ring-red-500 dark:bg-gray-800 dark:focus:border-red-400 rounded-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-11 transition-colors focus:border-red-500 focus:ring-red-500 dark:bg-gray-800 dark:focus:border-red-400 rounded-md"
                />
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <Button
                  type="submit"
                  variant="destructive"
                  className="h-11 text-base font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? "Deleting Account..." : "Delete Account"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 text-base font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md rounded-md border-red-200 p-6 dark:border-red-800/30 dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Confirm Account Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <User className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              This will permanently delete your account and all associated data. This action cannot be reversed.
            </p>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="h-11 w-full text-base font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="h-11 w-full text-base transition-transform hover:scale-[1.02] active:scale-[0.98] rounded-md sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Yes, Delete My Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
