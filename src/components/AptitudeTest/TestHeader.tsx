"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { XCircle, Clock, AlertTriangle } from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";

interface TestHeaderProps {
  testName: string;
  college: string;
  onExit: () => void;
  timeRemaining: number | null;
}

export const TestHeader: React.FC<TestHeaderProps> = ({ 
  testName, 
  college, 
  onExit,
  timeRemaining 
}) => {
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeRunningLow = timeRemaining !== null && timeRemaining <= 300; // 5 minutes

  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-2 py-3 sm:px-4 sm:py-4">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl lg:text-2xl">
                {testName}
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                {college}
              </p>
            </div>
            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:gap-6">
              <div className={`flex items-center gap-1 rounded-lg border px-2 py-1 sm:gap-2 sm:px-4 sm:py-2 ${
                isTimeRunningLow 
                  ? 'animate-pulse border-red-500 bg-red-50 text-red-600 dark:border-red-400 dark:bg-red-900/30 dark:text-red-400'
                  : 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                {isTimeRunningLow ? (
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
                <span className="font-mono text-sm font-medium sm:text-base lg:text-lg">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsExitModalOpen(true)}
                className="flex items-center gap-1 border-red-500 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/30 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
              >
                <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Exit Test</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={onExit}
        type="exit"
      />
    </>
  );
};