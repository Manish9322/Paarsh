"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { BookOpen, ChevronRight, Clock, Tag, CheckCircle, XCircle, ArrowLeft, Trophy, Target, Zap, Star, AlertTriangleIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFetchPracticeTestByIdQuery, useAddUserPracticeAttemptMutation } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface PracticeTest {
  _id: string;
  testName: string;
  skill: string;
  level: "Easy" | "Intermediate" | "Difficult";
  questionCount: number;
  duration: string;
  questions: {
    _id: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
  }[];
}

interface Answer {
  questionIndex: number;
  selectedOption: string;
}

const PracticeTest = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [view, setView] = useState<"pre-test" | "test" | "results">("pre-test");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quitConfirmOpen, setQuitConfirmOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const { data: testData, isLoading, error } = useFetchPracticeTestByIdQuery(id as string);
  const test: PracticeTest | undefined = testData?.data;
  const [addUserPracticeAttempt] = useAddUserPracticeAttemptMutation();

  useEffect(() => {
    console.log("Test data:", test);
    if (test?.duration) {
      const match = test.duration.match(/(\d+)\s*minutes?/i);
      if (match) {
        const seconds = parseInt(match[1]) * 60;
        console.log("Setting timeRemaining to:", seconds);
        setTimeRemaining(seconds);
      } else {
        console.error("Invalid duration format:", test.duration);
      }
    }
  }, [test]);

  useEffect(() => {
    if (view === "test" && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          console.log("Time remaining:", prev);
          if (prev <= 1) {
            clearInterval(timer);
            console.log("Timer expired, calling handleSubmit");
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [view, timeRemaining]);

  const handleAnswer = (option: string) => {
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionIndex === currentQuestionIndex);
      if (existing) {
        return prev.map((a) =>
          a.questionIndex === currentQuestionIndex ? { ...a, selectedOption: option } : a
        );
      }
      return [...prev, { questionIndex: currentQuestionIndex, selectedOption: option }];
    });
  };

  const handleNext = () => {
    if (!test) {
      console.error("Test data is undefined");
      return;
    }
    if (currentQuestionIndex < test.questions.length - 1) {
      console.log("Current Index:", currentQuestionIndex, "Total Questions:", test.questions.length);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    console.log("Submitting test with answers:", answers);
    if (!test) {
      console.error("Test data is undefined in handleSubmit");
      toast.error("Cannot submit test: Invalid test data", { position: "bottom-right", });
      return;
    }
    const correctAnswers = answers.reduce((acc, answer) => {
      const question = test.questions[answer.questionIndex];
      return acc + (answer.selectedOption === question.correctAnswer ? 1 : 0);
    }, 0);
    setScore(correctAnswers);

    const formattedAnswers = answers.map((answer) => ({
      questionId: test.questions[answer.questionIndex]._id,
      selectedAnswer: answer.selectedOption,
    }));

    try {
      const response = await addUserPracticeAttempt({
        practiceTestId: test._id,
        answers: formattedAnswers,
      }).unwrap();
      if (response.success) {
        toast.success("Test attempt recorded successfully!", {
          position: "bottom-right",});
      } else {
        toast.error("Failed to record test attempt.", {
          position: "bottom-right",});
      }
    } catch (error) {
      console.error("Error recording practice attempt:", error);
      toast.error("Error recording test attempt.", {
        position: "bottom-right",});
    }

    setView("results");
  };

  const handleBackClick = () => {
    if (view === "test") {
      setQuitConfirmOpen(true);
      dialogRef.current?.showModal();
    } else {
      router.push("/question-bank");
    }
  };

  const handleQuitTest = () => {
    setQuitConfirmOpen(false);
    dialogRef.current?.close();
    router.push("/question-bank");
  };

  const handleCancelQuit = () => {
    setQuitConfirmOpen(false);
    dialogRef.current?.close();
  };

  const handleRetry = () => {
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeRemaining(test?.duration ? parseInt(test.duration.match(/(\d+)/)![1]) * 60 : 0);
    setView("pre-test");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const container = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const stagger = {
    show: { transition: { staggerChildren: 0.1 } },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const getDifficultyInfo = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return {
          color: "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200 dark:from-emerald-900/30 dark:to-green-900/30 dark:text-emerald-300 dark:border-emerald-700",
          icon: <Zap size={14} className="mr-1" />,
        };
      case "Intermediate":
        return {
          color: "bg-gradient-to-r from-blue-100 to-yellow-100 text-blue-700 border-blue-200 dark:from-blue-900/30 dark:to-yellow-900/30 dark:text-blue-300 dark:border-blue-700",
          icon: <Target size={14} className="mr-1" />,
        };
      case "Difficult":
        return {
          color: "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-300 dark:border-red-700",
          icon: <Star size={14} className="mr-1" />,
        };
      default:
        return {
          color: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200 dark:from-gray-700 dark:to-slate-700 dark:text-gray-300 dark:border-gray-600",
          icon: <BookOpen size={14} className="mr-1" />,
        };
    }
  };

  const getScoreInfo = (percentage: number) => {
    if (percentage >= 0.9) {
      return {
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
        message: "Outstanding! You've mastered this topic! 🎉",
        icon: <Trophy className="text-emerald-500" size={24} />,
      };
    } else if (percentage >= 0.7) {
      return {
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20",
        message: "Great job! You're doing well! 👏",
        icon: <CheckCircle className="text-blue-500" size={24} />,
      };
    } else if (percentage >= 0.5) {
      return {
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-gradient-to-r from-blue-50 to-yellow-50 dark:from-blue-900/20 dark:to-yellow-900/20",
        message: "Good effort! Keep practicing to improve! 💪",
        icon: <Target className="text-blue-500" size={24} />,
      };
    } else {
      return {
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
        message: "Don't give up! Practice makes perfect! 🌟",
        icon: <Zap className="text-red-500" size={24} />,
      };
    }
  };

  if (isLoading) {
    console.log("Loading test data...");
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-blue-900/20">
        <div className="container mx-auto p-4 space-y-6">
          <div className="animate-pulse space-y-4">
            <Skeleton className="h-10 w-64 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="space-y-4">
                <Skeleton className="h-8 w-48 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-20 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
                  <Skeleton className="h-6 w-24 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
                  <Skeleton className="h-6 w-28 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full rounded bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
                <Skeleton className="h-4 w-3/4 rounded bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
                <Skeleton className="h-12 w-32 rounded-md bg-gradient-to-r from-blue-200 to-blue-200 dark:from-blue-700 dark:to-blue-700" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !test || !test.questions || test.questions.length === 0) {
    console.log("Error:", error, "Test:", test);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 dark:from-gray-900 dark:via-red-900/20 dark:to-rose-900/20">
        <div className="container mx-auto p-4 flex flex-col items-center justify-center py-20">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 p-6 rounded-full mb-6 shadow-lg"
          >
            <BookOpen className="h-16 w-16 text-red-500" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-3"
          >
            Test Not Found
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 dark:text-gray-400 text-lg text-center mb-8"
          >
            The requested practice test could not be loaded.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={() => router.push("/question-bank")}
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-600 hover:from-blue-600 hover:via-blue-700 hover:to-blue-700 text-white px-8 py-3 rounded-md shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Back to Test Bank
              <ChevronRight size={20} className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const isLoggedIn =
    typeof window !== "undefined" &&
    (localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"));

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-blue-900/20">
        <div className="container mx-auto p-4 flex flex-col items-center justify-center py-20">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-gradient-to-br from-blue-100 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/30 p-6 rounded-full mb-6 shadow-lg"
          >
            <BookOpen className="h-16 w-16 text-blue-500" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent mb-3"
          >
            Please Log In
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 dark:text-gray-400 text-lg text-center mb-8"
          >
            You need to log in to take this test.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={() => router.push("/login")}
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-600 hover:from-blue-600 hover:via-blue-700 hover:to-blue-700 text-white px-8 py-3 rounded-md shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Go to Login
              <ChevronRight size={20} className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const difficultyInfo = getDifficultyInfo(test.level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-blue-900/20">
      <div className="container mx-auto p-4 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600 bg-clip-text text-transparent mb-2">
              {test.testName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Challenge yourself and track your progress</p>
          </div>
          <Button
            variant="ghost"
            onClick={handleBackClick}
            className="text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 border-black/10 backdrop-blur-sm rounded-md px-4 py-2 transition-all duration-300"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Test Bank
          </Button>
        </motion.div>

        <AnimatePresence mode="wait">
          {view === "pre-test" && (
            <motion.div
              key="pre-test"
              variants={container}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 p-6 text-white">
                  <CardTitle className="text-2xl font-bold flex items-center">
                    <BookOpen className="mr-3" size={28} />
                    Test Overview
                  </CardTitle>
                  <p className="mt-2 opacity-90">Get ready to showcase your knowledge!</p>
                </div>
                <CardContent className="p-8 space-y-8">
                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  >
                    <motion.div variants={fadeInUp} className="bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 p-4 rounded border border-blue-100 dark:border-blue-800">
                      <div className="flex items-center text-blue-600 dark:text-blue-400 mb-2">
                        <Tag size={18} className="mr-2" />
                        <span className="font-medium">Subject</span>
                      </div>
                      <p className="text-gray-800 dark:text-white font-semibold">{test.skill}</p>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 p-4 rounded border border-blue-100 dark:border-blue-800">
                      <div className="flex items-center text-blue-600 dark:text-blue-400 mb-2">
                        {difficultyInfo.icon}
                        <span className="font-medium">Level</span>
                      </div>
                      <Badge className={`${difficultyInfo.color} border px-3 py-1 font-medium`}>
                        {test.level}
                      </Badge>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="bg-gradient-to-br from-blue-50 to-blue-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded border border-emerald-100 dark:border-blue-800">
                      <div className="flex items-center text-blue-600 dark:text-blue-400 mb-2">
                        <BookOpen size={18} className="mr-2" />
                        <span className="font-medium">Questions</span>
                      </div>
                      <p className="text-gray-800 dark:text-white font-semibold">{test.questionCount}</p>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 p-4 rounded border border-blue-100 dark:border-blue-800">
                      <div className="flex items-center text-blue-600 dark:text-blue-400 mb-2">
                        <Clock size={18} className="mr-2" />
                        <span className="font-medium">Duration</span>
                      </div>
                      <p className="text-gray-800 dark:text-white font-semibold">{test.duration}</p>
                    </motion.div>
                  </motion.div>
                  <motion.div
                    variants={fadeInUp}
                    className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 p-6 rounded-md border border-gray-100 dark:border-gray-700"
                  >
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                      <Target className="mr-2 text-blue-500" size={24} />
                      Test Guidelines
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full mr-3 mt-0.5">
                            <Clock size={12} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">Complete within {test.duration}</span>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full mr-3 mt-0.5">
                            <CheckCircle size={12} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">Answer all questions carefully</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="bg-blue-100 dark:bg-red-900/30 p-1 rounded-full mr-3 mt-0.5">
                            <XCircle size={12} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">No external resources allowed</span>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full mr-3 mt-0.5">
                            <Star size={12} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">Submit when finished</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div variants={fadeInUp} className="text-center">
                    <Button
                      onClick={() => setView("test")}
                      className="bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 hover:from-blue-600 hover:via-blue-600 hover:to-blue-600 text-white px-12 py-6 rounded-md text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      Start Your Test
                      <ChevronRight size={26} className="ml-1 font-bold" />
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {view === "test" && (
            <motion.div
              key="test"
              variants={container}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl rounded-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl font-bold">
                        Question {currentQuestionIndex + 1} of {test.questions.length}
                      </CardTitle>
                      <p className="opacity-90 mt-1">Stay focused and trust your knowledge</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-md px-4 py-2">
                      <div className="flex items-center text-white">
                        <Clock size={18} className="mr-2" />
                        <span className="text-lg font-mono font-bold">
                          {formatTime(timeRemaining)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Progress
                    value={(currentQuestionIndex + 1) / test.questions.length * 100}
                    className="mt-4 h-2 bg-white/20"
                  />
                </div>
                <CardContent className="p-8 space-y-8">
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 p-6 rounded-md border border-blue-100 dark:border-blue-800 mb-4">
                      <p className="text-gray-800 dark:text-white text-xl leading-relaxed">
                        {test.questions[currentQuestionIndex].questionText}
                      </p>
                    </div>
                    <div className="space-y-4">
                      {test.questions[currentQuestionIndex].options.map((option, index) => {
                        const isSelected = answers.find((a) => a.questionIndex === currentQuestionIndex)?.selectedOption === option;
                        return (
                          <motion.label
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center p-4 rounded-md cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${isSelected
                                ? "bg-gradient-to-r from-blue-100 to-blue-100 dark:from-blue-900/40 dark:to-blue-900/40 border-2 border-blue-400 dark:border-blue-500 shadow-lg"
                                : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                              }`}
                          >
                            <input
                              type="radio"
                              name={`question-${currentQuestionIndex}`}
                              value={option}
                              checked={isSelected}
                              onChange={() => handleAnswer(option)}
                              className="mr-4 w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-800 dark:text-white text-lg flex-1">{option}</span>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-blue-500 text-white rounded-full p-1"
                              >
                                <CheckCircle size={16} />
                              </motion.div>
                            )}
                          </motion.label>
                        );
                      })}
                    </div>
                  </motion.div>
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                      variant="outline"
                      className="px-6 py-6 rounded-md border-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Progress :</span>
                      <span className="font-semibold">{answers.length} / {test.questions.length} answered</span>
                    </div>
                    <div className="space-x-3">
                      {currentQuestionIndex < test.questions.length - 1 ? (
                        <Button
                          onClick={handleNext}
                          className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white px-8 py-6 rounded-md shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          Next Question
                          <ChevronRight size={18} className="ml-2" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            console.log("Submit Test button clicked");
                            handleSubmit();
                          }}
                          className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-8 py-6 rounded-md shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          Submit Test
                          <CheckCircle size={18} className="ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {view === "results" && (
            <motion.div
              key="results"
              variants={container}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20 }}
            >
              {(() => {
                const percentage = score / test.questions.length;
                const scoreInfo = getScoreInfo(percentage);
                return (
                  <div className="space-y-8">
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl rounded-md overflow-hidden">
                      <div className={`${scoreInfo.bgColor} p-8 text-center border-b border-gray-100 dark:border-gray-700`}>
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="flex justify-center mb-4"
                        >
                          {scoreInfo.icon}
                        </motion.div>
                        <motion.h2
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-4xl font-bold mb-2"
                        >
                          <span className={scoreInfo.color}>{score}</span>
                          <span className="text-gray-600 dark:text-gray-400">/{test.questions.length}</span>
                        </motion.h2>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-2xl font-semibold mb-2"
                        >
                          <span className={scoreInfo.color}>{Math.round(percentage * 100)}%</span>
                        </motion.div>
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="text-lg text-gray-700 dark:text-gray-300"
                        >
                          {scoreInfo.message}
                        </motion.p>
                      </div>
                      <CardContent className="p-8">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                          <BookOpen className="mr-3 text-blue-500" size={28} />
                          Detailed Review
                        </h3>
                        <motion.div
                          variants={stagger}
                          initial="hidden"
                          animate="show"
                          className="space-y-4"
                        >
                          {test.questions.map((question, index) => {
                            const userAnswer = answers.find((a) => a.questionIndex === index)?.selectedOption;
                            const isCorrect = userAnswer === question.correctAnswer;
                            const isAnswered = userAnswer !== undefined;
                            return (
                              <motion.div key={index} variants={fadeInUp}>
                                <Card
                                  className={`border-l-4 transition-all duration-300 hover:shadow-lg ${isCorrect
                                      ? "border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20"
                                      : isAnswered
                                        ? "border-l-red-500 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20"
                                        : "border-l-gray-400 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800"
                                    }`}
                                >
                                  <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex-1">
                                        <div className="flex items-center mb-3">
                                          <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-1 rounded-full text-sm font-semibold mr-3">
                                            Q{index + 1}
                                          </span>
                                          {isCorrect ? (
                                            <CheckCircle className="text-emerald-500" size={24} />
                                          ) : isAnswered ? (
                                            <XCircle className="text-red-500" size={24} />
                                          ) : (
                                            <div className="w-6 h-6 rounded-full border-2 border-gray-400"></div>
                                          )}
                                        </div>
                                        <p className="text-gray-800 dark:text-white text-lg font-medium mb-4">
                                          {question.questionText}
                                        </p>
                                        <div className="space-y-2">
                                          <div className="flex items-start">
                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mr-2 mt-1">
                                              Your Answer:
                                            </span>
                                            <span
                                              className={`px-3 py-1 rounded-lg text-sm font-medium ${isAnswered
                                                  ? isCorrect
                                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                                }`}
                                            >
                                              {userAnswer || "Not answered"}
                                            </span>
                                          </div>
                                          {!isCorrect && (
                                            <div className="flex items-start">
                                              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mr-2 mt-1">
                                                Correct Answer:
                                              </span>
                                              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 px-3 py-1 rounded-lg text-sm font-medium">
                                                {question.correctAnswer}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                        <motion.div
                          variants={fadeInUp}
                          className="flex justify-center space-x-6 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
                        >
                          <Button
                            onClick={handleRetry}
                            variant="outline"
                            className="border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white px-8 py-6 rounded-md font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                          >
                            <Target className="mr-2" size={20} />
                            Try Again
                          </Button>
                          <Button
                            onClick={() => router.push("/question-bank")}
                            className="bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 hover:from-blue-600 hover:via-blue-600 hover:to-blue-600 text-white px-8 py-6 rounded-md font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                          >
                            Explore More Tests
                            <ChevronRight size={20} className="ml-2" />
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
        <dialog
          ref={dialogRef}
          className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-2xl rounded-md p-6 w-full max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-center">
              <AlertTriangleIcon className="text-amber-500 mr-3" size={24} />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Confirm Quit Test
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              Are you sure you want to quit this test? All your progress will be lost and you will need to restart from the beginning if you want to take this test again.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={handleCancelQuit}
                className="border-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleQuitTest}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Quit Test
              </Button>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default PracticeTest;