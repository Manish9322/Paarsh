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
import { Textarea } from "@/components/ui/textarea";
import { Menu, User, Mail, Book, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { addLead } from "../../../../lib/slices/attributionSlice";
import { selectRootState } from "@/lib/store";
import { useCreateLeadMutation, useFetchagentCourseRefferalLinkQuery } from "@/services/api";

interface Course {
  id: string;
  courseName: string;
  referralLink: string;
}

const LeadTracking = () => {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [notes, setNotes] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const dispatch = useDispatch();
  const leadCount = useSelector((state) =>
    selectedAgent && selectRootState(state).leads.leads[selectedAgent]
      ? selectRootState(state).leads.leads[selectedAgent].leadCount
      : 0
  );

  const [_CREATELEAD, { isLoading }] = useCreateLeadMutation();
  const { data: agentCourseRefferalLinks } = useFetchagentCourseRefferalLinkQuery(undefined);

  const courses: Course[] = agentCourseRefferalLinks?.data.map((course) => ({
    id: course.courseId,
    courseName: course.courseName,
  })) || [];

  console.log("Courses", courses);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      dispatch(
        addLead({
          customerName,
          customerEmail,
          courseId: selectedCourse,
          notes,
        })
      );

      const response = await _CREATELEAD({
        customerName,
        customerEmail,
        courseId: selectedCourse,
        notes,
      }).unwrap();

      console.log(response);
      toast.success("Lead recorded successfully");

      setCustomerName("");
      setCustomerEmail("");
      setSelectedAgent("");
      setSelectedCourse("");
      setNotes("");
    } catch (error) {
      toast.error("Failed to record lead");
    }
  };

  const handleClearForm = () => {
    setCustomerName("");
    setCustomerEmail("");
    setSelectedAgent("");
    setSelectedCourse("");
    setNotes("");
    toast.info("Form cleared");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm dark:bg-gray-800 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-gray-600 hover:bg-teal-100 dark:text-gray-400 dark:hover:bg-teal-900/30"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </Button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Lead Tracking</h1>
        <div className="w-10"></div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-md transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white md:hidden">Dashboard</h1>
          </div>
          <div className="custom-scrollbar flex-1 overflow-y-auto">
            <Sidebar userRole="agent" />
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-16 md:ml-64">
        <div className="container mx-auto p-4 md:p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Lead Tracking</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Record potential customers for courses
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Form Card */}
            <div className="col-span-2">
              <Card className="rounded-lg border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="p-4">
                  <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                    Record New Lead
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Log a potential customer
                  </CardDescription>
                  {selectedAgent && (
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      Agent has {leadCount} lead(s)
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="customer-name"
                          className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white"
                        >
                          <User className="h-4 w-4" /> Customer Name
                        </Label>
                        <Input
                          id="customer-name"
                          placeholder="Customer's full name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="h-10 rounded-lg border-gray-300 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="customer-email"
                          className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white"
                        >
                          <Mail className="h-4 w-4" /> Customer Email
                        </Label>
                        <Input
                          id="customer-email"
                          type="email"
                          placeholder="customer@example.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="h-10 rounded-lg border-gray-300 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="course"
                          className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white"
                        >
                          <Book className="h-4 w-4" /> Course
                        </Label>
                        <Select
                          value={selectedCourse}
                          onValueChange={setSelectedCourse}
                          required
                        >
                          <SelectTrigger className="h-10 rounded-lg border-gray-300 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400">
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                            {courses.map((course) => (
                              <SelectItem
                                key={course.id}
                                value={course.id}
                                className="bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                              >
                                {course.courseName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="notes"
                        className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white"
                      >
                        <Info className="h-4 w-4" /> Additional Notes
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Details about this lead"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="h-20 rounded-lg border-gray-300 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        className="h-10 flex-1 rounded-lg bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800"
                        disabled={isLoading}
                      >
                        {isLoading ? "Recording..." : "Record Lead"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 flex-1 rounded-lg border-teal-600 text-teal-600 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-400 dark:hover:bg-teal-900/20"
                        onClick={handleClearForm}
                      >
                        Clear Form
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Guidelines Card */}
            <div className="col-span-1">
              <Card className="h-fit rounded-lg border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="p-4">
                  <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                    Lead Tracking Guidelines
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    When to record a lead
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                      When to use lead tracking:
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                      <li>Customer expressed interest in a course</li>
                      <li>Customer attended a demo or webinar</li>
                      <li>Customer was referred by another client</li>
                      <li>Customer responded to marketing efforts</li>
                      <li>Customer requested more information</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                      Required information:
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                      <li>Customer name and email</li>
                      <li>Course of interest</li>
                      <li>Reason for interest</li>
                      <li>Any relevant notes or interactions</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-yellow-200 bg-yellow-100 p-4 text-yellow-800 dark:border-yellow-900/20 dark:bg-yellow-900/20 dark:text-yellow-400">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <p className="text-sm font-medium">Important</p>
                    </div>
                    <p className="mt-1 text-sm">
                      Leads are reviewed by management. Ensure accurate details.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeadTracking;