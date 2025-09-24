"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";

interface NavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  onPrevious,
  onNext,
  onSubmit,
  isFirst,
  isLast,
}) => {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-4">
        <Button
          onClick={onPrevious}
          disabled={isFirst}
          variant="outline"
          className="group rounded border-blue-500 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30 sm:px-6 sm:py-3 sm:text-base"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="ml-1 sm:hidden">Previous</span>
        </Button>
        <Button
          onClick={onNext}
          disabled={isLast}
          className="group relative inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 sm:px-6 sm:py-3 sm:text-base"
        >
          <span className="sm:hidden">Next</span>
          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button
          onClick={() => setIsSubmitModalOpen(true)}
          className="group relative inline-flex items-center gap-1 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 sm:gap-2 sm:px-6 sm:py-3 sm:text-base"
        >
          <span className="text-xs sm:text-sm">Submit Test</span>
          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
      <ConfirmationModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={onSubmit}
        type="submit"
      />
    </>
  );
};