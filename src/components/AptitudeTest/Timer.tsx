"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const { formattedTime, timeStatus } = useMemo(() => {
    if (timeLeft === null) return { formattedTime: "--:--", timeStatus: "normal" };
    
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    
    let timeStatus: "normal" | "warning" | "critical" = "normal";
    if (timeLeft <= 300) { // 5 minutes
      timeStatus = "critical";
    } else if (timeLeft <= 600) { // 10 minutes
      timeStatus = "warning";
    }

    const formattedTime = hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return { formattedTime, timeStatus };
  }, [timeLeft]);

  if (timeLeft === null) return null;

  return (
    <Card className={cn(
      "mb-4 border border-gray-100 bg-white p-3 shadow-lg transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800 sm:p-4",
      {
        "border-yellow-300 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/30": timeStatus === "warning",
        "animate-pulse border-red-500 bg-red-50 dark:border-red-600 dark:bg-red-900/30": timeStatus === "critical"
      }
    )}>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {timeStatus === "critical" ? (
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
        ) : (
          <Clock className={cn(
            "h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6",
            {
              "text-blue-600 dark:text-blue-400": timeStatus === "normal",
              "text-yellow-600 dark:text-yellow-400": timeStatus === "warning"
            }
          )} />
        )}
        <div className={cn(
          "text-sm font-semibold sm:text-base lg:text-lg",
          {
            "text-gray-900 dark:text-white": timeStatus === "normal",
            "text-yellow-700 dark:text-yellow-300": timeStatus === "warning",
            "text-red-700 dark:text-red-300": timeStatus === "critical"
          }
        )}>
          <span className="hidden sm:inline">Time Left: </span>{formattedTime}
        </div>
      </div>
    </Card>
  );
};