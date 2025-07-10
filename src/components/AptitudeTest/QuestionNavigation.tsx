"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "../ui/card";

interface QuestionNavigationProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  questionStatus: { [key: string]: { answered: boolean; marked: boolean } };
}

export const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  totalQuestions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  questionStatus,
}) => {
  const [questionGroup, setQuestionGroup] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const questionsPerGroup = 25;
  const totalGroups = Math.ceil(totalQuestions / questionsPerGroup);

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
  }, [currentQuestionIndex, questionGroup]);

  return (
    <Card className="mb-4 border border-gray-100 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div>
        <div
          ref={scrollContainerRef}
          className="flex h-[272px] flex-wrap gap-2 overflow-y-auto"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
            .split-color {
              background: linear-gradient(to bottom, #22c55e 50%, #ef4444 50%);
            }
          `}</style>
          {Array.from({ length: totalQuestions }, (_, index) => {
            const questionNumber = index + 1;
            return (
              <button
                key={questionNumber}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`flex h-8 w-8 items-center justify-center rounded-full p-2 text-sm font-semibold
                  ${
                    currentQuestionIndex === index
                      ? "bg-blue-600 text-white"
                      : questionStatus[questionNumber]?.answered &&
                        questionStatus[questionNumber]?.marked
                      ? "split-color text-white"
                      : questionStatus[questionNumber]?.answered
                      ? "bg-green-500 text-white"
                      : questionStatus[questionNumber]?.marked
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white"
                  }`}
              >
                {questionNumber}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};