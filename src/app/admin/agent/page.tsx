"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronUp, ChevronDown, Eye, Edit, Trash2 } from "lucide-react";

import AddAgentModal from "../../../components/Agent/AddAgent";
import { Input } from "@/components/ui/input";
import { useDeleteAgentMutation, useFetchAgentQuery } from "@/services/api";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { toast } from "sonner";
import EditAgentModal from "../../../components/Agent/EditAgent";

// Define Agent type
interface Agent {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  contact: string;
  countSale: number;
  state: string;
  createdAt: string;
}

const AgentPage: React.FC = () => {
  const [sortField, setSortField] = useState<keyof Agent | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const agentsPerPage = 10;
  const { data: agentData, isLoading } = useFetchAgentQuery(undefined);
  const agents: Agent[] = agentData?.data || [];
  const startIndex = (currentPage - 1) * agentsPerPage;

  const [_DELETEAGENT, { isLoading: isDeleteLoading, error: deleteError }] =
    useDeleteAgentMutation();
  const handleSort = (field: keyof Agent) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredAgents = agents.filter((agent) =>
    Object.values(agent).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    if (!sortField) return 0;
    return sortOrder === "asc"
      ? a[sortField] > b[sortField]
        ? 1
        : -1
      : a[sortField] < b[sortField]
        ? 1
        : -1;
  });

  const totalPages = Math.ceil(sortedAgents.length / agentsPerPage);
  const displayedAgents = sortedAgents.slice(
    (currentPage - 1) * agentsPerPage,
    currentPage * agentsPerPage,
  );

  const handleDeleteAgent = async (agentId: string) => {
    try {
      const response = await _DELETEAGENT({ id: agentId }).unwrap();

      if (response?.success) {
        toast.success("Agent deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error(
        error?.data?.message ||
          "Failed to Delete the category. Please try again.",
      );
    }
  };

  console.log("displayedAgetn is", displayedAgents);
  return (
    <div className="flex h-screen flex-col bg-gray-100">
  
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <div className="ml-64 flex-1 overflow-auto p-6">
          <div className="my-6 flex items-center justify-between rounded-lg bg-white p-5 shadow-md">
            <Input
              type="text"
              placeholder="Search agents..."
              className="w-[40%] rounded-lg border border-gray-300 bg-white p-2 text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              + Add Agent
            </Button>
          </div>

          <Card className="border border-gray-300 bg-white hover:shadow-md">
            <CardContent className="p-4">
              <Table className="w-full text-black">
                <TableHeader>
                  <TableRow className="border-b border-gray-300 hover:bg-gray-200">
                    <TableHead>#</TableHead>
                    <TableHead onClick={() => handleSort("firstName")}>
                      First Name{" "}
                      {sortField === "firstName" &&
                        (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown />)}
                    </TableHead>
                    <TableHead onClick={() => handleSort("lastName")}>
                      Last Name{" "}
                      {sortField === "lastName" &&
                        (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown />)}
                    </TableHead>
                    <TableHead onClick={() => handleSort("contact")}>
                      Contact{" "}
                      {sortField === "contact" &&
                        (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown />)}
                    </TableHead>
                    <TableHead onClick={() => handleSort("countSale")}>
                      Count Sale{" "}
                      {sortField === "countSale" &&
                        (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown />)}
                    </TableHead>
                    <TableHead onClick={() => handleSort("state")}>
                      State{" "}
                      {sortField === "state" &&
                        (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown />)}
                    </TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedAgents.map((agent, index) => (
                      <TableRow
                        key={agent.id}
                        className="border-b border-gray-300 hover:bg-gray-200"
                      >
                        <TableCell>{startIndex + index + 1}</TableCell>
                        <TableCell>{agent.firstName}</TableCell>
                        <TableCell>{agent.lastName}</TableCell>
                        <TableCell>{agent.contact}</TableCell>
                        <TableCell>{agent.countSale}</TableCell>
                        <TableCell>{agent.state}</TableCell>
                        <TableCell className="flex justify-center gap-4">
                          <button
                            className="text-green-600  "
                            onClick={() => {
                              setSelectedAgent(agent);
                              setViewOpen(true);
                            }}
                          >
                            <Eye size={22} />
                          </button>
                          <button
                            className="text-blue-600"
                            onClick={() => {
                              setSelectedAgent(agent);
                              setEditOpen(true);
                            }}
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            className="text-red-600"
                            onClick={() => {
                              handleDeleteAgent(agent._id);
                            }}
                          >
                            <Trash2 size={20} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={viewOpen} onOpenChange={setViewOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agent Details</DialogTitle>
              </DialogHeader>
              {selectedAgent ? (
                <div className="space-y-2">
                  <p>
                    <strong>ID:</strong> {selectedAgent.id}
                  </p>
                  <p>
                    <strong>Name:</strong> {selectedAgent.firstName}{" "}
                    {selectedAgent.lastName}
                  </p>
                  <p>
                    <strong>Contact:</strong> {selectedAgent.contact}
                  </p>
                  <p>
                    <strong>Sales Count:</strong> {selectedAgent.countSale}
                  </p>
                  <p>
                    <strong>State:</strong> {selectedAgent.state}
                  </p>
                  <p>
                    <strong>Created At:</strong>{" "}
                    {new Date(selectedAgent.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p>No agent selected.</p>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Course Modal */}
          <EditAgentModal
            editOpen={editOpen}
            setEditOpen={setEditOpen}
            selectedAgent={selectedAgent}
          />

          <div className="mt-4 flex items-center justify-between">
            {/* Placeholder div to push "Page X of Y" to the center */}
            <div className="w-1/3"></div>

            {/* Centered Page Info */}
            <span className="w-1/3 text-center font-semibold text-gray-800">
              Page {currentPage} of {totalPages}
            </span>

            {/* Next & Previous Buttons (Aligned to Right) */}
            <div className="flex w-1/3 justify-end">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="mr-2 bg-blue-700 text-white"
              >
                Previous
              </Button>
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="ml-2 bg-blue-600 text-white hover:bg-blue-500 "
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AddAgentModal open={isModalOpen} setOpen={setIsModalOpen} />
      )}
    </div>
  );
};

export default AgentPage;
