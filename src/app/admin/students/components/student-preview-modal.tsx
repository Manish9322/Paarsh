"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import { selectRootState } from "@/lib/store";
import { resetPreviewStudent } from "@/lib/slices/studentsSlice";

const StudentPreviewModal = () => {
  const dispatch = useDispatch();
  const { previewStudent } = useSelector((state) => selectRootState(state).students);

  const handleClose = () => {
    dispatch(resetPreviewStudent());
  };

  if (!previewStudent) return null;

  return (
    <Dialog open={!!previewStudent} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Name</h4>
              <p>{previewStudent.name}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Email</h4>
              <p>{previewStudent.email}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Phone</h4>
              <p>{previewStudent.phone}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Degree</h4>
              <p>{previewStudent.degree}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">University</h4>
              <p>{previewStudent.university}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">College</h4>
              <p>{previewStudent.college?.name || "N/A"}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Joined On</h4>
              <p>{new Date(previewStudent.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentPreviewModal; 