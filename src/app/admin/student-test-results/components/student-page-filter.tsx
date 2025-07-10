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
import { toast } from "sonner";

interface College {
  _id: string;
  name: string;
}

interface Filters {
  status: string;
  college: string;
  minViolations: string;
  maxViolations: string;
  minMarks: string;
  maxMarks: string;
  result: string;
  startDate: string;
  endDate: string;
}

interface StudentTestFiltersProps {
  colleges: College[];
  onFilterChange: (filters: Filters) => void;
}

export default function StudentTestFilters({ colleges, onFilterChange }: StudentTestFiltersProps) {
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    college: "all",
    minViolations: "",
    maxViolations: "",
    minMarks: "",
    maxMarks: "",
    result: "all",
    startDate: "",
    endDate: "",
  });

  const handleFilterChange = (key: keyof Filters, value: string) => {
    // Validation for minMarks and maxMarks
    if (key === "minMarks" && filters.maxMarks && value && Number(value) > Number(filters.maxMarks)) {
      toast.error("Minimum marks cannot be greater than maximum marks");
      return;
    }
    if (key === "maxMarks" && filters.minMarks && value && Number(value) < Number(filters.minMarks)) {
      toast.error("Maximum marks cannot be less than minimum marks");
      return;
    }

    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const processedFilters = {
      ...newFilters,
      status: newFilters.status === "all" ? "" : newFilters.status,
      college: newFilters.college === "all" ? "" : newFilters.college,
      result: newFilters.result === "all" ? "" : newFilters.result,
    };
    onFilterChange(processedFilters);
  };

  const clearFilters = () => {
    const clearedFilters: Filters = {
      status: "all",
      college: "all",
      minViolations: "",
      maxViolations: "",
      minMarks: "",
      maxMarks: "",
      result: "all",
      startDate: "",
      endDate: "",
    };
    setFilters(clearedFilters);
    onFilterChange({
      status: "",
      college: "",
      minViolations: "",
      maxViolations: "",
      minMarks: "",
      maxMarks: "",
      result: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="mb-6 m-4 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 dark:text-white"
        >
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-white">Test Status</label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="disqualified">Disqualified</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-white">College</label>
          <Select
            value={filters.college}
            onValueChange={(value) => handleFilterChange("college", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select college" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colleges</SelectItem>
              {colleges.map((college) => (
                <SelectItem key={college._id} value={college._id}>
                  {college.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-white">Min Violations</label>
          <Input
            type="number"
            min="0"
            value={filters.minViolations}
            onChange={(e) => handleFilterChange("minViolations", e.target.value)}
            placeholder="Min violations"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-white">Max Violations</label>
          <Input
            type="number"
            min="0"
            value={filters.maxViolations}
            onChange={(e) => handleFilterChange("maxViolations", e.target.value)}
            placeholder="Max violations"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-white">Min Marks</label>
          <Input
            type="number"
            min="0"
            value={filters.minMarks}
            onChange={(e) => handleFilterChange("minMarks", e.target.value)}
            placeholder="Min marks"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-white">Max Marks</label>
          <Input
            type="number"
            min="0"
            value={filters.maxMarks}
            onChange={(e) => handleFilterChange("maxMarks", e.target.value)}
            placeholder="Max marks"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-white">Result</label>
          <Select
            value={filters.result}
            onValueChange={(value) => handleFilterChange("result", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="Pass">Pass</SelectItem>
              <SelectItem value="Fail">Fail</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-white">Test Start Date</label>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-white">Test End Date</label>
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