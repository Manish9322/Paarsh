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
import { ChevronUp, ChevronDown, Eye, Pencil, Trash, Trash2, Edit } from "lucide-react";
import {
  useDeleteAgentMutation,
  useFetchUsersQuery,
} from "../../../services/api";
import AddAgentModal from "../../../components/Agent/AddAgent";
import { Input } from "@/components/ui/input";

// Define Agent type
interface Users {
  id: number;
  fullName: string;
  email: string;
  contact: string;
  createdAt: string;
}

const UserPage: React.FC = () => {
  const [sortField, setSortField] = useState<keyof Users | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Users | null>(null);

  const agentsPerPage = 10;
  const { data: userData, isLoading, refetch } = useFetchUsersQuery(undefined);
  const [deleteAgent] = useDeleteAgentMutation();
  const users: Users[] = userData?.data || [];
  const startIndex = (currentPage - 1) * agentsPerPage;

  console.log("Users data",users);

  const handleSort = (field: keyof Users) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredAgents = users.filter((user) =>
    Object.values(users).some((value) =>
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

  // Handle Edit
  const handleEdit = (agent: Users) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    try {
      await deleteAgent(id);
      refetch();
    } catch (error) {
      console.error("Error deleting agent:", error);
    }
  };

  

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
        <div className="ml-64 mt-20 flex-1 overflow-auto p-6">
          <Card className="border border-gray-300 bg-white hover:shadow-md">
            <CardContent className="p-4">
              <Table className="w-full text-black">
                <TableHeader>
                  <TableRow className="border-b border-gray-300 hover:bg-gray-200">
                    <TableHead>#</TableHead>
                    <TableHead onClick={() => handleSort("fullName")}>
                      Full Name{" "}
                      {sortField === "fullName" &&
                        (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown />)}
                    </TableHead>
                    <TableHead onClick={() => handleSort("email")}>
                      Email{" "}
                      {sortField === "email" &&
                        (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown />)}
                    </TableHead>
                    <TableHead onClick={() => handleSort("contact")}>
                      Contact{" "}
                      {sortField === "contact" &&
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
                        <TableCell>{agent.fullName}</TableCell>
                        <TableCell>{agent.email}</TableCell>
                        <TableCell>{agent.contact}</TableCell>
                        <TableCell className="flex gap-4 justify-center">
                            <button
                              
                              className="text-green-600  "
                             
                              onClick={() => {
                               
                              }}
                            >
                              <Eye size={22} />
                            </button>
                            <button
                              
                              className="text-blue-600"
                              onClick={() => {
                              
                              }}
                            >
                              <Edit size={20} />
                            </button>
                            <button

                              className="text-red-600"
                              onClick={() => {
                               
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

          <div className="mt-4 flex items-center justify-between">
            <div className="w-1/3"></div>
            <span className="w-1/3 text-center font-semibold text-gray-800">
              Page {currentPage} of {totalPages}
            </span>
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
                className="ml-2 bg-blue-600 text-white hover:bg-blue-500"
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

export default UserPage;
