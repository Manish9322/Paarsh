"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface ResultProps {
  testDetails: { name: string; college: string };
  onRedirect: () => void;
}

export const Result: React.FC<ResultProps> = ({ testDetails, onRedirect }) => {
  useEffect(() => {
    // Exit fullscreen mode when Result component mounts
    const exitFullscreen = async () => {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
      }
    };
    
    exitFullscreen();

    // Set up auto-redirect after 1 minute
    const timeoutId = setTimeout(() => {
      onRedirect();
    }, 60000); // 60 seconds = 1 minute

    // Set up key press listener
    const handleKeyPress = () => {
      onRedirect();
    };
    window.addEventListener('keypress', handleKeyPress);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [onRedirect]);

  return (
    <section className="dark:via-gray-850 flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-gray-50 to-white py-24 dark:from-gray-800 dark:to-gray-800">
      <Card className="w-full max-w-lg border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
            Thank You!
          </h2>
          <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
            Your {testDetails.name} has been submitted successfully.
          </p>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-300">
            Paarsh Infotech will evaluate your test and inform you about the results soon.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You may close this window now or press any key to return to the login page.
          </p>
          <p className="mt-4 text-xs text-gray-400">
            You will be automatically redirected in 1 minute.
          </p>
        </div>
      </Card>
    </section>
  );
};