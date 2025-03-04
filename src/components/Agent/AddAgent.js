"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAddAgentMutation } from "../../services/api";
import { updateField, resetForm } from "../../lib/slices/agentSlice";

const AddAgentModal = ({ open, setOpen }) => {
  const dispatch = useDispatch();
  const agent = useSelector((state) => state.agent); // Get agent state from Redux

  const [addAgent, { isLoading }] = useAddAgentMutation();

  // Handle input change using Redux actions
  const handleChange = (e) => {
    dispatch(updateField({ field: e.target.name, value: e.target.value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addAgent(agent).unwrap();
      if (response?.success) {
        toast.success("Agent added successfully");
        setOpen(false);
        dispatch(resetForm()); // Reset the form after successful submission
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add agent. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white text-black rounded-lg p-6 shadow-lg w-[400px]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold">Add Agent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="firstName"
            placeholder="First Name"
            value={agent.firstName}
            onChange={handleChange}
            required
            className="bg-white text-black border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
          <Input
            name="lastName"
            placeholder="Last Name"
            value={agent.lastName}
            onChange={handleChange}
            required
            className="bg-white text-black border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
          <Input
            name="email"
            placeholder="Email Address"
            type="email"
            value={agent.email}
            onChange={handleChange}
            required
            className="bg-white text-black border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
          <Input
            name="mobile"
            placeholder="Phone Number"
            type="tel"
            value={agent.mobile}
            onChange={handleChange}
            required
            className="bg-white text-black border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
          <Input
            name="gender"
            placeholder="Gender"
            value={agent.gender}
            onChange={handleChange}
            required
            className="bg-white text-black border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
          <Input
            name="city"
            placeholder="City"
            value={agent.city}
            onChange={handleChange}
            required
            className="bg-white text-black border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
          <Input
            name="state"
            placeholder="State"
            value={agent.state}
            onChange={handleChange}
            required
            className="bg-white text-black border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white hover:bg-blue-600 p-2 rounded-lg font-medium"
          >
            {isLoading ? "Adding..." : "Add Agent"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAgentModal;
