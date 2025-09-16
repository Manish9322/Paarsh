"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AuthView } from "@/components/AptitudeTest/AuthView";
import { LoginForm } from "@/components/AptitudeTest/LoginForm";
import { RegisterForm } from "@/components/AptitudeTest/RegisterForm";
import { SuccessModal } from "@/components/AptitudeTest/SuccessModal";
import { Instructions } from "@/components/AptitudeTest/Instructions";
import { TestHeader } from "@/components/AptitudeTest/TestHeader";
import { Timer } from "@/components/AptitudeTest/Timer";
import { QuestionNavigation } from "@/components/AptitudeTest/QuestionNavigation";
import { QuestionMeta } from "@/components/AptitudeTest/QuestionMeta";
import { Test } from "@/components/AptitudeTest/Test";
import {
  useCreateTestSessionMutation,
  useGetTestInstructionQuery,
  useStartTestSessionMutation,
  useSaveAnswerMutation,
  useSubmitTestMutation,
} from "@/services/api";
import { Button } from "@/components/ui/button";
import { Result } from "@/components/AptitudeTest/Result";

// Define interfaces for TypeScript
interface Question {
  _id: string;
  question: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswer: string;
  category: string;
  explanation?: string;
  selectedAnswer: number;
  timeSpent: number;
}

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

interface TestInfo {
  session: {
    sessionId: string;
    startTime: string;
    duration: number;
    status: string;
  };
  testDetails: TestDetails;
  questions?: Question[];
  hasExpiry: boolean;
  startTime: string;
  endTime: string;
}

interface ResultData {
  score: number;
  percentage: number;
  totalQuestions: number;
}

// Add TestSecurityWrapper component at the top level
const TestSecurityWrapper: React.FC<{ children: React.ReactNode; onSubmit: () => void }> = ({
  children,
  onSubmit,
}) => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const violations = parseInt(localStorage.getItem("violations") || "0") + 1;
        localStorage.setItem("violations", violations.toString());

        if (violations >= 10) {
          onSubmit();
        } else {
          toast.error(`Warning: Tab switching detected! (${violations}/10)`);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "v" || e.key === "p")) {
        e.preventDefault();
        toast.error("Keyboard shortcuts are disabled during the test");
      }
    };

    const setupFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        toast.error("Fullscreen mode is required for this test");
      }
    };
    setupFullscreen();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onSubmit]);

  return <>{children}</>;
};

