"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";

interface QuestionDisplayProps {
  question: { _id: string; text: string; options: string[]; selectedAnswer: number } | null;
  onSelectOption: (index: number) => void;
  onMarkForReview: () => void;
  questionIndex: number;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  onSelectOption,
  onMarkForReview,
  questionIndex,
}) => (
  <Card className="h-full border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Question {questionIndex + 1}
        </h3>
        <Button
          variant="outline"
          onClick={onMarkForReview}
          className="group rounded border-red-500 px-4 py-2 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/30"
          disabled={!question}
        >
          <Flag className="mr-2 h-4 w-4" />
          Mark for Review
        </Button>
      </div>
      {question ? (
        <>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            {question.text}
          </p>
          <div className="space-y-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => onSelectOption(index)}
                className={`w-full rounded border-2 p-4 text-left ${
                  question.selectedAnswer === index
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-200 dark:border-gray-600"
                } text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700/50`}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-600 dark:text-gray-300">
          No question available.
        </p>
      )}
    </div>
  </Card>
);