"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSaveAnswerMutation, useSubmitTestMutation } from "@/services/api";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";

interface Question {
  _id: string;
  text: string;
  options: string[];
  selectedAnswer: number;
  timeSpent: number;
}

interface TestProps {
  questions: Question[];
  sessionId: string;
  timeRemaining: number | null;
  onSubmitTest: (result: { score: number; percentage: number; totalQuestions: number }) => void;
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}

export const Test: React.FC<TestProps> = ({
  questions,
  sessionId,
  timeRemaining,
  onSubmitTest,
  setQuestions,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [saveAnswer, { isLoading: isSavingAnswer }] = useSaveAnswerMutation();
  const [submitTest, { isLoading: isSubmittingTest }] = useSubmitTestMutation();

  const handleAnswerChange = useCallback(
    async (questionId: string, selectedAnswer: number) => {
      try {
        await saveAnswer({
          sessionId,
          questionId,
          selectedAnswer,
          timeSpent: questions[currentQuestionIndex].timeSpent,
        }).unwrap();
        setQuestions((prev) =>
          prev.map((q) =>
            q._id === questionId ? { ...q, selectedAnswer } : q
          )
        );
      } catch (err: any) {
        toast.error(err?.data?.error || "Failed to save answer");
      }
    },
    [sessionId, questions, currentQuestionIndex, saveAnswer, setQuestions]
  );

  const handleSubmitTest = useCallback(async () => {
    if (!sessionId) {
      toast.error("Session ID is missing");
      return;
    }
    try {
      // Collect answers from questions state
      const answers = questions.map((q) => ({
        questionId: q._id,
        selectedAnswer: q.selectedAnswer,
      }));
      console.log("Submitting answers:", answers); // Debug log
      const response = await submitTest({ sessionId, answers }).unwrap();
      onSubmitTest(response.data);
      toast.success("Test submitted successfully");
    } catch (err: any) {
      console.error("Submit test error:", err);
      toast.error(err?.data?.error || "Failed to submit test");
    }
  }, [sessionId, questions, submitTest, onSubmitTest]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
        <p>Time Remaining: {timeRemaining !== null ? formatTime(timeRemaining) : "Loading..."}</p>
      </div>
      {questions.length > 0 && (
        <div>
          <h3 className="text-lg font-medium">{questions[currentQuestionIndex].text}</h3>
          <RadioGroup
            value={questions[currentQuestionIndex].selectedAnswer.toString()}
            onValueChange={(value) =>
              handleAnswerChange(questions[currentQuestionIndex]._id, parseInt(value))
            }
          >
            {questions[currentQuestionIndex].options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}
      <div className="flex justify-between">
        <Button
          onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentQuestionIndex === 0 || isSavingAnswer}
        >
          Previous
        </Button>
        <Button
          onClick={() =>
            setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1))
          }
          disabled={currentQuestionIndex === questions.length - 1 || isSavingAnswer}
        >
          Next
        </Button>
        <Button
          onClick={handleSubmitTest}
          disabled={isSubmittingTest || isSavingAnswer}
        >
          Submit Test
        </Button>
      </div>
    </div>
  );
};