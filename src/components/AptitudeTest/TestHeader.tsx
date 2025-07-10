"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";

interface TestHeaderProps {
  testName: string;
  college: string;
  onExit: () => void;
}

export const TestHeader: React.FC<TestHeaderProps> = ({ testName, college, onExit }) => {
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-10 bg-white shadow-lg dark:bg-gray-800">
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
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setIsExitModalOpen(true)}
                className="group rounded border-blue-500 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                <span className="flex items-center gap-2">
                  Exit Test
                  <XCircle className="h-4 w-4" />
                </span>
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