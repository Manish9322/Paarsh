"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

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
 
export const Instructions: React.FC<InstructionsProps> = ({ testDetails, onStartTest, isLoading }) => (
  <section className="dark:via-gray-850 bg-gradient-to-b from-white via-gray-50 to-white py-24 dark:from-gray-800 dark:to-gray-800">
    <div className="container mx-auto max-w-4xl px-4">
      <div className="text-center">
        <span className="mb-4 inline-block rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
          Aptitude Test
        </span>
        <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white lg:text-5xl">
          {testDetails.name}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
          Conducted by {testDetails.college}
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="relative overflow-hidden rounded border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Instructions
            </h2>
            <ul className="list-inside list-disc text-gray-600 dark:text-gray-300">
              {testDetails.instructions.map((instruction, index) => (
                <li key={index} className="mb-2">
                  {instruction}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="relative overflow-hidden rounded border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Test Details
            </h2>
            <p className="mb-2 text-gray-600 dark:text-gray-300">
              <strong>Duration:</strong> {testDetails.duration} minutes
            </p>
            <p className="mb-2 text-gray-600 dark:text-gray-300">
              <strong>Total Questions:</strong> {testDetails.totalQuestions}
            </p>
            <h3 className="mb-2 mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Rules
            </h3>
            <ul className="list-inside list-disc text-gray-600 dark:text-gray-300">
              {testDetails.rules.map((rule, index) => (
                <li key={index} className="mb-2">
                  {rule}
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="mt-8">
          <Button
            onClick={onStartTest}
            disabled={isLoading}
            className="group relative inline-flex items-center gap-2 rounded bg-blue-600 px-8 py-4 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <span className="flex items-center gap-2">
              Start Test
              <ArrowRight className="h-4 w-4" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

