"use client";

import { useState } from "react";
import { User } from "lucide-react";
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
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-lg border border-red-200 bg-white p-6 shadow-md dark:border-red-800/30 dark:bg-gray-800">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <User className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Delete Account</h1>
          <p className="text-gray-600 dark:text-gray-300">
            This action cannot be undone. Please be certain.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">
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
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              variant="destructive"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Deleting Account..." : "Delete Account"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Confirm Account Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <User className="mx-auto mb-4 h-12 w-12 text-red-500 dark:text-red-400" />
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
