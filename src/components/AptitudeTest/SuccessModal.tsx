"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
      <div className="p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Registration Successful!
        </h3>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Your account has been created. Please log in to start the test.
        </p>
        <Button
          onClick={onClose}
          className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
        >
          OK
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);