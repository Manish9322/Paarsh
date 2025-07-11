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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {testName}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {college}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 ${
                isTimeRunningLow 
                  ? 'animate-pulse border-red-500 bg-red-50 text-red-600 dark:border-red-400 dark:bg-red-900/30 dark:text-red-400'
                  : 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                {isTimeRunningLow ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <Clock className="h-5 w-5" />
                )}
                <span className="font-mono text-lg font-medium">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsExitModalOpen(true)}
                className="flex items-center gap-2 border-red-500 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <XCircle className="h-4 w-4" />
                Exit Test
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