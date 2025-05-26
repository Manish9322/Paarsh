"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Menu, X, Copy, Share } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useFetchagentCourseRefferalLinkQuery } from "../../../../services/api";
import Navbar from "@/components/Layout/Navbar";

// Define Course type for referral links
interface Course {
  id: string;
  courseName: string;
  referralLink: string;
}

export default function ReferralLinks() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();

  const { data: agentCourseRefferalLinks } = useFetchagentCourseRefferalLinkQuery(undefined);

  const courses: Course[] = agentCourseRefferalLinks?.data.map((course) => ({
    id: course.courseId,
    courseName: course.courseName,
    referralLink: course.referralLink,
  })) || [];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Referral link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link.");
    });
  };

  const handleShareLink = async (link: string, courseName: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${courseName}`,
          text: `Check out this course: ${courseName}!`,
          url: link,
        });
        toast.success("Referral link shared successfully!");
      } catch (error) {
        toast.error("Failed to share link.");
      }
    } else {
      navigator.clipboard.writeText(link).then(() => {
        toast.success("Share not supported. Link copied to clipboard!");
      }).catch(() => {
        toast.error("Failed to copy link.");
      });
    }
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="z-10 w-full">
        <Navbar />
      </div>

      <div className="fixed left-0 top-0 z-[100] flex h-16 w-16 items-center justify-center md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-full p-2"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed md:static md:translate-x-0 transition-transform duration-300 ease-in-out`}
        >
          <Sidebar userRole="agent" />
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white pl-16 md:pl-0">
              Courses Links
            </h1>
          </div>

          <Card className="dark:bg-gray-800">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-800 p-4 pb-4 pt-6 sm:p-6">
              <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                Courses Links
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="w-full text-black dark:text-white">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                      <TableHead className="hidden py-3 text-center sm:table-cell">
                        #
                      </TableHead>
                      <TableHead className="py-3">Course Name</TableHead>
                      <TableHead className="hidden md:table-cell py-3">
                        Course Link
                      </TableHead>
                      <TableHead className="py-3 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="py-6 text-center text-gray-500"
                        >
                          No courses available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      courses.map((course, index) => (
                        <TableRow
                          key={course.id}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <TableCell className="hidden text-center font-medium sm:table-cell">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="sm:block">
                              <p className="font-medium">{course.courseName}</p>
                              <p className="mt-1 text-xs text-gray-500 md:hidden truncate max-w-[200px]">
                                {course.referralLink}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="truncate max-w-[200px] inline-block">
                                    {course.referralLink}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{course.referralLink}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleCopyLink(course.referralLink)}
                                      className="h-8 w-8 rounded-full bg-teal-50 text-teal-600 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30"
                                      aria-label="Copy referral link"
                                    >
                                      <Copy size={16} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Copy link</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleShareLink(course.referralLink, course.courseName)}
                                      className="h-8 w-8 rounded-full bg-teal-50 text-teal-600 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30"
                                      aria-label="Share referral link"
                                    >
                                      <Share size={16} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Share link</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}