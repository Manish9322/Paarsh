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

interface Category {
  name: string;
}

interface CourseFiltersProps {
  categories: Category[];
  onFilterChange: (filters: { searchTerm: string; level: string; category: string; minPrice: string; maxPrice: string }) => void;
  isCategoriesLoading: boolean;
}

export default function CourseFilters({ categories, onFilterChange, isCategoriesLoading }: CourseFiltersProps) {
  const [filters, setFilters] = useState({
    searchTerm: "",
    level: "all",
    category: "all",
    minPrice: "",
    maxPrice: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Convert "all" values back to empty strings for the parent component
    const processedFilters = {
      ...newFilters,
      level: newFilters.level === "all" ? "" : newFilters.level,
      category: newFilters.category === "all" ? "" : newFilters.category,
    };
    onFilterChange(processedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      searchTerm: "",
      level: "all",
      category: "all",
      minPrice: "",
      maxPrice: "",
    };
    setFilters(clearedFilters);
    onFilterChange({
      searchTerm: "",
      level: "",
      category: "",
      minPrice: "",
      maxPrice: "",
    });
  };

  return (
    <div className="mb-6 rounded-lg bg-white dark:bg-gray-900 p-4 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-gray-500 hover:text-gray-700 dark:text-white"
        >
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-white">Search Courses</label>
          <Input
            type="text"
            placeholder="Search by name, category..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-white">Level</label>
          <Select
            value={filters.level}
            onValueChange={(value) => handleFilterChange("level", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-white">Category</label>
          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange("category", value)}
            disabled={isCategoriesLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.name} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-white">Min Price (₹)</label>
          <Input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            placeholder="Min price"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-white">Max Price (₹)</label>
          <Input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            placeholder="Max price"
          />
        </div>
      </div>
    </div>
  );
}