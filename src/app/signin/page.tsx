"use client";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useFormik } from "formik";
import { useState ,useEffect} from "react";
import { resetForm, setAuthData } from "../../lib/slices/userAuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoginMutation } from "@/services/api";
import { selectRootState } from "@/lib/store";
import { signInValidationSchema } from "../../lib/validationSchema"; // ✅ FIXED Validation Schema Import

const SigninPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [_LOGIN] = useLoginMutation();
  const loginForm = useSelector(
    (state) => selectRootState(state).userAuth.forms,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check if user is already authenticated and redirect if needed
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && !isRedirecting) {
      router.push("/");
    }
  }, [router, isRedirecting]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: signInValidationSchema, // ✅ FIXED SCHEMA
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        
        const response = await _LOGIN(values).unwrap();
        console.log("Login response:", response);

        if (response?.success) {
          const { accessToken, refreshToken, user } = response?.data;
          console.log("Setting auth data:", { accessToken, refreshToken, user });
          
          // Show success toast
          toast.success("Login Successful", { 
            description: response?.message || "Welcome back!",
            duration: 3000,
          
          });
          
          // Store tokens in localStorage
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);

          // Update Redux state
          dispatch(setAuthData({ accessToken, refreshToken, user }));
          
          // Reset form
          dispatch(resetForm({ formName: "loginForm" }));

          // Get redirect URL from query parameter, fallback to response.data.redirect, then /userdashboard
        const redirect = searchParams.get('redirect');
        const redirectUrl = redirect
          ? decodeURIComponent(redirect)
          : response?.data?.redirect || '/userdashboard';

        // Validate redirectUrl to ensure it's a safe internal path
        const isValidRedirect = redirectUrl.startsWith('/');
          
          // Delay navigation to allow toast to be visible
          setTimeout(() => {
            setIsRedirecting(true);
            router.push(isValidRedirect ? redirectUrl : '/userdashboard');
          }, 2000);
        } else {
          toast.error("Login Failed", {
            description: response?.error || "An error occurred.",
            duration: 3000,
            position: "top-center"
          });
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Login Failed", {
          description: error?.data?.error || "An error occurred. Please try again.",
          duration: 3000,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });


  //  useEffect(() => {
  //     // Hide scrollbar
  //     document.body.style.overflow = "hidden";
  
  //     // Cleanup function to reset when component unmounts
  //     return () => {
  //       document.body.style.overflow = "auto";
  //     };
  //   }, []);

  return (
    <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[70px]">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="mx-auto max-w-[500px] rounded bg-white px-6 py-10 shadow-three dark:bg-dark sm:p-[60px]">
              <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                Login to your account
              </h3>
              <p className="mb-11 text-center text-base font-medium text-body-color">
                Login to your account for a faster checkout.
              </p>

              <form onSubmit={formik.handleSubmit}>
                {/* Email Field */}
                <div className="mb-8">
                  <label
                    htmlFor="email"
                    className="mb-3 block text-primary text-dark dark:text-white"
                  >
                    Your Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your Email"
                    className="border-stroke w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                    {...formik.getFieldProps("email")} // ✅ Simplified form handling
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="mx-1 mt-2 text-sm text-red-500">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="relative mb-8">
                  <label
                    htmlFor="password"
                    className="mb-3 block text-primary text-dark dark:text-white"
                  >
                    Your Password
                  </label>
                  <div className="relative w-full">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your Password"
                      className="border-stroke w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 pr-12 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                      {...formik.getFieldProps("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="mx-1 mt-2 text-sm text-red-500">
                      {formik.errors.password}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="mb-6">
                  <button
                    type="submit"
                    className="mb-4 w-full rounded transition bg-blue-600 px-6 py-3 text-white hover:bg-black"
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? "Processing..." : "Sign In"}
                  </button>
                </div>
              </form>

              <p className="text-center text-base font-medium text-body-color">
                Dont have an account?
                <Link href="/signup" className="text-primary hover:underline">
                  {" "}
                  Sign up
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
  );
};

export default SigninPage;
