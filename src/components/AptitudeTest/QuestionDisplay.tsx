"use client";

import React from "react";
import { Card } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

interface Question {
  _id: string;
  question: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  selectedAnswer: number;
}

interface QuestionDisplayProps {
  question: Question;
  onAnswerSelect: (answer: number) => void;
  isLoading?: boolean;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  onAnswerSelect,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card className="mb-4 animate-pulse p-4 sm:p-6">
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700 sm:h-4" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-4 p-4 sm:p-6">
      <div className="prose prose-gray max-w-none dark:prose-invert">
        <h3 className="mb-4 text-base font-medium leading-relaxed sm:text-lg">{question.question}</h3>
      </div>
      <RadioGroup
        value={question.selectedAnswer.toString()}
        onValueChange={(value) => onAnswerSelect(parseInt(value))}
        className="mt-3 space-y-2 sm:mt-4 sm:space-y-3"
      >
        {question.options.map((option, index) => (
          <div key={index} className="flex items-start space-x-2 rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 sm:items-center sm:p-4">
            <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-0.5 sm:mt-0" />
            <Label htmlFor={`option-${index}`} className="text-sm leading-relaxed sm:text-base">
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </Card>
  );
};