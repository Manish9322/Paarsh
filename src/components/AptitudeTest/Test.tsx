"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSubmitTestMutation } from "@/services/api";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Flag, Save } from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";
import { Skeleton } from "@/components/ui/skeleton";

interface Question {
  _id: string;
  question: {
    _id: string;
    question: string;
    options: Array<{
      text: string;
      isCorrect: boolean;
    }>;
    category: string;
    explanation?: string;
  };
  selectedAnswer: number;
  timeSpent: number;
}

interface TestProps {
  questions: Question[];
  sessionId: string;
  timeRemaining: number | null;
  onSubmitTest: (result: { score: number; percentage: number; totalQuestions: number }) => void;
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  onMarkForReview: (questionId: string) => void;
  markedQuestions: { [key: string]: boolean };
}

const QuestionSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-3/4" />
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  </div>
);

export const Test: React.FC<TestProps> = ({
  questions,
  sessionId,
  timeRemaining,
  onSubmitTest,
  setQuestions,
  onMarkForReview,
  markedQuestions,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitTest, { isLoading: isSubmittingTest }] = useSubmitTestMutation();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state for smoother transition
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  console.log("Questions data:", questions);

  const handleAnswerChange = useCallback(
    (questionId: string, selectedAnswer: number) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === questionId ? { ...q, selectedAnswer, timeSpent: q.timeSpent + 1 } : q
        )
      );
    },
    [setQuestions]
  );

  const handleSubmitTest = useCallback(async () => {
    if (!sessionId) {
      toast.error("Session ID is missing");
      return;
    }

    // Check if all questions are attempted
    const unansweredQuestions = questions.filter(q => q.selectedAnswer === -1).length;
    if (unansweredQuestions > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredQuestions} unanswered questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) {
        return;
      }
    }

    try {
      const answers = questions.map((q) => ({
        questionId: q._id,
        selectedAnswer: q.selectedAnswer,
        timeSpent: q.timeSpent
      }));

      const response = await submitTest({ sessionId, answers }).unwrap();
      onSubmitTest(response);
      toast.success("Test submitted successfully");
    } catch (err: any) {
      console.error("Submit test error:", err);
      toast.error(err?.data?.error || "Failed to submit test");
    }
  }, [sessionId, questions, submitTest, onSubmitTest]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentQuestionIndex > 0) {
        setCurrentQuestionIndex((prev) => prev - 1);
      } else if (e.key === "ArrowRight" && currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else if (e.key >= "1" && e.key <= "4") {
        const answerIndex = parseInt(e.key) - 1;
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion) {
          handleAnswerChange(currentQuestion._id, answerIndex);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentQuestionIndex, questions, handleAnswerChange]);

  const currentQuestion = questions[currentQuestionIndex];
  const isMarked = currentQuestion && markedQuestions[currentQuestion._id];

  if (isLoading || !currentQuestion) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <QuestionSkeleton />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            {isMarked && (
              <span className="rounded bg-red-100 px-2 py-1 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                Marked for Review
              </span>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => currentQuestion && onMarkForReview(currentQuestion._id)}
            className={`flex items-center gap-2 ${
              isMarked
                ? "border-red-500 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/30"
                : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            <Flag className="h-4 w-4" />
            {isMarked ? "Unmark" : "Mark for Review"}
          </Button>
        </div>

        <div className="mb-8">
          <p className="text-lg text-gray-800 dark:text-gray-200">
            {currentQuestion.question.question}
          </p>
        </div>
        <RadioGroup
          value={currentQuestion.selectedAnswer.toString()}
          onValueChange={(value) =>
            handleAnswerChange(currentQuestion._id, parseInt(value))
          }
          className="space-y-4"
        >
          {currentQuestion.question.options.map((option, index) => (
            <div
              key={index}
              className={`flex cursor-pointer items-center rounded border p-4 transition-colors ${
                currentQuestion.selectedAnswer === index
                  ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30"
                  : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              }`}
            >
              <RadioGroupItem
                value={index.toString()}
                id={`option-${index}`}
                className="mr-3"
              />
              <Label
                htmlFor={`option-${index}`}
                className="flex-1 cursor-pointer text-gray-700 dark:text-gray-300"
              >
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
            disabled={isSubmittingTest}
          >
            <Save className="h-4 w-4" />
            Submit Test
          </Button>
        </div>

        <Button
          onClick={() =>
            setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1))
          }
          disabled={currentQuestionIndex === questions.length - 1}
          className="flex items-center gap-2"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <ConfirmationModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleSubmitTest}
        type="submit"
      />
    </div>
  );
};