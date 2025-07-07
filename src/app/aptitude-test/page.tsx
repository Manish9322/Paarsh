"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Flag,
  Eye,
  EyeOff,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { GoChevronLeft } from "react-icons/go";

// Sample test data (replace with API or props in real app)
const testData = {
  name: "General Aptitude Test",
  college: "Tech University",
  duration: 60, // in minutes
  totalQuestions: 100,
  instructions: [
    "Read each question carefully before answering.",
    "You can navigate between questions using the navigation panel.",
    "Mark questions for review if unsure.",
    "Submit the test when you are ready.",
  ],
  rules: [
    "No external resources allowed.",
    "Ensure a stable internet connection.",
    "Complete the test within the allotted time.",
    "Only one submission is allowed per question.",
  ],
};

// Sample questions (mock data for 100 questions)
const questions = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  text: `Sample question ${index + 1} for the aptitude test.`,
  options: ["Option A", "Option B", "Option C", "Option D"],
  correctAnswer: "Option A",
}));

// Mock user database (replace with real API)
const mockUsers = [{ email: "test@example.com", password: "password123" }];

// AuthView Component
const AuthView = ({ onShowLogin, onShowRegister }) => (
  <section className="dark:via-gray-850 flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-gray-50 to-white py-24 dark:from-gray-800 dark:to-gray-800">
    <Card className="w-full max-w-lg border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="text-center">
        <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to {testData.name}
        </h2>
        <p className="mb-8 text-gray-600 dark:text-gray-300">
          Please log in or register to start the test.
        </p>
        <div className="flex flex-col gap-4">
          <Button
            onClick={onShowLogin}
            className="group relative inline-flex items-center gap-2 rounded bg-blue-600 px-6 py-6 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <span className="flex items-center gap-2">
              Log In
              <ArrowRight className="h-4 w-4" />
            </span>
          </Button>
          <Button
            onClick={onShowRegister}
            variant="outline"
            className="group rounded border-blue-500 px-6 py-6 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <span className="flex items-center gap-2">
              Register
              <ArrowRight className="h-4 w-4" />
            </span>
          </Button>
        </div>
      </div>
    </Card>
  </section>
);

// LoginForm Component
const LoginForm = ({ onLogin, onBack, setError }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login form submitted with:", formData); // Debug log
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }
    // Mock login check
    const user = mockUsers.find(
      (u) => u.email === formData.email && u.password === formData.password,
    );
    if (user) {
      console.log("Login successful, calling onLogin"); // Debug log
      onLogin();
    } else {
      setError("Invalid email or password.");
      console.log("Login failed: Invalid credentials"); // Debug log
    }
  };

  return (
    <section className="dark:via-gray-850 flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-gray-50 to-white py-24 dark:from-gray-800 dark:to-gray-800">
      <Card className="w-full max-w-md border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="text-center">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
            Log In
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group relative">
              <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base font-semibold outline-none dark:border-gray-600 dark:bg-gray-700/50"
                placeholder="Enter your email"
                required
              />
              <div className="absolute -bottom-2 left-0 h-0.5 w-0 rounded bg-blue-500 transition-all duration-300 group-focus-within:w-full" />
            </div>
            <div className="group relative">
              <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full rounded border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base font-semibold outline-none dark:border-gray-600 dark:bg-gray-700/50"
                placeholder="Enter your password"
                required
              />
              <div className="absolute -bottom-2 left-0 h-0.5 w-0 rounded bg-blue-500 transition-all duration-300 group-focus-within:w-full" />
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className="w-full rounded border-blue-500 px-6 py-6 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="w-full rounded bg-blue-600 px-6 py-6 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Log In
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </section>
  );
};

