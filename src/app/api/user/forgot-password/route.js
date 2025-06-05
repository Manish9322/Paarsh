"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useForgotPasswordMutation } from '../../services/api';

const ForgotPasswordPage = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
  });

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await forgotPassword({ email: values.email }).unwrap();
        setIsSuccess(true);
      } catch (err) {
        console.error('Failed to send OTP:', err);
      }
    },
  });

  if (isSuccess) {
    return (
      <section className="relative flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800 animate-card-pop">
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                OTP Sent Successfully!
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Check your email for the verification code.
              </p>
              <Link
                href={`/reset-password?email=${encodeURIComponent(formik.values.email)}`}
                className="inline-block w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Enter OTP
              </Link>
            </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes cardPop {
            0% { opacity: 0; transform: scale(0.95) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-card-pop {
            animation: cardPop 0.4s ease-out;
          }
        `}</style>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800 animate-card-pop">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Forgot Password
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Enter your email to receive a verification code.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="email"
                name="email"
                id="email"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 peer"
                placeholder=" "
                {...formik.getFieldProps('email')}
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2 peer-focus:text-sm peer-focus:text-blue-600 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-sm peer-[&:not(:placeholder-shown)]:text-blue-600 dark:peer-focus:text-blue-400 dark:peer-[&:not(:placeholder-shown)]:text-blue-400"
              >
                Email Address
              </label>
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-500">{formik.errors.email}</p>
              )}
              {error && (
                <p className="mt-1 text-sm text-red-500">{error?.data?.error || 'Failed to send OTP'}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending OTP...
                </span>
              ) : (
                'Send OTP'
              )}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-300">
              Remember your password?{' '}
              <Link href="/login" className="text-blue-500 hover:underline font-medium">
                Back to Login
              </Link>
            </p>
          </form>
        </div>
      </div>
      <style jsx>{`
        @keyframes cardPop {
          0% { opacity: 0; transform: scale(0.95) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-card-pop {
          animation: cardPop 0.4s ease-out;
        }
      `}</style>
    </section>
  );
};

export default ForgotPasswordPage;