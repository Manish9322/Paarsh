"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Clock, Brain, AlertTriangle, CheckCircle2, XCircle, MousePointer2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Define the TestDetails interface to type the testDetails prop
interface TestDetails {
  name: string;
  college: string;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  allowRetake: boolean;
  instructions: string[];
  rules: string[];
}

// Define the props interface for the Instructions component
interface InstructionsProps {
  testDetails: TestDetails;
  onStartTest: () => void;
  isLoading: boolean;
}

const InstructionsSkeleton = () => (
  <div className="container mx-auto max-w-5xl px-4 sm:px-6">
    <div className="text-center">
      <Skeleton className="mx-auto mb-3 h-6 sm:h-8 w-24 sm:w-32" />
      <Skeleton className="mx-auto mb-4 h-8 sm:h-12 w-2/3 sm:w-3/4" />
      <Skeleton className="mx-auto mb-4 sm:mb-6 h-4 sm:h-6 w-1/2" />
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="p-4 sm:p-6">
          <Skeleton className="mb-3 sm:mb-4 h-6 sm:h-8 w-32 sm:w-40" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-3 sm:h-4 w-full" />
            ))}
          </div>
        </Card>
        <Card className="p-4 sm:p-6">
          <Skeleton className="mb-3 sm:mb-4 h-6 sm:h-8 w-32 sm:w-40" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-3 sm:h-4 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  </div>
);

export const Instructions: React.FC<InstructionsProps> = ({ testDetails, onStartTest, isLoading }) => {
  if (isLoading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800 py-4 sm:py-8">
        <InstructionsSkeleton />
      </section>
    );
  }

  const defaultInstructions = [
    "Read each question carefully before answering",
    "Use pen and paper for calculations if needed",
    "Answer all questions - no negative marking",
    "Keep track of time for each section",
    "No modifications after submission"
  ];

  const defaultRules = [
    "No tab switching - auto-submits test",
    "No external help or materials allowed",
    "Webcam must stay active",
    "3 warnings before timeout",
    "Multiple logins blocked"
  ];

  const instructions = testDetails.instructions.length > 0 ? testDetails.instructions : defaultInstructions;
  const rules = testDetails.rules.length > 0 ? testDetails.rules : defaultRules;

  return (
    <section className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800 py-4 sm:py-8">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center">
            <span className="mb-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              Test Instructions
            </span>
            <h1 className="mb-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              {testDetails.name}
            </h1>
            <p className="mx-auto mb-4 sm:mb-6 max-w-2xl text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Conducted by <span className="font-semibold">{testDetails.college}</span>
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <Card className="relative overflow-hidden bg-white p-4 sm:p-6 shadow-lg dark:bg-gray-800">
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-blue-500/10" />
              <div className="relative">
                <h2 className="mb-3 sm:mb-4 flex items-center text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  <Brain className="mr-2 h-5 w-5 text-blue-500" />
                  Test Overview
                </h2>
                <div className="mb-3 sm:mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span><strong>{testDetails.duration}m</strong> Duration</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <span><strong>{testDetails.totalQuestions}</strong> Questions</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <MousePointer2 className="h-4 w-4 text-blue-500" />
                    <span>MCQ Format</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <XCircle className="h-4 w-4 text-blue-500" />
                    <span>{testDetails.allowRetake ? "Retake OK" : "No Retake"}</span>
                  </div>
                </div>

                <h3 className="mb-2 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  Instructions
                </h3>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  {instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card className="relative overflow-hidden bg-white p-4 sm:p-6 shadow-lg dark:bg-gray-800">
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-red-500/10" />
              <div className="relative">
                <h2 className="mb-3 sm:mb-4 flex items-center text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                  Important Rules
                </h2>
                <ul className="mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  {rules.map((rule, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>

                <div className="rounded bg-red-50 p-2 sm:p-3 text-xs font-medium text-red-800 dark:bg-red-900/20 dark:text-red-300">
                  <strong>Note:</strong> Rule violations may result in immediate disqualification
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <Button
              onClick={onStartTest}
              disabled={isLoading}
              className="group inline-flex items-center gap-2 rounded bg-blue-600 px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg dark:bg-blue-500 dark:hover:bg-blue-600 w-full sm:w-auto"
            >
              <span className="flex items-center gap-1">
                Begin Test
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

