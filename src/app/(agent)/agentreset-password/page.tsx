"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useResetAgentPasswordMutation } from "@/services/api";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const params = useSearchParams();
  const router = useRouter();
  const resetToken = params?.get("token");
  const email = params?.get("email");
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetAgentPassword, { isLoading, error }] = useResetAgentPasswordMutation();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), undefined], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const formik = useFormik({
    initialValues: { 
      email: email || '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema,
  onSubmit: async (values) => {
  try {
    const response = await resetAgentPassword({ 
      email: values.email, 
      resetToken, 
      newPassword: values.newPassword 
    }).unwrap();
    
    if (response.success) {
      toast.success(response.message || "Password reset successfully");
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/admin/signin");
      }, 3000);
    } else {
      toast.error(response.message || "Something went wrong");
    }
  } catch (err) {
    const serverMessage =
      err?.data?.message || err?.data?.error || "Failed to reset password";
    toast.error(serverMessage);
    console.error("Reset password error:", err);
  }
},
  });

  if (isSuccess) {
    return (
      <section className="relative z-10 flex min-h-screen items-center justify-center p-3 sm:p-6">
        <div className="mx-auto w-full max-w-[500px] rounded-lg bg-white px-4 py-8 shadow-lg dark:bg-dark xs:px-5 xs:py-9 sm:p-[40px] md:p-[60px]">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-bold text-black dark:text-white sm:mb-3 sm:text-2xl md:text-3xl">
              Password Reset Successfully!
            </h3>
            <p className="mb-8 text-sm text-body-color sm:mb-6 sm:text-base">
              Your password has been updated. Redirecting to login...
            </p>
            <Link
              href="/admin/signin"
              className="inline-block h-10 w-full rounded-md bg-blue-700 mt-6 px-4 py-2 text-sm text-white transition duration-300 hover:bg-blue-600 sm:h-12 sm:py-3 sm:text-base text-center"
            >
              Go to Login
            </Link>
          </div>
        </div>
        <div className="absolute -top-44 left-0 z-[-1] w-full overflow-hidden">
          <svg
            width="100%"
            height="969"
            viewBox="0 0 1440 969"
            preserveAspectRatio="xMidYMid meet"
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
  }

  return (
    <section className="relative z-10 flex min-h-screen items-center justify-center p-3 sm:p-6">
      <div className="mx-auto w-full max-w-[500px] rounded bg-white px-4 py-8 shadow-lg dark:bg-dark xs:px-5 xs:py-9 sm:p-[40px] md:p-[60px]">
        <div className="text-center mb-4 sm:mb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-gray-700">
            <svg className="h-6 w-6 text-blue-600 dark:text-body-color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-black dark:text-white sm:mb-3 sm:text-2xl md:text-3xl">
            Reset Password
          </h3>
          <p className="mb-4 text-sm text-body-color sm:mb-6 sm:text-base">
            Enter your new password to complete the reset process.
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Email Field - Readonly */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-base font-medium text-primary text-dark dark:text-white"
            >
              Email Address
            </label>
            <input
              type="email"
              readOnly
              className="w-full rounded border dark:border-none border-gray-300 bg-gray-50 px-4 py-2.5 text-base text-dark dark:bg-gray-600 dark:text-white cursor-not-allowed"
              {...formik.getFieldProps('email')}
            />
          </div>

          {/* New Password Field */}
          <div>
            <label
              htmlFor="newPassword"
              className="mb-2 block text-base font-medium text-primary text-dark dark:text-white"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter your new password"
                className="w-full rounded border dark:border-none border-gray-300 bg-gray-100 px-4 py-2.5 pr-12 text-base text-dark focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                {...formik.getFieldProps('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showNewPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {formik.touched.newPassword && formik.errors.newPassword && (
              <p className="mt-1 text-sm text-red-500">{formik.errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-base font-medium text-primary text-dark dark:text-white"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                className="w-full rounded border dark:border-none border-gray-300 bg-gray-100 px-4 py-2.5 pr-12 text-base text-dark focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                {...formik.getFieldProps('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{formik.errors.confirmPassword}</p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-500">{error?.data?.message || 'Failed to reset password'}</p>
            )}
          </div>

          <button
            type="submit"
            className="h-10 w-full mt-0 rounded bg-blue-700 px-4 py-2 text-sm text-white transition duration-300 hover:bg-blue-600 sm:h-12 sm:py-3 sm:text-base disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Resetting Password...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>

          <p className="text-center text-sm text-body-color sm:text-base">
            Remember your password?{' '}
            <Link href="/agent/signin" className="text-blue-500 dark:text-white hover:underline">
              Back to Login
            </Link>
          </p>
        </form>
      </div>
      <div className="absolute -top-44 left-0 z-[-1] w-full overflow-hidden">
        <svg
          width="100%"
          height="969"
          viewBox="0 0 1440 969"
          preserveAspectRatio="xMidYMid meet"
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

export default ResetPasswordPage;