"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface TimerProps {
  duration: number | null; // Duration in seconds
  onTimeUp: () => void;
}

export const Timer: React.FC<TimerProps> = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  if (timeLeft === null) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Card className="mb-4 border border-gray-100 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          Time Left: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
      </div>
    </Card>
  );
};