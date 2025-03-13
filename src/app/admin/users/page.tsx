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
import {
  ChevronUp,
  ChevronDown,
  Eye,
  Pencil,
  Trash,
  Trash2,
  Edit,
} from "lucide-react";
import {
  useDeleteAgentMutation,
  useFetchUsersQuery,
} from "../../../services/api";
import AddAgentModal from "../../../components/Agent/AddAgent";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminSkeletonWrapper } from "@/components/ui/admin-skeleton-wrapper";

// Define Agent type
interface Users {
  id: number;
  name: string;
  email: string;
  mobile: string;
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

  console.log("Users data", users);

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

  console.log("displayedUsers Are", displayedAgents);

  return (
    <AdminSkeletonWrapper>
      <div className="flex h-screen flex-col bg-gray-100">
        <div className="flex flex-1 pt-16">
          <Sidebar />
          <div className="ml-64 mt-20 flex-1 overflow-auto p-6">
            <Card className="border border-gray-300 bg-white hover:shadow-md">
              <CardContent className="p-4">
                <Table className="w-full text-black">
                  <TableHeader>
                    <TableRow className="border-b border-gray-300 hover:bg-gray-200">
                      <TableHead>#</TableHead>
                      <TableHead onClick={() => handleSort("name")}>
                        Full Name{" "}
                        {sortField === "name" &&
                          (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown />)}
                      </TableHead>
                      <TableHead onClick={() => handleSort("email")}>
                        Email{" "}
                        {sortField === "email" &&
                          (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown />)}
                      </TableHead>
                      <TableHead onClick={() => handleSort("mobile")}>
                        Contact{" "}
                        {sortField === "mobile" &&
                          (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown />)}
                      </TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading
                      ? Array.from({ length: 7 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Skeleton className="h-4 w-6" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell className="flex justify-center gap-4">
                              <Skeleton className="h-6 w-6 rounded-full" />
                              <Skeleton className="h-6 w-6 rounded-full" />
                              <Skeleton className="h-6 w-6 rounded-full" />
                            </TableCell>
                          </TableRow>
                        ))
                      : displayedAgents.map((agent, index) => (
                          <TableRow
                            key={agent.id}
                            className="border-b border-gray-300 hover:bg-gray-200"
                          >
                            <TableCell>{startIndex + index + 1}</TableCell>
                            <TableCell>{agent.name}</TableCell>
                            <TableCell>{agent.email}</TableCell>
                            <TableCell>{agent.mobile}</TableCell>
                            <TableCell className="flex justify-center gap-4">
                              <button
                                className="text-green-600  "
                                onClick={() => {}}
                              >
                                <Eye size={22} />
                              </button>
                              <button
                                className="text-blue-600"
                                onClick={() => {}}
                              >
                                <Edit size={20} />
                              </button>
                              <button className="text-red-600" onClick={() => {}}>
                                <Trash2 size={20} />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
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
    </AdminSkeletonWrapper>
  );
};

export default UserPage;