// RegisterForm Component
const RegisterForm = ({ onRegister, onBack, setError }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    education: "",
    college: "",
    gender: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register form submitted with:", formData); // Debug log
    const {
      name,
      email,
      phone,
      education,
      college,
      gender,
      password,
      confirmPassword,
      acceptTerms,
    } = formData;
    if (
      !name ||
      !email ||
      !phone ||
      !education ||
      !college ||
      !gender ||
      !password ||
      !confirmPassword ||
      !acceptTerms
    ) {
      setError("Please fill in all fields and accept the terms.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    // Mock registration
    mockUsers.push({ email, password });
    console.log("Registration successful, calling onRegister"); // Debug log
    onRegister();
  };

  return (
    <section className="dark:via-gray-850 relative z-10 flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white pt-36 dark:from-gray-800 dark:to-gray-800 lg:pb-16 lg:pt-[60px]">
      <div className="container mx-auto px-4">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            {/* <div className="mx-auto mb-4 max-w-[700px]">
              <Link
                href="/"
                className="inline-flex items-center text-primary transition-colors hover:text-blue-700"
              >
                <GoChevronLeft size={22} className="mr-1" />
                Back to Home
              </Link>
            </div> */}
            <Card className="mx-auto max-w-[700px] rounded bg-white px-4 py-8 shadow-three dark:bg-gray-800 sm:p-[40px] md:p-10">
              <div className="text-center">
                <h2 className="mb-3 text-center text-xl font-bold text-black dark:text-white sm:text-2xl md:text-3xl">
                  Register
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Left Section */}
                    <div>
                      <div className="mb-4">
                        <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Enter your full name"
                          className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="Enter your email"
                          className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                          Education
                        </label>
                        <input
                          type="text"
                          value={formData.education}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              education: e.target.value,
                            })
                          }
                          placeholder="e.g., B.Tech in Computer Science"
                          className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                          required
                        />
                      </div>
                      <div className="relative mb-4">
                        <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                          Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          placeholder="Enter your password"
                          className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-10"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                    {/* Right Section */}
                    <div>
                      <div className="mb-4">
                        <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                          College
                        </label>
                        <input
                          type="text"
                          value={formData.college}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              college: e.target.value,
                            })
                          }
                          placeholder="e.g., Tech University"
                          className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                          Phone Number
                        </label>
                        <input
                          type="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="Enter your email"
                          className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                          Gender
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) =>
                            setFormData({ ...formData, gender: e.target.value })
                          }
                          className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                          required
                        >
                          <option value="" disabled>
                            Select gender
                          </option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="relative mb-4">
                        <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                          Confirm Password
                        </label>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="Confirm your password"
                          className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-10"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        onClick={onBack}
                        variant="outline"
                        className="w-full rounded border-gray-300 px-6 py-6 text-black hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700/50"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="w-full rounded bg-blue-600 px-6 py-6 text-white hover:bg-black dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        Register
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <div className="absolute left-0 top-0 z-[-1]">
        <svg
          width="1440"
          height="969"
          viewBox="0 0 1440 969"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <mask
            id="mask0_95:1005"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1440"
            height="969"
          >
            <rect width="1440" height="969" fill="#090E34" />
          </mask>
          <g mask="url(#mask0_95:1005)">
            <path
              opacity="0.1"
              d="M1086.96 297.978L632.959 554.978L935.625 535.926L1086.96 297.978Z"
              fill="url(#paint0_linear_95:1005)"
            />
            <path
              opacity="0.1"
              d="M1324.5 755.5L1450 687V886.5L1324.5 967.5L-10 288L1324.5 755.5Z"
              fill="url(#paint1_linear_95:1005)"
            />
          </g>
          <defs>
            <linearGradient
              id="paint0_linear_95:1005"
              x1="1178.4"
              y1="151.853"
              x2="780.959"
              y2="453.581"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#4A6CF7" />
              <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_95:1005"
              x1="160.5"
              y1="220"
              x2="1099.45"
              y2="1192.04"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#4A6CF7" />
              <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
};

