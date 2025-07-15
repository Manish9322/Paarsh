"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Mail, Sparkles, ShieldCheck, UserCheck } from "lucide-react";
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
      
      localStorage.setItem("student_access_token", response.student_access_token);
      localStorage.setItem("student_refresh_token", response.student_refresh_token);
      onLogin(response.studentId, response.student_access_token);
      toast.success(response.message || "Login successful");
    } catch (err: any) {
      toast.error(err?.data?.error || "Invalid email or password.");
    }
  };

  return (
    <section className="flex h-screen items-center justify-center bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800">
      <div className="relative mx-auto flex max-w-6xl overflow-hidden rounded bg-white shadow-xl dark:bg-gray-800">
        {/* Left Side - Login Form */}
        <div className="w-full p-8 md:w-1/2 md:p-10">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Test Login
            </h2>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Access Your Aptitude Test
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group relative">
                <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded border-2 border-gray-200 bg-gray-50 px-10 py-3 text-base font-semibold outline-none transition-colors focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700/50"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="group relative">
                <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded border-2 border-gray-200 bg-gray-50 px-10 py-3 text-base font-semibold outline-none transition-colors focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700/50"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={onBack}
                  variant="outline"
                  className="w-full space-x-2 rounded border-blue-500 py-6 text-blue-600 transition-all hover:bg-blue-50 hover:shadow-lg dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back</span>
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full space-x-2 rounded bg-blue-600 py-6 text-white transition-all hover:bg-blue-700 hover:shadow-lg dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <span>Log In</span>
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Info */}
        <div className="hidden bg-gradient-to-br from-blue-500 to-blue-600 p-10 text-white md:block md:w-1/2">
          <div className="relative h-full">
            {/* Decorative elements */}
            <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-white/10" />

            <div className="relative space-y-8">
              <h3 className="flex items-center text-2xl font-bold">
                <Sparkles className="mr-3 h-6 w-6" />
                Important Notice
              </h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <ShieldCheck className="h-6 w-6 shrink-0" />
                  <div>
                    <h4 className="mb-2 font-semibold">Test Security</h4>
                    <p className="text-white/80">Your test session is monitored and secured to ensure fair assessment.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <UserCheck className="h-6 w-6 shrink-0" />
                  <div>
                    <h4 className="mb-2 font-semibold">Single Attempt</h4>
                    <p className="text-white/80">You can only take the test once. Ensure youre ready before starting.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded bg-white/10 p-6">
                <p className="italic text-white/90">
                  Login to begin your assessment. Good luck with your test!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};