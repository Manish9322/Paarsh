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
    <section className="flex h-screen items-center justify-center bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800">
      <div className="relative mx-auto flex max-w-6xl overflow-hidden rounded bg-white shadow-xl dark:bg-gray-800">
        {/* Left Side - Register Form */}
        <div className="w-full p-8 md:w-1/2 md:p-10">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Register for Test
            </h2>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Complete Your Assessment Registration
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="relative">
                    <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="w-full rounded border border-gray-300 bg-gray-100 px-10 py-2.5 text-base transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter your email address"
                        className="w-full rounded border border-gray-300 bg-gray-100 px-10 py-2.5 text-base transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter your mobile number"
                        className="w-full rounded border border-gray-300 bg-gray-100 px-10 py-2.5 text-base transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                      Password
                    </label>
                    <div className="relative">
                      <Eye className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Create a secure password"
                        className="w-full rounded border border-gray-300 bg-gray-100 px-10 py-2.5 text-base transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                      Degree
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        placeholder="e.g., BE in Information Technology"
                        className="w-full rounded border border-gray-300 bg-gray-100 px-10 py-2.5 text-base transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                      University
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.university}
                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                        placeholder="e.g., University of Mumbai"
                        className="w-full rounded border border-gray-300 bg-gray-100 px-10 py-2.5 text-base transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                      Gender
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full rounded border border-gray-300 bg-gray-100 px-10 py-2.5 text-base transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
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
                    <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Eye className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Re-enter your password"
                        className="w-full rounded border border-gray-300 bg-gray-100 px-10 py-2.5 text-base transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
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
                  <span>Register</span>
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
                Test Guidelines
              </h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <BookOpen className="h-6 w-6 shrink-0" />
                  <div>
                    <h4 className="mb-2 font-semibold">Test Format</h4>
                    <p className="text-white/80">Multiple-choice questions designed to evaluate your analytical and problem-solving skills.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Rocket className="h-6 w-6 shrink-0" />
                  <div>
                    <h4 className="mb-2 font-semibold">Time Management</h4>
                    <p className="text-white/80">The test has a fixed duration - plan your time wisely for each section.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 shrink-0" />
                  <div>
                    <h4 className="mb-2 font-semibold">Test Duration</h4>
                    <p className="text-white/80">60-minute comprehensive assessment covering various aptitude areas.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <AlertTriangle className="h-6 w-6 shrink-0" />
                  <div>
                    <h4 className="mb-2 font-semibold">Browser Rules</h4>
                    <p className="text-white/80">Switching tabs or windows during the test will result in automatic submission.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded bg-white/10 p-6">
                <p className="italic text-white/90">
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