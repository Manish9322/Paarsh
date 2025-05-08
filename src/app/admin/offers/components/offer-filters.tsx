"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface OfferFiltersProps {
  courses: any[];
  onFilterChange: (filters: any) => void;
}

export default function OfferFilters({ courses, onFilterChange }: OfferFiltersProps) {
  const [filters, setFilters] = useState({
    status: "all",
    minDiscount: "",
    maxDiscount: "",
    course: "all",
    startDate: "",
    endDate: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Convert "all" values back to empty strings for the parent component
    const processedFilters = {
      ...newFilters,
      status: newFilters.status === "all" ? "" : newFilters.status,
      course: newFilters.course === "all" ? "" : newFilters.course,
    };
    onFilterChange(processedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: "all",
      minDiscount: "",
      maxDiscount: "",
      course: "all",
      startDate: "",
      endDate: "",
    };
    setFilters(clearedFilters);
    onFilterChange({
      status: "",
      minDiscount: "",
      maxDiscount: "",
      course: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Min Discount (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            value={filters.minDiscount}
            onChange={(e) => handleFilterChange("minDiscount", e.target.value)}
            placeholder="Min %"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Max Discount (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            value={filters.maxDiscount}
            onChange={(e) => handleFilterChange("maxDiscount", e.target.value)}
            placeholder="Max %"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Course</label>
          <Select
            value={filters.course}
            onValueChange={(value) => handleFilterChange("course", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.courseName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Start Date</label>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">End Date</label>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
} 