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
import { useFetchAgentQuery } from "@/services/api";

// Define Agent type
interface Agent {
  id: number;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const agentsPerPage = 10;
  const { data: agentData, isLoading } = useFetchAgentQuery(undefined);
  const agents: Agent[] = agentData?.data || [];
  const startIndex = (currentPage - 1) * agentsPerPage;

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

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <nav className="fixed top-0 z-10 flex w-full items-center justify-between bg-white p-4 shadow-md">
        <h1 className="ml-20 text-3xl font-semibold text-black">Paarsh Edu</h1>
        <Button className="mr-8 bg-blue-500 text-white hover:bg-blue-600">
          Logout
        </Button>
      </nav>

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
                    <TableHead>Actions</TableHead>
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
                            onClick={() => {}}
                          >
                            <Eye size={22} />
                          </button>
                          <button className="text-blue-600" onClick={() => {}}>
                            <Edit size={20} />
                          </button>
                          <button className="text-red-600" onClick={() => {}}>
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
