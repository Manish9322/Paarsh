"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResetPasswordMutation } from '../../services/api';

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromParams = searchParams.get('email') || '';

  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    otp: Yup.string().matches(/^\d{6}$/, 'OTP must be exactly 6 digits').required('OTP is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain uppercase, lowercase, number, and special character'
      )
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const formik = useFormik({
    initialValues: {
      email: emailFromParams,
      otp: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await resetPassword({
          email: values.email,
          password: values.password,
          otp: values.otp,
        }).unwrap();
        setIsSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      } catch (err) {
        console.error('Error resetting password:', err);
      }
    },
  });

  if (isSuccess) {
    return (
      <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[60px]">
        <div className="container mx-auto px-4">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="mx-auto max-w-[700px] rounded bg-white px-4 py-8 shadow-three dark:bg-dark sm:p-[40px] md:p-[60px]">
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-black dark:text-white sm:text-2xl md:text-3xl">
                    Password Reset Successfully!
                  </h3>
                  <p className="mb-4 text-base font-medium text-body-color">
                    Your password has been updated. Redirecting to login...
                  </p>
                  <Link
                    href="/login"
                    className="w-full rounded bg-blue-600 px-6 py-3 text-base text-white transition hover:bg-black"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
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
  }

  return (
    <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[60px]">
      <div className="container mx-auto px-4">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="mx-auto max-w-[700px] rounded bg-white px-4 py-8 shadow-three dark:bg-dark sm:p-[40px] md:p-[60px]">
              <div className="mb-3 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-gray-700">
                  <svg className="h-6 w-6 text-blue-600 dark:text-body-color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold text-black dark:text-white sm:text-2xl md:text-3xl">
                  Reset Your Password
                </h3>
                <p className="mb-4 text-base font-medium text-body-color">
                  Enter the verification code and your new password.
                </p>
              </div>

              <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-base font-medium text-primary text-dark dark:text-white">
                      Your Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="No Need To Change"
                      readOnly
                      className="w-full rounded border dark:border-none border-gray-300 bg-gray-100 px-4 py-2.5 text-base text-dark focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white cursor-not-allowed"
                      {...formik.getFieldProps('email')}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="mx-1 mt-2 text-sm text-red-500">{formik.errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-medium text-primary text-dark dark:text-white">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      name="otp"
                      id="otp"
                      placeholder="Enter OTP Here"
                      maxLength={6}
                      className="w-full rounded border dark:border-none border-gray-300 bg-gray-100 px-4 py-2.5 text-base text-dark focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      {...formik.getFieldProps('otp')}
                    />
                    {formik.touched.otp && formik.errors.otp && (
                      <p className="mx-1 mt-2 text-sm text-red-500">{formik.errors.otp}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="relative">
                    <label className="mb-2 block text-base font-medium text-primary text-dark dark:text-white">
                      New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="password"
                      placeholder="Enter Password Here"
                      className="w-full rounded border border-gray-300 dark:border-none bg-gray-100 px-4 py-2.5 text-base text-dark focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      {...formik.getFieldProps('password')}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-11"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {formik.touched.password && formik.errors.password && (
                      <p className="mx-1 mt-2 text-sm text-red-500">{formik.errors.password}</p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="mb-2 block text-base font-medium text-primary text-dark dark:text-white">
                      Confirm Password
                    </label>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      id="confirmPassword"
                      placeholder="Confirm Password"
                      className="w-full rounded border border-gray-300 dark:border-none bg-gray-100 px-4 py-2.5 text-base text-dark focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      {...formik.getFieldProps('confirmPassword')}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-11"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                      <p className="mx-1 mt-2 text-sm text-red-500">{formik.errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {error && (
                  <p className="text-center text-sm text-red-500">{error?.data?.error || 'Failed to reset password'}</p>
                )}

                <div className="w-full">
                  <button
                    type="submit"
                    className={`mb-4 w-full rounded px-6 py-3 text-base text-white transition ${
                      isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-black'
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Resetting...
                      </span>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </div>

                <p className="text-center text-base font-medium text-body-color">
                  Remember your password ?{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    Back to Login
                  </Link>
                </p>
              </form>
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
        </div>
      </section>
    );
};

export default ResetPasswordPage;