// SuccessModal Component
const SuccessModal = ({ isOpen, onClose }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-md">
      <div className="p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Registration Successful!
        </h3>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Your account has been created. Please log in to start the test.
        </p>
        <Button
          onClick={onClose}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          OK
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

// ConfirmationModal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, type }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          {type === "exit" ? "Exit Test?" : "Submit Test?"}
        </DialogTitle>
      </DialogHeader>
      <div className="py-4 text-center">
        {type === "exit" ? (
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500 dark:text-red-400" />
        ) : (
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500 dark:text-green-400" />
        )}
        <p className="text-gray-600 dark:text-gray-300">
          {type === "exit"
            ? "Are you sure you want to exit the test? You wont be able to restart the test."
            : "Are you sure you want to submit the test? You cannot change answers after submission."}
        </p>
      </div>
      <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={onClose}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          className={`w-full sm:w-auto ${type === "exit" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
        >
          {type === "exit" ? "Exit" : "Submit"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// TestDetails Component
const TestDetails = ({ onStartTest }) => (
  <section className="dark:via-gray-850 bg-gradient-to-b from-white via-gray-50 to-white py-24 dark:from-gray-800 dark:to-gray-800">
    <div className="container mx-auto max-w-4xl px-4">
      <div className="text-center">
        <span className="mb-4 inline-block rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
          Aptitude Test
        </span>
        <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white lg:text-5xl">
          {testData.name}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
          Conducted by {testData.college}
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="relative overflow-hidden rounded border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Instructions
            </h2>
            <ul className="list-inside list-disc text-gray-600 dark:text-gray-300">
              {testData.instructions.map((instruction, index) => (
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
              <strong>Duration:</strong> {testData.duration} minutes
            </p>
            <p className="mb-2 text-gray-600 dark:text-gray-300">
              <strong>Total Questions:</strong> {testData.totalQuestions}
            </p>
            <h3 className="mb-2 mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Rules
            </h3>
            <ul className="list-inside list-disc text-gray-600 dark:text-gray-300">
              {testData.rules.map((rule, index) => (
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

// TestHeader Component
const TestHeader = ({ testName, college, setIsAuthenticated }) => {
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const handleExitConfirm = () => {
    console.log("Exiting test"); // Debug log
    setIsAuthenticated(false);
    setIsExitModalOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-white shadow-lg dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {testName}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {college}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setIsExitModalOpen(true)}
                className="group rounded border-blue-500 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                <span className="flex items-center gap-2">
                  Exit Test
                  <XCircle className="h-4 w-4" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={handleExitConfirm}
        type="exit"
      />
    </>
  );
};

// Timer Component
const Timer = ({ duration }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

// QuestionNavigation Component
const QuestionNavigation = ({
  totalQuestions,
  currentQuestion,
  setCurrentQuestion,
  questionStatus,
}) => {
  const [questionGroup, setQuestionGroup] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const questionsPerGroup = 25;
  const totalGroups = Math.ceil(totalQuestions / questionsPerGroup);

  const handlePreviousGroup = () => {
    if (questionGroup > 0) {
      const newGroup = questionGroup - 1;
      setQuestionGroup(newGroup);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: newGroup * scrollContainerRef.current.offsetHeight,
          behavior: "smooth",
        });
      }
    }
  };

  const handleNextGroup = () => {
    if (questionGroup < totalGroups - 1) {
      const newGroup = questionGroup + 1;
      setQuestionGroup(newGroup);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: newGroup * scrollContainerRef.current.offsetHeight,
          behavior: "smooth",
        });
      }
    }
  };

  // Auto-scroll to the group containing the current question
  useEffect(() => {
    const groupIndex = Math.floor((currentQuestion - 1) / questionsPerGroup);
    if (groupIndex !== questionGroup) {
      setQuestionGroup(groupIndex);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: groupIndex * scrollContainerRef.current.offsetHeight,
          behavior: "smooth",
        });
      }
    }
  }, [currentQuestion, questionGroup]);

  return (
    <Card className="mb-4 border border-gray-100 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div>
        {/* <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          Question Navigation
        </h3> */}
        <div
          ref={scrollContainerRef}
          className="flex h-[272px] flex-wrap gap-2 overflow-y-auto"
          style={{
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE and Edge
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none; /* Chrome, Safari, Opera */
            }
            .split-color {
              background: linear-gradient(to bottom, #22c55e 50%, #ef4444 50%);
            }
          `}</style>
          {Array.from({ length: totalQuestions }, (_, index) => {
            const questionNumber = index + 1;
            return (
              <button
                key={questionNumber}
                onClick={() => setCurrentQuestion(questionNumber)}
                className={`flex h-8 w-8 items-center justify-center rounded-full p-2 text-sm font-semibold
                  ${
                    currentQuestion === questionNumber
                      ? "bg-blue-600 text-white"
                      : questionStatus[questionNumber]?.answered &&
                          questionStatus[questionNumber]?.marked
                        ? "split-color text-white"
                        : questionStatus[questionNumber]?.answered
                          ? "bg-green-500 text-white"
                          : questionStatus[questionNumber]?.marked
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white"
                  }`}
              >
                {questionNumber}
              </button>
            );
          })}
        </div>
        {/* <div className="flex justify-between mt-4">
          <Button
            onClick={handlePreviousGroup}
            disabled={questionGroup === 0}
            variant="outline"
            className="rounded border-blue-500 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={handleNextGroup}
            disabled={questionGroup === totalGroups - 1}
            variant="outline"
            className="rounded border-blue-500 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div> */}
      </div>
    </Card>
  );
};

// QuestionMeta Component
const QuestionMeta = ({ totalQuestions, attempted, notAttempted, marked }) => (
  <Card className="border border-gray-100 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
    <div>
      <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
        Test Overview
      </h3>
      <div className="space-y-2">
        <p className="text-gray-600 dark:text-gray-300">
          <span className="mr-2 inline-block h-3 w-3 rounded-full bg-blue-600"></span>
          Total Questions: {totalQuestions}
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          <span className="mr-2 inline-block h-3 w-3 rounded-full bg-green-500"></span>
          Attempted: {attempted}
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          <span className="mr-2 inline-block h-3 w-3 rounded-full bg-gray-200 dark:bg-gray-600"></span>
          Not Attempted: {notAttempted}
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          <span className="mr-2 inline-block h-3 w-3 rounded-full bg-red-500"></span>
          Marked for Review: {marked}
        </p>
      </div>
    </div>
  </Card>
);

// QuestionDisplay Component
const QuestionDisplay = ({
  question,
  onSelectOption,
  selectedOption,
  onMarkForReview,
}) => (
  <Card className="h-full border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Question {question?.id || "N/A"}
        </h3>
        <Button
          variant="outline"
          onClick={onMarkForReview}
          className="group rounded border-red-500 px-4 py-2 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/30"
          disabled={!question}
        >
          <Flag className="mr-2 h-4 w-4" />
          Mark for Review
        </Button>
      </div>
      {question ? (
        <>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            {question.text}
          </p>
          <div className="space-y-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => onSelectOption(option)}
                className={`w-full rounded border-2 p-4 text-left ${
                  selectedOption === option
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-200 dark:border-gray-600"
                } text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700/50`}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-600 dark:text-gray-300">
          No question available.
        </p>
      )}
    </div>
  </Card>
);

// NavigationControls Component
const NavigationControls = ({
  onPrevious,
  onNext,
  onSubmit,
  isFirst,
  isLast,
}) => {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const handleSubmitConfirm = () => {
    console.log("Confirming test submission"); // Debug log
    onSubmit();
    setIsSubmitModalOpen(false);
  };

  return (
    <>
      <div className="flex justify-end gap-4">
        <Button
          onClick={onPrevious}
          disabled={isFirst}
          variant="outline"
          className="group rounded border-blue-500 px-6 py-3 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          onClick={onNext}
          disabled={isLast}
          className="group relative inline-flex items-center gap-2 rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => setIsSubmitModalOpen(true)}
          className="group relative inline-flex items-center gap-2 rounded bg-green-600 px-6 py-3 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
        >
          Submit Test
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      </div>
      <ConfirmationModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleSubmitConfirm}
        type="submit"
      />
    </>
  );
};

