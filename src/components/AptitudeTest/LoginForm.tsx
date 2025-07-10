"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useLoginStudentMutation } from "@/services/api";

interface LoginFormProps {
  onLogin: (studentId: string, token: string) => void;
  onBack: () => void;
  testId: string | null;
  collegeId: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onBack, testId, collegeId }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loginStudent, { isLoading }] = useLoginStudentMutation();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!testId || !collegeId) {
    toast.error("Invalid test link");
    return;
  }
  if (!formData.email || !formData.password) {
    toast.error("Please fill in all fields.");
    return;
  }
  try {
    const response = await loginStudent({
      email: formData.email,
      password: formData.password,
      testId,
      collegeId,
    }).unwrap();
    
    // Store both tokens from the response
    localStorage.setItem("student_access_token", response.student_access_token);
    localStorage.setItem("student_refresh_token", response.student_refresh_token);
    
    // Pass studentId and token to onLogin as required by the interface
    onLogin(response.studentId, response.student_access_token);
    
    toast.success(response.message || "Login successful");
  } catch (err: any) {
    toast.error(err?.data?.error || "Invalid email or password.");
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                disabled={isLoading}
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