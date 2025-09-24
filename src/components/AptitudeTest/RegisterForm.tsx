"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ArrowLeft, User, Mail, Phone, GraduationCap, Building2, Users, Sparkles, BookOpen, Rocket, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRegisterStudentMutation } from "@/services/api";

interface RegisterFormProps {
  onRegister: (studentId: string, token: string) => void;
  onBack: () => void;
  testId: string | null;
  collegeId: string | null;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onBack, testId, collegeId }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    degree: "",
    university: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerStudent, { isLoading }] = useRegisterStudentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testId || !collegeId) {
      toast.error("Invalid test link");
      return;
    }
    const { name, email, phone, degree, university, gender, password, confirmPassword } = formData;
    if (!name || !email || !phone || !degree || !university || !gender || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      const response = await registerStudent({
        name,
        email,
        phone,
        degree,
        university,
        gender,
        testId,
        collegeId,
        password,
      }).unwrap();
      localStorage.setItem("student_access_token", response.token);
      onRegister(response.studentId, response.token);
      toast.success("Registration successful");
    } catch (err: any) {
      toast.error(err?.data?.error || "Registration failed.");
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800 py-4 sm:py-8">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col overflow-hidden rounded bg-white shadow-xl dark:bg-gray-800 lg:flex-row">
        {/* Left Side - Register Form */}
        <div className="w-full p-4 sm:p-6 lg:w-1/2 lg:p-8 xl:p-10">
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Register for Test
            </h2>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 sm:text-base">
              Complete Your Assessment Registration
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
                <div className="space-y-4 sm:space-y-6">
                  <div className="relative">
                    <label className="mb-2 block text-left text-sm font-medium text-dark text-primary dark:text-white sm:text-base">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-3 sm:h-5 sm:w-5" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="w-full rounded border border-gray-300 bg-gray-100 px-8 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 sm:px-10 sm:py-2.5 sm:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="mb-2 block text-left text-sm font-medium text-dark text-primary dark:text-white sm:text-base">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-3 sm:h-5 sm:w-5" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter your email address"
                        className="w-full rounded border border-gray-300 bg-gray-100 px-8 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 sm:px-10 sm:py-2.5 sm:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="mb-2 block text-left text-sm font-medium text-dark text-primary dark:text-white sm:text-base">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-3 sm:h-5 sm:w-5" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter your mobile number"
                        className="w-full rounded border border-gray-300 bg-gray-100 px-8 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 sm:px-10 sm:py-2.5 sm:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="mb-2 block text-left text-sm font-medium text-dark text-primary dark:text-white sm:text-base">
                      Password
                    </label>
                    <div className="relative">
                      <Eye className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-3 sm:h-5 sm:w-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Create a secure password"
                        className="w-full rounded border border-gray-300 bg-gray-100 px-8 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 sm:px-10 sm:py-2.5 sm:text-base"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="relative">
                    <label className="mb-2 block text-left text-sm font-medium text-dark text-primary dark:text-white sm:text-base">
                      Degree
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-3 sm:h-5 sm:w-5" />
                      <input
                        type="text"
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        placeholder="e.g., BE in Information Technology"
                        className="w-full rounded border border-gray-300 bg-gray-100 px-8 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 sm:px-10 sm:py-2.5 sm:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="mb-2 block text-left text-sm font-medium text-dark text-primary dark:text-white sm:text-base">
                      University
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-3 sm:h-5 sm:w-5" />
                      <input
                        type="text"
                        value={formData.university}
                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                        placeholder="e.g., University of Mumbai"
                        className="w-full rounded border border-gray-300 bg-gray-100 px-8 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 sm:px-10 sm:py-2.5 sm:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="mb-2 block text-left text-sm font-medium text-dark text-primary dark:text-white sm:text-base">
                      Gender
                    </label>
                    <div className="relative">
                      <Users className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-3 sm:h-5 sm:w-5" />
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full rounded border border-gray-300 bg-gray-100 px-8 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 sm:px-10 sm:py-2.5 sm:text-base"
                        required
                      >
                        <option value="" disabled>Select your gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="mb-2 block text-left text-sm font-medium text-dark text-primary dark:text-white sm:text-base">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Eye className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-3 sm:h-5 sm:w-5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Re-enter your password"
                        className="w-full rounded border border-gray-300 bg-gray-100 px-8 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 sm:px-10 sm:py-2.5 sm:text-base"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:gap-4">
                <Button
                  type="button"
                  onClick={onBack}
                  variant="outline"
                  className="w-full space-x-1 rounded border-blue-500 py-4 text-sm text-blue-600 transition-all hover:bg-blue-50 hover:shadow-lg dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30 sm:space-x-2 sm:py-6 sm:text-base"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Back</span>
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full space-x-1 rounded bg-blue-600 py-4 text-sm text-white transition-all hover:bg-blue-700 hover:shadow-lg dark:bg-blue-500 dark:hover:bg-blue-600 sm:space-x-2 sm:py-6 sm:text-base"
                >
                  <span>Register</span>
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Info */}
        <div className="hidden bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white lg:block lg:w-1/2 lg:p-8 xl:p-10">
          <div className="relative h-full">
            {/* Decorative elements */}
            <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-white/10" />

            <div className="relative space-y-8">
              <h3 className="flex items-center text-xl font-bold lg:text-2xl">
                <Sparkles className="mr-3 h-6 w-6" />
                Test Guidelines
              </h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <BookOpen className="h-6 w-6 shrink-0" />
                  <div>
                    <h4 className="mb-1 font-semibold lg:mb-2">Test Format</h4>
                    <p className="text-sm text-white/80 lg:text-base">Multiple-choice questions designed to evaluate your analytical and problem-solving skills.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Rocket className="h-6 w-6 shrink-0" />
                  <div>
                    <h4 className="mb-1 font-semibold lg:mb-2">Time Management</h4>
                    <p className="text-sm text-white/80 lg:text-base">The test has a fixed duration - plan your time wisely for each section.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 shrink-0" />
                  <div>
                    <h4 className="mb-1 font-semibold lg:mb-2">Test Duration</h4>
                    <p className="text-sm text-white/80 lg:text-base">60-minute comprehensive assessment covering various aptitude areas.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <AlertTriangle className="h-6 w-6 shrink-0" />
                  <div>
                    <h4 className="mb-1 font-semibold lg:mb-2">Browser Rules</h4>
                    <p className="text-sm text-white/80 lg:text-base">Switching tabs or windows during the test will result in automatic submission.</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded bg-white/10 p-4 lg:mt-6 lg:p-6">
                <p className="text-sm italic text-white/90 lg:text-base">
                  Register now to access your aptitude test. Make sure to have a stable internet connection before starting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};