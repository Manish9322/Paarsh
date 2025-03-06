"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { updateField, resetForm } from "../../lib/slices/agentSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useUpdateAgentMutation } from "@/services/api";

const EditAgentModal = ({ editOpen, setEditOpen, selectedAgent }) => {
  const dispatch = useDispatch();
  const agent = useSelector((state) => state.agent);
  const [_UPDATEAGENT, { isLoading }] = useUpdateAgentMutation();

  useEffect(() => {
    if (selectedAgent) {
      Object.keys(selectedAgent).forEach((key) => {
        dispatch(updateField({ field: key, value: selectedAgent[key] }));
      });
    }
  }, [selectedAgent, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateField({ field: name, value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await _UPDATEAGENT({ id: selectedAgent._id, ...agent }).unwrap();
      toast.success("Agent updated successfully");
      setEditOpen(false);
      dispatch(resetForm());
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to update agent. Please try again.",
      );
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
            <DialogTitle className="text-xl font-semibold">
              Edit Agent
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="firstName"
              placeholder="First Name"
              value={agent?.firstName || ""}
              onChange={handleChange}
              required
              className="rounded-lg border border-gray-300 bg-white p-2 text-black focus:ring-2 focus:ring-blue-500"
            />
            <Input
              name="lastName"
              placeholder="Last Name"
              value={agent?.lastName || ""}
              onChange={handleChange}
              required
              className="rounded-lg border border-gray-300 bg-white p-2 text-black focus:ring-2 focus:ring-blue-500"
            />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={agent?.email || ""}
              onChange={handleChange}
              required
              className="rounded-lg border border-gray-300 bg-white p-2 text-black focus:ring-2 focus:ring-blue-500"
            />
            <Input
              type="tel"
              name="mobile"
              placeholder="Mobile"
              value={agent?.mobile || ""}
              onChange={handleChange}
              required
              className="rounded-lg border border-gray-300 bg-white p-2 text-black focus:ring-2 focus:ring-blue-500"
            />
            <Input
              name="gender"
              placeholder="Gender"
              value={agent?.gender || ""}
              onChange={handleChange}
              required
              className="rounded-lg border border-gray-300 bg-white p-2 text-black focus:ring-2 focus:ring-blue-500"
            />
            <Input
              name="state"
              placeholder="State"
              value={agent?.state || ""}
              onChange={handleChange}
              required
              className="rounded-lg border border-gray-300 bg-white p-2 text-black focus:ring-2 focus:ring-blue-500"
            />
            <Input
              name="city"
              placeholder="City"
              value={agent?.city || ""}
              onChange={handleChange}
              required
              className="rounded-lg border border-gray-300 bg-white p-2 text-black focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-500 p-2 font-medium text-white hover:bg-blue-600"
            >
              {isLoading ? "Updating..." : "Update Agent"}
            </Button>
          </form>
        </DialogContent>
      </motion.div>
    </Dialog>
  );
};

export default EditAgentModal;
