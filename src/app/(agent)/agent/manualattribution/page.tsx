"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Menu, User, Mail, Book, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { addLead } from "../../../../lib/slices/attributionSlice";
import { selectRootState } from "@/lib/store";
import { agents, courses } from "../../../../../utils/mockData";
import { useCreateLeadMutation } from "@/services/api";

const LeadTracking = () => {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [interestReason, setInterestReason] = useState("");
  const [notes, setNotes] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const dispatch = useDispatch();
  const leadCount = useSelector((state) =>
    selectedAgent && selectRootState(state).leads.leads[selectedAgent]
      ? selectRootState(state).leads.leads[selectedAgent].leadCount
      : 0
  );

const [_CREATELEAD, { isLoading }] = useCreateLeadMutation();

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Dispatch action to add lead
    dispatch(
      addLead({
        agentId: selectedAgent,
        customerName,
        customerEmail,
        courseId: selectedCourse,
        reason: interestReason,
        notes,
      })
    );
  
    const response = _CREATELEAD({
      agentId: selectedAgent,
      customerName,
      customerEmail,
      courseId: selectedCourse,
      reason: interestReason,
      notes,
    }).unwrap();

     console.log(response);

    // Show success toast
    toast.success("Lead has been successfully recorded");

    // Reset form
    setCustomerName("");
    setCustomerEmail("");
    setSelectedAgent("");
    setSelectedCourse("");
    setInterestReason("");
    setNotes("");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header with Menu Button */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
        <button
          onClick={toggleSidebar}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Lead Tracking</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Sidebar - fixed position with proper scrolling */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 md:justify-end">
            <h1 className="text-xl font-bold md:hidden">Dashboard</h1>
          </div>
          <div className="custom-scrollbar flex-1 overflow-y-auto">
            <Sidebar userRole="agent" />
          </div>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto pt-16 md:ml-64">
        <div className="container mx-auto px-4 py-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Lead Tracking</h1>
            <p className="text-sm text-muted-foreground">
              Record potential customers informed about courses
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Form Card */}
            <div className="col-span-2">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Record New Lead</CardTitle>
                  <CardDescription>
                    Use this form to log a potential customer for an agent
                  </CardDescription>
                  {selectedAgent && (
                    <CardDescription>
                      This agent has recorded {leadCount} lead(s).
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="customer-name" className="flex items-center gap-2">
                          <User className="h-4 w-4" /> Customer Name
                        </Label>
                        <Input
                          id="customer-name"
                          placeholder="Customer's full name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customer-email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" /> Customer Email
                        </Label>
                        <Input
                          id="customer-email"
                          type="email"
                          placeholder="customer@example.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="course" className="flex items-center gap-2">
                          <Book className="h-4 w-4" /> Course
                        </Label>
                        <Select
                          value={selectedCourse}
                          onValueChange={setSelectedCourse}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reason" className="flex items-center gap-2">
                          <Info className="h-4 w-4" /> Reason for Interest
                        </Label>
                        <Select
                          value={interestReason}
                          onValueChange={setInterestReason}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inquiry">
                              Customer inquired about course
                            </SelectItem>
                            <SelectItem value="demo">
                              Attended demo session
                            </SelectItem>
                            <SelectItem value="referral">
                              Referred by another customer
                            </SelectItem>
                            <SelectItem value="marketing">
                              Responded to marketing campaign
                            </SelectItem>
                            <SelectItem value="other">Other reason</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="flex items-center gap-2">
                        <Info className="h-4 w-4" /> Additional Notes
                      </Label>
                      <Input
                        id="notes"
                        placeholder="Any additional details about this lead"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    <Button type="submit" className="mt-4">
                      Record Lead
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Guidelines Card */}
            <Card className="h-fit shadow-md">
              <CardHeader>
                <CardTitle>Lead Tracking Guidelines</CardTitle>
                <CardDescription>When to record a lead</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">When to use lead tracking:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Customer expressed interest in a course</li>
                    <li>Customer attended a demo or webinar</li>
                    <li>Customer was referred by another client</li>
                    <li>Customer responded to marketing efforts</li>
                    <li>Customer requested more information</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Required information:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Customer name and email</li>
                    <li>Course of interest</li>
                    <li>Reason for interest</li>
                    <li>Any relevant notes or interactions</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="text-sm font-medium">Important</p>
                  </div>
                  <p className="text-sm mt-1">
                    Leads are reviewed by management. Ensure accurate details to
                    facilitate follow-up.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeadTracking;