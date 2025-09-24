"use client";

import { Card } from "@/components/ui/card";

interface QuestionMetaProps {
  totalQuestions: number;
  attempted: number;
  notAttempted: number;
  marked: number;
}

export const QuestionMeta: React.FC<QuestionMetaProps> = ({
  totalQuestions,
  attempted,
  notAttempted,
  marked,
}) => (
  <Card className="border border-gray-100 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-4">
    <div>
      <h3 className="mb-3 text-base font-bold text-gray-900 dark:text-white sm:mb-4 sm:text-lg">
        Test Overview
      </h3>
      <div className="space-y-1.5 sm:space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-300 sm:text-base">
          <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-blue-600 sm:h-3 sm:w-3"></span>
          Total Questions: {totalQuestions}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 sm:text-base">
          <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-green-500 sm:h-3 sm:w-3"></span>
          Attempted: {attempted}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 sm:text-base">
          <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-gray-200 dark:bg-gray-600 sm:h-3 sm:w-3"></span>
          Not Attempted: {notAttempted}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 sm:text-base">
          <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-red-500 sm:h-3 sm:w-3"></span>
          Marked for Review: {marked}
        </p>
      </div>
    </div>
  </Card>
);