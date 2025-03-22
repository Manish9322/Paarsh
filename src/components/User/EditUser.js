"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { updateField, resetForm } from "../../lib/slices/userSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useUpdateUserMutation } from "@/services/api";

const EditUserModal = ({ editOpen, setEditOpen, selectedUser }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [_UPDATEUSER, { isLoading }] = useUpdateUserMutation();

  useEffect(() => {
    if (selectedUser) {
      dispatch(updateField({ field: "name", value: selectedUser.name }));
      dispatch(updateField({ field: "email", value: selectedUser.email }));
      dispatch(updateField({ field: "mobile", value: selectedUser.mobile }));
    }
  }, [selectedUser, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateField({ field: name, value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await _UPDATEUSER({ id: selectedUser._id, ...user }).unwrap();
      toast.success("User updated successfully");
      setEditOpen(false);
      dispatch(resetForm());
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update user. Please try again.");
    }
  };

  return (
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <DialogContent className="w-[400px] rounded-lg bg-white p-6 text-black shadow-lg">
          <DialogHeader className="mb-4 flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              placeholder="Full Name"
              value={user?.name || ""}
              onChange={handleChange}
              required
              className="rounded-lg border border-gray-300 bg-white p-2 text-black focus:ring-2 focus:ring-blue-500"
            />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={user?.email || ""}
              onChange={handleChange}
              required
              className="rounded-lg border border-gray-300 bg-white p-2 text-black focus:ring-2 focus:ring-blue-500"
            />
            <Input
              type="tel"
              name="mobile"
              placeholder="Mobile"
              value={user?.mobile || ""}
              onChange={handleChange}
              required
              className="rounded-lg border border-gray-300 bg-white p-2 text-black focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-500 p-2 font-medium text-white hover:bg-blue-600"
            >
              {isLoading ? "Updating..." : "Update User"}
            </Button>
          </form>
        </DialogContent>
      </motion.div>
    </Dialog>
  );
};

export default EditUserModal;
