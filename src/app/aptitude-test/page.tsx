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
import { QuestionDisplay } from "@/components/AptitudeTest/QuestionDisplay";
import { NavigationControls } from "@/components/AptitudeTest/NavigationControls";
import { Result } from "@/components/AptitudeTest/Result";
import { Test } from "@/components/AptitudeTest/Test";
import {
  useCreateTestSessionMutation,
  useGetTestInstructionQuery,
  useStartTestSessionMutation,
  useSaveAnswerMutation,
  useSubmitTestMutation,
} from "@/services/api";

// Define interfaces for TypeScript
interface Question {
  _id: string;
  text: string;
  options: string[];
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
  questions?: Question[]; // Optional, as questions are fetched later
}

interface ResultData {
  score: number;
  percentage: number;
  totalQuestions: number;
}

const AptitudePage: React.FC = () => {
  const searchParams = useSearchParams();
  const testId = searchParams?.get("testId") ?? null;
  const collegeId = searchParams?.get("collegeId") ?? null;
  const [step, setStep] = useState<"auth" | "login" | "register" | "instructions" | "test" | "result">("auth");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [markedQuestions, setMarkedQuestions] = useState<{ [key: string]: boolean }>({});
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const [createTestSession, { isLoading: isCreatingSession, error: sessionError }] = useCreateTestSessionMutation();
  const { data: testInfoData, isLoading: testInfoLoading, error: testInfoError } = useGetTestInstructionQuery(
    { sessionId, testId, collegeId },
    { skip: !sessionId || !testId || !collegeId }
  );
  const [startTestSession, { isLoading: isStartingTest, error: startTestError }] = useStartTestSessionMutation();
  const [saveAnswer, { isLoading: isSavingAnswer }] = useSaveAnswerMutation();
  const [submitTest, { isLoading: isSubmittingTest }] = useSubmitTestMutation();

  // Validate testId and collegeId
  useEffect(() => {
    if (!testId || !collegeId) {
      toast.error("Invalid test link");
      setStep("auth");
    }
  }, [testId, collegeId]);

  // Set test info from instructions
  useEffect(() => {
    if (testInfoData && step === "instructions") {
      setTestInfo(testInfoData);
      setTimeRemaining(testInfoData.session.duration * 60);
    }
    if (testInfoError) {
      console.error("Test instruction error:", testInfoError);
      toast.error((testInfoError as any)?.data?.error || "Failed to load test instructions");
      setStep("auth");
      setSessionId(null);
    }
  }, [testInfoData, testInfoError, step]);

  // Handle session creation timeout
  useEffect(() => {
    if (isCreatingSession || testInfoLoading) {
      const timeout = setTimeout(() => {
        if (isCreatingSession || testInfoLoading) {
          toast.error("Session creation or test information is taking too long. Please try again.");
          setStep("auth");
          setSessionId(null);
        }
      }, 10000); // 10 seconds timeout
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

  // Handle login/register success
  const handleAuthSuccess = useCallback(
    async (studentId: string, student_access_token: string) => {
      setStudentId(studentId);
      try {
        const response = await createTestSession({ studentId, testId, collegeId }).unwrap();
        console.log("Response from createTestSession:", response);
        if (!response?.data?.sessionId) {
          throw new Error("Session ID not returned from server");
        }
        setSessionId(response.data.sessionId);
        setStep("instructions");
      } catch (err: any) {
        console.error("Error creating test session:", err);
        toast.error(err?.data?.error || "Failed to create test session");
        setStep("auth");
      }
    },
    [testId, collegeId, createTestSession]
  );

  // Handle start test
  const handleStartTest = useCallback(async () => {
    if (!sessionId || !testId || !collegeId) {
      toast.error("Missing session or test information");
      return;
    }
    try {
      const response = await startTestSession({ sessionId, testId, collegeId }).unwrap();
      console.log("Response from startTestSession:", response);
      setQuestions(response.data.questions || []);
      setTestInfo((prev) => (prev ? { ...prev, session: response.data.session } : prev));
      setTimeRemaining(response.data.session.duration * 60);
      setStep("test");
      toast.success("Test started successfully");
    } catch (err: any) {
      console.error("Error starting test:", err);
      toast.error(err?.data?.error || "Failed to start test");
    }
  }, [sessionId, testId, collegeId, startTestSession]);

  // Handle test submission
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
      console.log("Submit test response:", response);
      setResult(response);
      setStep("result");
      setTimeRemaining(null);
      toast.success("Test submitted successfully");
    } catch (err: any) {
      console.error("Submit test error:", err);
      toast.error(err?.data?.error || "Failed to submit test");
    }
  }, [sessionId, questions, submitTest]);

  // Handle exit
  const handleExit = useCallback(() => {
    setStep("auth");
    setStudentId(null);
    setSessionId(null);
    setTestInfo(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setTimeRemaining(null);
    setResult(null);
    setMarkedQuestions({});
  }, []);

  // Calculate question status
  const questionStatus = questions.reduce(
    (acc, q) => {
      acc[q._id] = {
        answered: q.selectedAnswer !== -1,
        marked: !!markedQuestions[q._id],
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
      <>
        <AuthView
          onShowLogin={() => setStep("login")}
          onShowRegister={() => setStep("register")}
          testName={testInfo?.testDetails?.name ?? ""}
        />
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            setStep("login");
          }}
        />
      </>
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
          setShowSuccessModal(true);
          handleAuthSuccess(studentId, token);
        }}
        onBack={() => setStep("auth")}
        testId={testId}
        collegeId={collegeId}
      />
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <TestHeader
          testName={testInfo.testDetails.name}
          college={testInfo.testDetails.college}
          onExit={handleExit}
        />
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <Test
                questions={questions}
                sessionId={sessionId!}
                timeRemaining={timeRemaining}
                onSubmitTest={setResult}
                setQuestions={setQuestions}
              />
            </div>
            <div className="lg:col-span-1">
              <Timer duration={timeRemaining} onTimeUp={handleSubmitTest} />
              <QuestionNavigation
                totalQuestions={questions.length}
                currentQuestionIndex={currentQuestionIndex}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                questionStatus={questionStatus}
              />
              <QuestionMeta
                totalQuestions={questions.length}
                attempted={attempted}
                notAttempted={notAttempted}
                marked={marked}
              />
              <div className="mt-8">
                <NavigationControls
                  onPrevious={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
                  onNext={() => setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                  onSubmit={handleSubmitTest}
                  isFirst={currentQuestionIndex === 0}
                  isLast={currentQuestionIndex === questions.length - 1}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "test" && (!testInfo || questions.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">
          {testInfoLoading || isCreatingSession ? "Loading test data..." : "Error: Test data not available"}
        </p>
      </div>
    );
  }

  if (step === "result" && result && testInfo?.testDetails) {
    return <Result result={result} testDetails={testInfo.testDetails} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <p className="text-gray-600 dark:text-gray-300">Loading...</p>
    </div>
  );
};

export default AptitudePage;