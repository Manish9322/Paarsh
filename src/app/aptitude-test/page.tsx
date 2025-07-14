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
  questions?: Question[]; // Optional, as questions are fetched later
}

interface ResultData {
  score: number;
  percentage: number;
  totalQuestions: number;
}

// Add TestSecurityWrapper component at the top level
const TestSecurityWrapper: React.FC<{ children: React.ReactNode; onSubmit: () => void }> = ({ children, onSubmit }) => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const violations = parseInt(localStorage.getItem("violations") || "0") + 1;
        localStorage.setItem("violations", violations.toString());
        
        if (violations >= 3) {
          onSubmit();
        } else {
          toast.error(`Warning: Tab switching detected! (${violations}/3)`);
        }
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && 
          (e.key === 'c' || e.key === 'v' || e.key === 'p')) {
        e.preventDefault();
        toast.error("Keyboard shortcuts are disabled during the test");
      }
    };

    // Handle fullscreen only once when component mounts
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
        timeRemaining
      };
      localStorage.setItem("test_session", JSON.stringify(sessionData));
    }
  }, [sessionId, testId, timeRemaining, step]);

  // Update handleAuthSuccess with better error handling
  const handleAuthSuccess = useCallback(async (studentId: string, student_access_token: string) => {
    setStudentId(studentId);
    localStorage.setItem("student_access_token", student_access_token);
    
    try {
      const response = await createTestSession({ 
        studentId, 
        testId, 
        collegeId,
        token: student_access_token
      }).unwrap();
      
      if (!response?.data?.sessionId) {
        throw new Error("Session ID not returned from server");
      }
      
      setSessionId(response.data.sessionId);
      setStep("instructions");
    } catch (err: any) {
      if (err?.status === 401) {
        localStorage.removeItem("student_access_token");
        setStep("auth");
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(err?.data?.error || "Failed to create test session");
        setStep("auth");
      }
    }
  }, [testId, collegeId, createTestSession]);

  // Handle start test
  const handleStartTest = useCallback(async () => {
    if (!sessionId || !testId || !collegeId) {
      toast.error("Missing session or test information");
      return;
    }
    try {
      const response = await startTestSession({ sessionId, testId, collegeId }).unwrap();
      console.log("Response from startTestSession:", response);
      
      // Initialize questions with default values
      const initializedQuestions = (response.data.questions || []).map(q => ({
        ...q,
        selectedAnswer: -1, // -1 means no answer selected
        timeSpent: 0
      }));
      
      setQuestions(initializedQuestions);
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
          // handleAuthSuccess(studentId, token);
          setStep("login");
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
          {testInfoLoading || isCreatingSession ? "Loading test data..." : "Error: Test data not available"}
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
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <p className="text-gray-600 dark:text-gray-300">Loading...</p>
    </div>
  );
};

export default AptitudePage;