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
      <Card className="mb-4 animate-pulse p-6">
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-4 p-6">
      <div className="prose prose-gray max-w-none dark:prose-invert">
        <h3 className="mb-4 text-lg font-medium">{question.question}</h3>
      </div>
      <RadioGroup
        value={question.selectedAnswer.toString()}
        onValueChange={(value) => onAnswerSelect(parseInt(value))}
        className="mt-4 space-y-3"
      >
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <RadioGroupItem value={index.toString()} id={`option-${index}`} />
            <Label htmlFor={`option-${index}`} className="text-base">
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </Card>
  );
};