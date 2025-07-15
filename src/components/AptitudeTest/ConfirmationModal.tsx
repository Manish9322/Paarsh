"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, XCircle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: "exit" | "submit";
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, type }) => {
  const handleConfirm = async () => {
    if (type === "submit") {
      try {
        // Try to exit fullscreen using the standard API first
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          // Fallback to vendor prefixed versions
          const doc = document as any;
          if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
            await doc.webkitExitFullscreen();
          } else if (doc.mozFullScreenElement && doc.mozCancelFullScreen) {
            await doc.mozCancelFullScreen();
          } else if (doc.msFullscreenElement && doc.msExitFullscreen) {
            await doc.msExitFullscreen();
          }
        }
      } catch (error) {
        console.error("Error exiting fullscreen:", error);
      }
    }
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {type === "exit" ? "Exit Test?" : "Submit Test?"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center">
          {type === "exit" ? (
            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500 dark:text-red-400" />
          ) : (
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500 dark:text-green-400" />
          )}
          <p className="text-gray-600 dark:text-gray-300">
            {type === "exit"
              ? "Are you sure you want to exit the test? You won't be able to restart the test."
              : "Are you sure you want to submit the test? You cannot change answers after submission."}
          </p>
        </div>
        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className={`w-full sm:w-auto ${type === "exit" ? "bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600" : "bg-green-500 hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600"}`}
          >
            {type === "exit" ? "Exit" : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};