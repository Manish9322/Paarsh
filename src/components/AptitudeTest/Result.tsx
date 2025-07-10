"use client";

import { Card } from "@/components/ui/card";

interface ResultProps {
  result: { score: number; percentage: number; totalQuestions: number };
  testDetails: { name: string; college: string; passingScore: number };
}

export const Result: React.FC<ResultProps> = ({ result, testDetails }) => (
  <section className="dark:via-gray-850 flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-gray-50 to-white py-24 dark:from-gray-800 dark:to-gray-800">
    <Card className="w-full max-w-lg border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="text-center">
        <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
          Test Results
        </h2>
        <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
          <strong>Test:</strong> {testDetails.name}
        </p>
        <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
          <strong>Conducted by:</strong> {testDetails.college}
        </p>
        <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
          <strong>Score:</strong> {result.score} / {result.totalQuestions}
        </p>
        <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
          <strong>Percentage:</strong> {result.percentage.toFixed(2)}%
        </p>
        <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
          <strong>Status:</strong> {result.percentage >= testDetails.passingScore ? "Passed" : "Failed"}
        </p>
      </div>
    </Card>
  </section>
);