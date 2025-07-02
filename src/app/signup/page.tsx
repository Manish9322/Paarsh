"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { signUpValidationSchema } from "../../lib/validationSchema";
import { useFormik } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { GoChevronLeft } from "react-icons/go";
import { useDispatch, useSelector } from "react-redux";
import { selectRootState } from "@/lib/store";
import { useSignupMutation } from "@/services/api";
import {
  resetForm,
  setAuthData,
  setSignupFormData,
} from "@/lib/slices/userAuthSlice";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const signupForm = useSelector(
    (state) => selectRootState(state).userAuth.forms,
  );
  const [_SIGNUP, { isLoading, error }] = useSignupMutation();

  const param = useSearchParams();
  const ref = param?.get("ref");

  useEffect(() => {
    // If referral code is provided in URL, set it in the form
    if (ref) {
      formik.setFieldValue("referralCode", ref);
    }
  }, [ref]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(setSignupFormData({ field: name, value }));
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      mobile: "",
      referralCode: ref || "",
      acceptTerms: false,
    },
    validationSchema: signUpValidationSchema,
    onSubmit: async (values) => {
      try {
        const response = await _SIGNUP({
          name: values.name,
          email: values.email,
          password: values.password,
          mobile: values.mobile,
          refferalCode: values.referralCode, // Note: Backend uses "refferalCode" with double 'f'
          acceptTerms: values.acceptTerms
        }).unwrap();

        if (response?.success) {
          const { accessToken, refreshToken, user } = response?.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);

          dispatch(setAuthData({ accessToken, refreshToken, user }));
          toast.success("Registration Successful", {
            description: response?.message,
          });
          dispatch(resetForm({ formName: "signupForm" }));
          router.push(response?.data?.redirect || `/`);
        } else {
          // This block handles when success is false but no error was thrown
          toast.error("Registration Failed", {
            description: response?.error || "An error occurred.",
          });
        }
      } catch (err) {
        console.error("Signup failed:", err);

        // Handle specific error cases from the backend
        if (err.status === 400) {
          const errorData = err.data;

          if (errorData?.error === "Email already registered") {
            toast.error("Email already registered", {
              description: "This email is already in use. Please login instead.",
              action: {
                label: "Login",
                onClick: () => router.push("/login")
              }
            });
            formik.setFieldError("email", "Email already registered");
          } else if (errorData?.error === "Invalid referral code.") {
            toast.error("Invalid Referral Code", {
              description: "The referral code you entered is not valid."
            });
            formik.setFieldError("referralCode", "Invalid referral code");
          } else if (errorData?.error === "Invalid email address") {
            toast.error("Invalid Email", {
              description: "Please enter a valid email address."
            });
            formik.setFieldError("email", "Invalid email address");
          } else if (errorData?.error?.includes("required")) {
            toast.error("Missing Information", {
              description: errorData.error
            });
          } else {
            // Generic error for other 400 errors
            toast.error("Registration Failed", {
              description: errorData?.error || "Please check your information and try again."
            });
          }
        } else {
          // Handle server errors (500) or network issues
          toast.error("Server Error", {
            description: "We're experiencing technical difficulties. Please try again later."
          });
        }
      }
    },
  });

  return (
    <>
      <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[60px]">
        <div className="container mx-auto px-4">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="mb-4 mx-auto max-w-[700px] ">
                <Link
                  href="/"
                  className="inline-flex items-center text-primary hover:text-blue-700 transition-colors"
                >
                  <GoChevronLeft size={22} className="mr-1" />
                  Back to Home
                </Link>
              </div>
              <div className="mx-auto max-w-[700px] rounded bg-white px-4 py-8 shadow-three dark:bg-dark sm:p-[40px] md:p-[60px]">
                <h3 className="mb-3 text-center text-xl font-bold text-black dark:text-white sm:text-2xl md:text-3xl">
                  Create your account
                </h3>

                <form
                  onSubmit={formik.handleSubmit}
                  className="flex flex-col gap-6"
                >
                  {/* Form Fields */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Left Section */}
                    <div>
                      <div className="mb-4">
                        <label className="mb-2 block text-base font-medium text-primary text-dark dark:text-white">
                          Full Name
                        </label>
                        <input
                          type="text"
                          {...formik.getFieldProps("name")}
                          placeholder="Enter your full name"
                          onInput={(e) => {
                            const input = e.target as HTMLInputElement;
                            input.value = input.value.replace(/[^a-zA-Z\s]/g, "");
                          }}
                          className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                        />
                        {formik.touched.name && formik.errors.name && (
                          <p className="mx-1 mt-2 text-sm text-red-500">
                            {formik.errors.name}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="mb-4">
                        <label className="mb-2 block text-base font-medium text-primary text-dark dark:text-white">
                          Work Email
                        </label>
                        <input
                          type="email"
                          {...formik.getFieldProps("email")}
                          placeholder="Enter your Email"
                          className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                        />
                        {formik.touched.email && formik.errors.email && (
                          <p className="mx-1 mt-2 text-sm text-red-500">
                            {formik.errors.email}
                          </p>
                        )}
                      </div>

                      {/* Referral Code */}
                      <div>
                        <label className="mb-2 block text-base font-medium text-primary text-dark dark:text-white">
                          Referral Code (Optional)
                        </label>
                        <input
                          type="text"
                          {...formik.getFieldProps("referralCode")}
                          placeholder="Enter Referral Code"
                          className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                          disabled={!!ref}
                        />
                        {formik.touched.referralCode && formik.errors.referralCode && (
                          <p className="mx-1 mt-2 text-sm text-red-500">
                            {formik.errors.referralCode}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Section */}
                    <div>
                      {/* Password */}
                      <div className="relative mb-4">
                        <label className="mb-2 block text-base font-medium text-primary text-dark dark:text-white">
                          Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          {...formik.getFieldProps("password")}
                          placeholder="Enter your password"
                          className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
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
                        {formik.touched.password && formik.errors.password && (
                          <p className="mx-1 mt-2 text-sm text-red-500">
                            {formik.errors.password}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="relative mb-4">
                        <label className="mb-2 block text-base font-medium text-primary text-dark dark:text-white">
                          Confirm Password
                        </label>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          {...formik.getFieldProps("confirmPassword")}
                          placeholder="Confirm your password"
                          className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
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
                        {formik.touched.confirmPassword &&
                          formik.errors.confirmPassword && (
                            <p className="mx-1 mt-2 text-sm text-red-500">
                              {formik.errors.confirmPassword}
                            </p>
                          )}
                      </div>

                      {/* Mobile */}
                      <div>
                        <label className="mb-2 block text-base font-medium text-primary text-dark dark:text-white">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          {...formik.getFieldProps("mobile")}
                          placeholder="Enter 10-digit number"
                          maxLength={10}
                          onInput={(e) => {
                            const input = e.target as HTMLInputElement;
                            input.value = input.value.replace(/\D/g, "");
                          }}
                          className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800"
                        />
                        {formik.touched.mobile && formik.errors.mobile && (
                          <p className="mx-1 mt-2 text-sm text-red-500">
                            {formik.errors.mobile}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Terms & Submit */}
                  <div className="w-full">
                    <div className="mb-6 items-center">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        onChange={formik.handleChange}
                        checked={formik.values.acceptTerms}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        By creating account you agree the{" "}
                        <span className="font-medium text-blue-600">
                          {" "}
                          Paarsh Edu&apos;s {" "}
                        </span>
                        <a href="#0">Terms and Conditions</a>, and our
                        <a href="#0"> Privacy Policy</a>
                      </span>
                      {formik.errors.acceptTerms && (
                        <p className="mx-1 mt-2 text-sm text-red-500">
                          {formik.errors.acceptTerms}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`mb-4 w-full rounded transition px-6 py-3 shadow-lg text-white ${isLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-black"
                        }`}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </button>
                  </div>
                </form>
                <p className="text-center text-base font-medium text-body-color">
                  Already have account?{" "}
                  <Link href="/signin" className="text-primary hover:underline">
                    Login
                  </Link>
                </p>
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
    </>
  );
};

export default SignupPage;
