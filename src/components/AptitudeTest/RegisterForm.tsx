"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
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
    college: "",
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
    const { name, email, phone, degree, college, gender, password, confirmPassword } = formData;
    if (!name || !email || !phone || !degree || !college || !gender || !password || !confirmPassword) {
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
        college,
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
    <section className="dark:via-gray-850 relative z-10 flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white pt-36 dark:from-gray-800 dark:to-gray-800 lg:pb-16 lg:pt-[60px]">
      <div className="container mx-auto px-4">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <Card className="mx-auto max-w-[700px] rounded bg-white px-4 py-8 shadow-three dark:bg-gray-800 sm:p-[40px] md:p-10">
              <div className="text-center">
                <h2 className="mb-3 text-center text-xl font-bold text-black dark:text-white sm:text-2xl md:text-3xl">
                  Register
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <div className="mb-4">
                        <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter your email"
                          className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                          Degree
                        </label>
                        <input
                          type="text"
                          value={formData.degree}
                          onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
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
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Enter your password"
                          className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-10"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="mb-4">
                        <label className="mb-2 block text-left text-base font-medium text-dark text-primary dark:text-white">
                          College
                        </label>
                        <input
                          type="text"
                          value={formData.college}
                          onChange={(e) => setFormData({ ...formData, college: e.target.value })}
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
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter your phone number"
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
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="Confirm your password"
                          className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-10"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                        disabled={isLoading}
                        className="w-full rounded bg-blue-600 px-6 py-6 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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