// Main AptitudeTest Component
export default function AptitudeTest() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState("");
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState({});

  const handleShowLogin = () => {
    setShowLoginForm(true);
    setShowRegisterForm(false);
    setError("");
    console.log("Showing login form"); // Debug log
  };

  const handleShowRegister = () => {
    setShowRegisterForm(true);
    setShowLoginForm(false);
    setError("");
    console.log("Showing register form"); // Debug log
  };

  const handleLogin = () => {
    console.log("handleLogin called, setting isAuthenticated to true"); // Debug log
    setIsAuthenticated(true);
    setShowLoginForm(false);
    setError("");
    setIsTestStarted(false); // Ensure TestDetails is shown
  };

  const handleRegister = () => {
    setShowRegisterForm(false);
    setShowSuccessModal(true);
    console.log("handleRegister called, showing success modal"); // Debug log
  };

  const handleBack = () => {
    setShowLoginForm(false);
    setShowRegisterForm(false);
    setError("");
    console.log("Back to AuthView"); // Debug log
  };

  const handleStartTest = () => {
    setIsTestStarted(true);
    console.log("Starting test"); // Debug log
  };

  const handleSelectOption = (questionId, option) => {
    if (questionId) {
      setAnswers((prev) => ({ ...prev, [questionId]: option }));
      console.log(`Selected option ${option} for question ${questionId}`); // Debug log
    }
  };

  const handleMarkForReview = (questionId) => {
    if (questionId) {
      setMarkedQuestions((prev) => ({
        ...prev,
        [questionId]: !prev[questionId],
      }));
      console.log(`Marked question ${questionId} for review`); // Debug log
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
      console.log(`Navigated to previous question: ${currentQuestion - 1}`); // Debug log
    }
  };

  const handleNext = () => {
    if (currentQuestion < testData.totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
      console.log(`Navigated to next question: ${currentQuestion + 1}`); // Debug log
    }
  };

  const handleSubmit = () => {
    console.log("Test submitted:", answers); // Debug log
  };

  const questionStatus = questions.reduce((acc, q) => {
    acc[q.id] = {
      answered: !!answers[q.id],
      marked: !!markedQuestions[q.id],
    };
    return acc;
  }, {});

  const attempted = Object.keys(answers).length;
  const notAttempted = testData.totalQuestions - attempted;
  const marked = Object.keys(markedQuestions).filter(
    (id) => markedQuestions[id],
  ).length;

  console.log(
    "Rendering AptitudeTest, isAuthenticated:",
    isAuthenticated,
    "isTestStarted:",
    isTestStarted,
  ); // Debug log

  if (!isAuthenticated) {
    if (showLoginForm) {
      return (
        <LoginForm
          onLogin={handleLogin}
          onBack={handleBack}
          setError={setError}
        />
      );
    }
    if (showRegisterForm) {
      return (
        <RegisterForm
          onRegister={handleRegister}
          onBack={handleBack}
          setError={setError}
        />
      );
    }
    return (
      <>
        <AuthView
          onShowLogin={handleShowLogin}
          onShowRegister={handleShowRegister}
        />
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />
        {error && (
          <div className="fixed bottom-4 left-1/2 max-w-md -translate-x-1/2 rounded bg-red-100 p-4 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}
      </>
    );
  }

  if (!isTestStarted) {
    return <TestDetails onStartTest={handleStartTest} />;
  }

  const currentQ = questions.find((q) => q.id === currentQuestion);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TestHeader
        testName={testData.name}
        college={testData.college}
        setIsAuthenticated={setIsAuthenticated}
      />
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <QuestionDisplay
              question={currentQ}
              onSelectOption={(option) =>
                handleSelectOption(currentQ?.id, option)
              }
              selectedOption={currentQ && answers[currentQ.id]}
              onMarkForReview={() => handleMarkForReview(currentQ?.id)}
            />
          </div>
          <div className="lg:col-span-1">
            <Timer duration={testData.duration} />
            <QuestionNavigation
              totalQuestions={testData.totalQuestions}
              currentQuestion={currentQuestion}
              setCurrentQuestion={setCurrentQuestion}
              questionStatus={questionStatus}
            />
            <QuestionMeta
              totalQuestions={testData.totalQuestions}
              attempted={attempted}
              notAttempted={notAttempted}
              marked={marked}
            />
            <div className="mt-8">
              <NavigationControls
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSubmit={handleSubmit}
                isFirst={currentQuestion === 1}
                isLast={currentQuestion === testData.totalQuestions}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