const AptitudePage: React.FC = () => {
  const searchParams = useSearchParams();
  const testId = searchParams?.get("testId") ?? null;
  const collegeId = searchParams?.get("collegeId") ?? null;
  const batchName = searchParams?.get("batchName") ?? null;
  const [step, setStep] = useState<"auth" | "login" | "register" | "instructions" | "test" | "result" | "expired" | "loading" | "not-started">(
    "auth"
  );
  const [studentId, setStudentId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [markedQuestions, setMarkedQuestions] = useState<{ [key: string]: boolean }>({});
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isProcessingLogin, setIsProcessingLogin] = useState<boolean>(false);

  const [createTestSession, { isLoading: isCreatingSession, error: sessionError }] =
    useCreateTestSessionMutation();
  const { data: testInfoData, isLoading: testInfoLoading, error: testInfoError } =
    useGetTestInstructionQuery({ sessionId, testId, collegeId }, { skip: !sessionId || !testId || !collegeId });
  const [startTestSession, { isLoading: isStartingTest, error: startTestError }] =
    useStartTestSessionMutation();
  const [saveAnswer, { isLoading: isSavingAnswer }] = useSaveAnswerMutation();
  const [submitTest, { isLoading: isSubmittingTest }] = useSubmitTestMutation();

  // Validate testId and collegeId
  useEffect(() => {
    if (!testId || !collegeId || !batchName) {      // Clear tokens if test link is invalid
      localStorage.removeItem("student_access_token");
      localStorage.removeItem("student_refresh_token");
      localStorage.removeItem("test_session");
      localStorage.removeItem("violations");
      setMessage("Invalid test link. Please contact your administrator.");
      setStep("expired");
    }
  }, [testId, collegeId, batchName]);

  // Set test info from instructions and validate test timing
  useEffect(() => {
    if (testInfoData && step === "instructions") {
      // Validate test timing if test has expiry
      if (testInfoData.hasExpiry) {
        const currentDate = new Date();
        const startTime = new Date(testInfoData.startTime);
        const endTime = new Date(testInfoData.endTime);

        if (currentDate < startTime) {
          const formattedStartTime = startTime.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
          });
          setMessage(`This test is scheduled to begin on ${formattedStartTime}. Please return at the scheduled time.`);
          setStep("not-started");
          return;
        }

        if (currentDate > endTime) {
          const formattedEndTime = endTime.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
          });
          setMessage(`This test ended on ${formattedEndTime}. The test window has closed.`);
          setStep("expired");
          return;
        }

        // Check if there's enough time left before test end time
        const minutesUntilEnd = Math.floor((endTime.getTime() - currentDate.getTime()) / (1000 * 60));
        if (minutesUntilEnd < testInfoData.session.duration) {
          setMessage(`This test will end in ${minutesUntilEnd} minutes, which is less than the required test duration (${testInfoData.session.duration} minutes). You cannot start the test now.`);
          setStep("expired");
          return;
        }
      }

      setTestInfo(testInfoData);
      setTimeRemaining(testInfoData.session.duration * 60);
    }
    if (testInfoError) {
      console.error("Test instruction error:", testInfoError);
      // Clear tokens on test info error
      localStorage.removeItem("student_access_token");
      localStorage.removeItem("student_refresh_token");
      localStorage.removeItem("test_session");
      localStorage.removeItem("violations");
      setMessage((testInfoError as any)?.data?.error || "Failed to load test instructions. Please try again.");
      setStep("expired");
      setSessionId(null);
    }
  }, [testInfoData, testInfoError, step]);

  // Handle session creation timeout
  useEffect(() => {
    if (isCreatingSession || testInfoLoading) {
      const timeout = setTimeout(() => {
        if (isCreatingSession || testInfoLoading) {
          // Clear tokens on timeout
          localStorage.removeItem("student_access_token");
          localStorage.removeItem("student_refresh_token");
          localStorage.removeItem("test_session");
          localStorage.removeItem("violations");
          setMessage("Session creation or test information is taking too long. Please try again.");
          setStep("expired");
          setSessionId(null);
        }
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [isCreatingSession, testInfoLoading]);

  // Timer for test
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && step === "test") {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => (prev !== null ? prev - 1 : prev));
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && step === "test") {
      handleSubmitTest();
    }
  }, [timeRemaining, step]);

  // Add session recovery
  useEffect(() => {
    const savedSession = localStorage.getItem("test_session");
    if (savedSession) {
      try {
        const { sessionId, testId: savedTestId, timeRemaining } = JSON.parse(savedSession);
        if (savedTestId === testId) {
          setSessionId(sessionId);
          setTimeRemaining(timeRemaining);
          setStep("test");
        }
      } catch (err) {
        localStorage.removeItem("test_session");
      }
    }
  }, [testId]);

  // Save session periodically
  useEffect(() => {
    if (sessionId && step === "test") {
      const sessionData = {
        sessionId,
        testId,
        timeRemaining,
      };
      localStorage.setItem("test_session", JSON.stringify(sessionData));
    }
  }, [sessionId, testId, timeRemaining, step]);

  // Handle problematic state where test step is reached without proper data
  useEffect(() => {
    if (step === "test" && (!testInfo || questions.length === 0) && !testInfoLoading && !isCreatingSession) {
      // Clear tokens and redirect to auth if we're stuck in test state without data
      localStorage.removeItem("student_access_token");
      localStorage.removeItem("student_refresh_token");
      localStorage.removeItem("test_session");
      localStorage.removeItem("violations");
      setStep("auth");
      setMessage("Session error. Please login again.");
    }
  }, [step, testInfo, questions, testInfoLoading, isCreatingSession]);

  // Handle auth success with specific handling for test expiration
  const handleAuthSuccess = useCallback(
    async (studentId: string, student_access_token: string) => {
      setStudentId(studentId);
      setIsProcessingLogin(true);
      setStep("loading"); // Show loading state immediately
      localStorage.setItem("student_access_token", student_access_token);

      try {
        const response = await createTestSession({
          studentId,
          testId,
          collegeId,
          batchName,
          token: student_access_token,
        }).unwrap();

        if (!response?.data?.sessionId) {
          throw new Error("Session ID not returned from server");
        }

        setSessionId(response.data.sessionId);
        setMessage(null); // Clear any previous message
        setIsProcessingLogin(false);
        setStep("instructions");
      } catch (err: any) {
        console.error("Session creation error:", err);
        setIsProcessingLogin(false);
        if (err?.status === 401) {
          localStorage.removeItem("student_access_token");
          localStorage.removeItem("student_refresh_token");
          setStep("auth");
          setMessage("Session expired. Please login again.");
        } else if (err?.data?.error === "This test link has expired") {
          setMessage("This test link has expired. Please contact your administrator.");
          setStep("expired");
        } else {
          setMessage(err?.data?.error || "Failed to create test session. Please try again.");
          setStep("expired");
        }
      }
    },
    [testId, collegeId, batchName, createTestSession]
  );

  // Handle start test
  const handleStartTest = useCallback(async () => {
    if (!sessionId || !testId || !collegeId) {
      setMessage("Missing session or test information. Please try again.");
      setStep("expired");
      return;
    }

    // Validate test timing before starting
    if (testInfo?.hasExpiry) {
      const currentDate = new Date();
      const startTime = new Date(testInfo.startTime);
      const endTime = new Date(testInfo.endTime);

      // Double-check timing conditions
      if (currentDate < startTime) {
        const formattedStartTime = startTime.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        });
        setMessage(`This test is scheduled to begin on ${formattedStartTime}. Please return at the scheduled time.`);
        setStep("not-started");
        return;
      }

      if (currentDate > endTime) {
        const formattedEndTime = endTime.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        });
        setMessage(`This test ended on ${formattedEndTime}. The test window has closed.`);
        setStep("expired");
        return;
      }

      // Ensure there's enough time to complete the test
      const minutesUntilEnd = Math.floor((endTime.getTime() - currentDate.getTime()) / (1000 * 60));
      if (minutesUntilEnd < testInfo.session.duration) {
        setMessage(`Cannot start test. Only ${minutesUntilEnd} minutes remaining until test end time, but test duration is ${testInfo.session.duration} minutes.`);
        setStep("expired");
        return;
      }
    }

    try {
      const response = await startTestSession({ sessionId, testId, collegeId }).unwrap();

      if (response.data.error) {
        setMessage(response.data.error);
        setStep("expired");
        return;
      }

      const initializedQuestions = (response.data.questions || []).map((q) => ({
        ...q,
        selectedAnswer: -1,
        timeSpent: 0,
      }));

      setQuestions(initializedQuestions);
      setTestInfo((prev) => (prev ? { ...prev, session: response.data.session } : prev));
      setTimeRemaining(response.data.session.duration * 60);
      setMarkedQuestions({});
      setCurrentQuestionIndex(0);
      setStep("test");
      toast.success("Test started successfully");
    } catch (err: any) {
      console.error("Error starting test:", err);
      if (err?.data?.error) {
        setMessage(err.data.error);
      } else if (err.status === 403) {
        setMessage("You are not authorized to start this test at this time.");
      } else {
        setMessage("Failed to start test. Please try again.");
      }
      setStep("expired");
    }
  }, [sessionId, testId, collegeId, startTestSession, testInfo]);

  // Handle test submission
  const handleSubmitTest = useCallback(async () => {
    if (!sessionId) {
      setMessage("Session ID is missing. Please try again.");
      setStep("expired");
      return;
    }

    if (!questions || questions.length === 0) {
      setMessage("No questions available to submit. Please try again.");
      setStep("expired");
      return;
    }

    try {
      const answers = questions.map((q) => ({
        questionId: q._id,
        selectedAnswer: q.selectedAnswer ?? -1,
        timeSpent: q.timeSpent ?? 0,
      }));

      const submissionData = {
        sessionId,
        answers,
        submissionType: "auto",
        endTime: new Date().toISOString(),
        status: "completed",
      };

      const response = await submitTest(submissionData).unwrap();

      if (!response) {
        throw new Error("No response received from server");
      }

      // Clear all localStorage data after successful submission
      localStorage.removeItem("test_session");
      localStorage.removeItem("violations");
      localStorage.removeItem("student_access_token");
      localStorage.removeItem("student_refresh_token");

      setResult(response);
      setStep("result");
      setTimeRemaining(null);
      toast.success("Test submitted successfully");
    } catch (err: any) {
      console.error("Submit test error:", err);

      if (err.status === 401 || err.status === 403) {
        // Clear tokens on authentication errors
        localStorage.removeItem("student_access_token");
        localStorage.removeItem("student_refresh_token");
        localStorage.removeItem("test_session");
        localStorage.removeItem("violations");
        setMessage("Session expired. Please login again.");
        setStep("auth");
        setSessionId(null);
        return;
      }

      if (err.status === 409) {
        setMessage("Test has already been submitted.");
        setStep("result");
        return;
      }

      if (!err.status) {
        setMessage("Network error. Please check your connection.");
        setStep("expired");
        return;
      }

      setMessage(err?.data?.error || "Failed to submit test. Please try again.");
      setStep("expired");
    }
  }, [sessionId, questions, submitTest]);

  // Handle exit
  const handleExit = useCallback(() => {
    // Clear all localStorage data
    localStorage.removeItem("test_session");
    localStorage.removeItem("violations");
    localStorage.removeItem("student_access_token");
    localStorage.removeItem("student_refresh_token");
    
    setStep("auth");
    setStudentId(null);
    setSessionId(null);
    setTestInfo(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setTimeRemaining(null);
    setResult(null);
    setMarkedQuestions({});
    setShowSuccessModal(false);
    setMessage(null);
    setIsProcessingLogin(false);
  }, []);

  // Calculate question status
  const questionStatus = questions.reduce(
    (acc, q, index) => {
      acc[index + 1] = {
        answered: q.selectedAnswer !== -1,
        marked: markedQuestions[q._id] || false,
      };
      return acc;
    },
    {} as { [key: string]: { answered: boolean; marked: boolean } }
  );

  const attempted = questions.filter((q) => q.selectedAnswer !== -1).length;
  const notAttempted = questions.length - attempted;
  const marked = Object.keys(markedQuestions).filter((id) => markedQuestions[id]).length;

  if (step === "auth") {
    return (
      <AuthView
        onShowLogin={() => setStep("login")}
        onShowRegister={() => setStep("register")}
        testName={testInfo?.testDetails?.name ?? ""}
      />
    );
  }

  if (step === "login") {
    return (
      <LoginForm
        onLogin={handleAuthSuccess}
        onBack={() => setStep("auth")}
        testId={testId}
        collegeId={collegeId}
      />
    );
  }

  if (step === "register") {
    return (
      <RegisterForm
        onRegister={(studentId, token) => {
          // Automatically process the registration and create session
          setShowSuccessModal(true);
          // Use a timeout to allow the success modal to be shown briefly, then process login
          setTimeout(() => {
            setShowSuccessModal(false);
            handleAuthSuccess(studentId, token);
          }, 2000);
        }}
        onBack={() => setStep("auth")}
        testId={testId}
        collegeId={collegeId}
      />
    );
  }

  if (showSuccessModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-green-900 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-18 h-18 bg-green-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Registration Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Setting up your test session...
              </p>
            </div>

            {/* Loading */}
            <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-300 border-t-green-600"></div>
                <span className="text-green-800 dark:text-green-200 text-sm font-medium">
                  Please wait...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          {/* Loading Spinner */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-200 border-t-blue-600"></div>
              <div className="absolute inset-0 rounded-full border-3 border-blue-100 opacity-25"></div>
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Setting Up Your Test
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we prepare everything...
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === "instructions") {
    return (
      <Instructions
        testDetails={
          testInfo?.testDetails || {
            name: "",
            college: "",
            duration: 0,
            totalQuestions: 0,
            passingScore: 0,
            allowRetake: false,
            instructions: [],
            rules: [],
          }
        }
        onStartTest={handleStartTest}
        isLoading={testInfoLoading || isStartingTest || isCreatingSession}
      />
    );
  }

  if (step === "test" && testInfo && questions.length > 0) {
    return (
      <TestSecurityWrapper onSubmit={handleSubmitTest}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <TestHeader
            testName={testInfo.testDetails.name}
            college={testInfo.testDetails.college}
            onExit={handleExit}
            timeRemaining={timeRemaining}
          />
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              <div className="lg:col-span-3 order-1">
                <Test
                  questions={questions}
                  sessionId={sessionId!}
                  timeRemaining={timeRemaining}
                  onSubmitTest={(response) => {
                    setResult(response);
                    setStep("result");
                  }}
                  setQuestions={setQuestions}
                  onMarkForReview={(questionId) => {
                    setMarkedQuestions((prev) => ({
                      ...prev,
                      [questionId]: !prev[questionId],
                    }));
                  }}
                  markedQuestions={markedQuestions}
                  currentQuestionIndex={currentQuestionIndex}
                  setCurrentQuestionIndex={setCurrentQuestionIndex}
                />
              </div>
              <div className="lg:col-span-1 order-2 space-y-6">
                <Timer duration={timeRemaining} onTimeUp={handleSubmitTest} />
                <QuestionNavigation
                  totalQuestions={questions.length}
                  currentQuestionIndex={currentQuestionIndex}
                  setCurrentQuestionIndex={setCurrentQuestionIndex}
                  questionStatus={questionStatus}
                  isLoading={false}
                />
                <QuestionMeta
                  totalQuestions={questions.length}
                  attempted={attempted}
                  notAttempted={notAttempted}
                  marked={marked}
                />
              </div>
            </div>
          </div>
        </div>
      </TestSecurityWrapper>
    );
  }

  if (step === "test" && (!testInfo || questions.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">
          {testInfoLoading || isCreatingSession ? "Loading test data..." : "Test data not available. Please try again."}
        </p>
      </div>
    );
  }

  if (step === "result" && testInfo?.testDetails) {
    return (
      <Result
        testDetails={{
          name: testInfo.testDetails.name,
          college: testInfo.testDetails.college
        }}
        onRedirect={() => {
          // Clear all tokens when redirecting from result page
          localStorage.removeItem("student_access_token");
          localStorage.removeItem("student_refresh_token");
          localStorage.removeItem("test_session");
          localStorage.removeItem("violations");
          setStep("auth");
        }}
      />
    );
  }

  if (step === "not-started") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Test Scheduled
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your test will begin at the scheduled time
              </p>
            </div>

            {/* Schedule Info */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border-l-4 border-blue-500">
              <div className="text-left">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  📅 Schedule Details
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Quick Preparation Tips
              </h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <span>Stable internet connection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <span>Quiet environment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <span>Close other applications</span>
                </div>
              </div>
            </div>

            {/* Button */}
            <Button
              onClick={handleExit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors"
            >
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "expired") {
    return (  
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Test Information
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Please review the information below
              </p>
            </div>

            {/* Message */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border-l-4 border-blue-500">
              <div className="text-left">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  ℹ️ Current Status
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                  {message || "This test session is currently not available. Please contact your instructor for assistance."}
                </p>
              </div>
            </div>

            {/* Help Options */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Need Help?
              </h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  <span>Contact your instructor</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  <span>Verify the test link</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  <span>Try refreshing the page</span>
                </div>
              </div>
            </div>

            {/* Button */}
            <Button
              onClick={handleExit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors"
            >
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to prevent blank screen
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <p className="text-gray-600 dark:text-gray-300">Loading...</p>
    </div>
  );
};

export default AptitudePage;
