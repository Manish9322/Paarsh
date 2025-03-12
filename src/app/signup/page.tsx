"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { signUpValidationSchema } from "../../lib/validationSchema";
import { useFormik } from "formik";
import { Eye, EyeOff } from "lucide-react";
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
  const ref = param.get("ref");


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
      referralCode: "",
      acceptTerms: false,
    },
    validationSchema: signUpValidationSchema,
    onSubmit: async (values) => {
      try {
        const response = await _SIGNUP(values).unwrap();
        if (response?.success) {
          const { accessToken, refreshToken, user } = response?.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);

          dispatch(setAuthData({ accessToken, refreshToken, user }));
          toast.success("Registration Successfully", {
            description: response?.message,
          });
          dispatch(resetForm({ formName: "signupForm" }));
          router.push(response?.data?.redirect || `/userdashboard`);
        } else {
          toast.error("Registration Failed", {
            description: response?.error || "An error occurred.",
          });
        }
        dispatch(setAuthData(response)); // Set authentication state
        dispatch(resetForm({ formName: "signupForm" })); // Reset the form
      } catch (err) {
        console.error("Signup failed:", err);
      }
    },
  });

  return (
    <>
      <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[60px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="mx-auto max-w-[700px] rounded bg-white px-6 py-10 shadow-three dark:bg-dark sm:p-[60px]">
                <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                  Create your account
                </h3>

                <form
                  onSubmit={formik.handleSubmit}
                  className="grid grid-cols-1 gap-6 md:grid-cols-2"
                >
                  {/* Left Section */}
                  <div>
                    <div className="mb-4">
                      <label className="mb-2 block text-primary text-dark dark:text-white">
                        Full Name
                      </label>
                      <input
                        type="text"
                        {...formik.getFieldProps("name")}
                        placeholder="Enter your full name"
                        onInput={(e) => {
                          const input = e.target as HTMLInputElement;
                          input.value = input.value.replace(/[^a-zA-Z\s]/g, ""); // Allow only letters and spaces
                        }}
                        className="w-full rounded border bg-gray-100 px-6 py-3 text-sm focus:border-blue-500 dark:bg-gray-800"
                      />
                      {formik.touched.name && formik.errors.name && (
                        <p className="mx-1 mt-2 text-sm text-red-500">
                          {formik.errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                      <label className="mb-2 block text-primary text-dark dark:text-white">
                        Work Email
                      </label>
                      <input
                        type="email"
                        {...formik.getFieldProps("email")}
                        placeholder="Enter your Email"
                        className="w-full rounded border bg-gray-100 px-6 py-3 text-sm focus:border-blue-500 dark:bg-gray-800"
                      />
                      {formik.touched.email && formik.errors.email && (
                        <p className="mx-1 mt-2 text-sm text-red-500">
                          {formik.errors.email}
                        </p>
                      )}
                    </div>

                    {/* Referral Code */}
                    <div>
                      <label className="mb-2 block text-primary text-dark dark:text-white">
                        Referral Code (Optional)
                      </label>
                      <input
                        type="text"
                        {...formik.getFieldProps("referralCode")}
                        placeholder="Enter Referral Code"
                        className="w-full rounded border bg-gray-100 px-6 py-3 text-sm focus:border-blue-500 dark:bg-gray-800"
                        disabled={!!ref} // Disable if referral code is present
                      />
                    </div>
                  </div>

                  {/* Right Section */}
                  <div>
                    {/* Password */}
                    <div className="relative mb-4">
                      <label className="mb-2 block text-primary text-dark dark:text-white">
                        Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        {...formik.getFieldProps("password")}
                        placeholder="Enter your password"
                        className="w-full rounded border bg-gray-100 px-6 py-3 text-sm focus:border-blue-500 dark:bg-gray-800"
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
                      <label className="mb-2 block text-primary text-dark dark:text-white">
                        Confirm Password
                      </label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        {...formik.getFieldProps("confirmPassword")}
                        placeholder="Confirm your password"
                        className="w-full rounded border bg-gray-100 px-6 py-3 text-sm focus:border-blue-500 dark:bg-gray-800"
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
                    <div className="">
                      <label className="mb-2 block text-primary text-dark dark:text-white">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        {...formik.getFieldProps("mobile")}
                        placeholder="Enter 10-digit number"
                        maxLength={10} // Prevents more than 10 digits
                        onInput={(e) => {
                          const input = e.target as HTMLInputElement; // Type assertion
                          input.value = input.value.replace(/\D/g, ""); // Remove non-numeric characters
                        }}
                        className="w-full rounded border bg-gray-100 px-6 py-3 text-sm focus:border-blue-500 dark:bg-gray-800"
                      />
                      {formik.touched.mobile && formik.errors.mobile && (
                        <p className="mx-1 mt-2 text-sm text-red-500">
                          {formik.errors.mobile}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Terms & Submit */}
                  <div className="col-span-2">
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
                          Paarsh Edus
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
                      className="mb-4 w-full rounded transition bg-blue-600 px-6 py-3 text-white hover:bg-black"
                    >
                      Create Account
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
