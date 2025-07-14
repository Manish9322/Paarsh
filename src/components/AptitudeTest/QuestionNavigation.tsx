"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "../ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface QuestionNavigationProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  questionStatus: { [key: string]: { answered: boolean; marked: boolean } };
  isLoading?: boolean;
}

const QuestionNavigationSkeleton = () => (
  <Card className="mb-4 p-4">
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 25 }, (_, i) => (
        <Skeleton key={i} className="h-8 w-8 rounded-full" />
      ))}
    </div>
  </Card>
);

export const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  totalQuestions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  questionStatus,
  isLoading = false
}) => {
  const [questionGroup, setQuestionGroup] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const questionsPerGroup = 25;
  const totalGroups = Math.ceil(totalQuestions / questionsPerGroup);

  const questionButtons = useMemo(() => 
    Array.from({ length: totalQuestions }, (_, index) => {
      const questionNumber = index + 1;
      const status = questionStatus[questionNumber];
      const isAnswered = status?.answered;
      const isMarked = status?.marked;
      const isCurrent = currentQuestionIndex === index;

      let buttonClass = "flex h-8 w-8 items-center justify-center rounded-full p-2 text-sm font-semibold transition-all duration-200 ";
      
      if (isCurrent) {
        buttonClass += "bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-500";
      } else if (isMarked) {
        buttonClass += "bg-orange-500 text-white hover:bg-orange-600";
      } else if (isAnswered) {
        buttonClass += "bg-emerald-500 text-white hover:bg-emerald-600";
      } else {
        buttonClass += "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600";
      }

      return (
        <button
          key={questionNumber}
          onClick={() => setCurrentQuestionIndex(index)}
          className={buttonClass}
          disabled={isLoading}
        >
          {questionNumber}
        </button>
      );
    }),
    [totalQuestions, questionStatus, currentQuestionIndex, setCurrentQuestionIndex, isLoading]
  );

  useEffect(() => {
    const groupIndex = Math.floor(currentQuestionIndex / questionsPerGroup);
    if (groupIndex !== questionGroup) {
      setQuestionGroup(groupIndex);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: groupIndex * scrollContainerRef.current.offsetHeight,
          behavior: "smooth",
        });
      }
    }
  }, [currentQuestionIndex, questionGroup, questionsPerGroup]);

  if (isLoading) {
    return <QuestionNavigationSkeleton />;
  }

  return (
    <Card className="mb-4 border border-gray-100 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="flex justify-start">
        <div
          ref={scrollContainerRef}
          className="grid max-h-[272px] w-fit grid-cols-5 place-items-center gap-1.5 overflow-y-auto p-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 dark:scrollbar-track-gray-700 dark:scrollbar-thumb-gray-500"
        >
          {questionButtons}
        </div>
      </div>
    </Card>
  );
};