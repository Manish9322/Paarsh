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
  <Card className="border border-gray-100 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
    <div>
      <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
        Test Overview
      </h3>
      <div className="space-y-2">
        <p className="text-gray-600 dark:text-gray-300">
          <span className="mr-2 inline-block h-3 w-3 rounded-full bg-blue-600"></span>
          Total Questions: {totalQuestions}
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          <span className="mr-2 inline-block h-3 w-3 rounded-full bg-green-500"></span>
          Attempted: {attempted}
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          <span className="mr-2 inline-block h-3 w-3 rounded-full bg-gray-200 dark:bg-gray-600"></span>
          Not Attempted: {notAttempted}
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          <span className="mr-2 inline-block h-3 w-3 rounded-full bg-red-500"></span>
          Marked for Review: {marked}
        </p>
      </div>
    </div>
  </Card>
);