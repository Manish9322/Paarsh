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
  const [showConfirmation, setShowConfirmation] = useState(false);
const [loginData, setLoginData] = useState(null);

  // Check if user is already authenticated and redirect if needed
  // useEffect(() => {
  //   const accessToken = localStorage.getItem("accessToken");
  //   if (accessToken && !isRedirecting) {
  //     router.push("/");
  //   }
  // }, [router, isRedirecting]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: signInValidationSchema, // ✅ FIXED SCHEMA
    onSubmit: async (values, { setSubmitting }) => {
  try {
    setSubmitting(true);
    
    const response = await _LOGIN({
      email: values.email,
      password: values.password,
      forceLogin: false,
    }).unwrap();
    
    console.log("Login response:", response);
    
    if (response?.success) {
      const { accessToken, refreshToken, user, sessionId } = response?.data;
      console.log("Setting auth data:", { accessToken, refreshToken, user, sessionId });
      
      // Show success toast
      toast.success("Login Successful", {
        description: response?.message || "Welcome back!",
        duration: 3000,
      });
      
      // Store tokens in localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      
      // Update Redux state
      dispatch(setAuthData({ accessToken, refreshToken, user, sessionId }));
      
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
    
    // Check if it's a 409 conflict error (already logged in)
    if (error?.status === 409 && error?.data?.needsConfirmation) {
      // Show confirmation modal
      setShowConfirmation(true);
      setLoginData({ 
        email: values.email, 
        password: values.password 
      });
      
      toast.info("Account Already Active", {
        description: error?.data?.message || "This account is already logged in on another device.",
        duration: 4000,
      });
    } else {
      toast.error("Login Failed", {
        description: error?.data?.error || "An error occurred. Please try again.",
        duration: 3000,
      });
    }
  } finally {
    setSubmitting(false);
  }
},

  });

  // Add these helper functions for confirmation handling
const confirmForceLogin = async () => {
  if (loginData) {
    setShowConfirmation(false);
    
    try {
      const response = await _LOGIN({
        email: loginData.email,
        password: loginData.password,
        forceLogin: true, // This time with forceLogin = true
      }).unwrap();
      
      console.log("Force login response:", response);
      
      if (response?.success) {
        const { accessToken, refreshToken, user, sessionId } = response?.data;
        
        // Show success toast
        toast.success("Login Successful", {
          description: "Previous session ended. Welcome back!",
          duration: 3000,
        });
        
        // Store tokens in localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        
        // Update Redux state
        dispatch(setAuthData({ accessToken, refreshToken, user, sessionId }));
        
        // Reset form
        dispatch(resetForm({ formName: "loginForm" }));
        
        // Get redirect URL
        const redirect = searchParams.get('redirect');
        const redirectUrl = redirect
          ? decodeURIComponent(redirect)
          : response?.data?.redirect || '/userdashboard';
        
        const isValidRedirect = redirectUrl.startsWith('/');
        
        // Delay navigation
        setTimeout(() => {
          setIsRedirecting(true);
          router.push(isValidRedirect ? redirectUrl : '/userdashboard');
        }, 2000);
      }
    } catch (error) {
      console.error("Force login error:", error);
      toast.error("Login Failed", {
        description: error?.data?.error || "Failed to force login. Please try again.",
        duration: 3000,
      });
    }
    
    // Clear login data
    setLoginData(null);
  }
};

const cancelForceLogin = () => {
  setShowConfirmation(false);
  setLoginData(null);
  
  toast.info("Login Cancelled", {
    description: "Login process was cancelled.",
    duration: 2000,
  });
};


  //  useEffect(() => {
  //     // Hide scrollbar
  //     document.body.style.overflow = "hidden";
  
  //     // Cleanup function to reset when component unmounts
  //     return () => {
  //       document.body.style.overflow = "auto";
  //     };
  //   }, []);

return (
  <section className="relative z-10 overflow-hidden pb-8 pt-6 md:pb-20 lg:pb-4 lg:pt-[3rem]">
    <div className="container">
      <div className="-mx-4 flex flex-wrap">
        <div className="w-full px-4">
          <div className="mx-auto max-w-[500px] rounded bg-white px-6 py-10 shadow-three dark:bg-dark sm:p-[60px]">
            <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
              Welcome Back, Scholar
            </h3>
            <p className="mb-11 text-center text-base font-medium text-body-color">
              Access your learning dashboard to continue your academic journey.
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
                  {...formik.getFieldProps("email")}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="mx-1 mt-2 text-sm text-red-500">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="relative mb-6">
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

              {/* Forgot Password Link */}
              <div className="mb-6 text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary hover:underline hover:text-blue-700 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <div className="mb-6">
                <button
                  type="submit"
                  className="mb-4 w-full rounded  bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
            </form>

            <p className="text-center text-base font-medium text-body-color">
              New to our platform?
              <Link href="/signup" className="text-primary hover:underline ml-1">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    
    {/* Background SVG remains the same */}
    <div className="absolute left-0 top-[-12rem] z-[-1]">
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

    {/* Confirmation Modal remains the same */}
    {showConfirmation && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Already Logged In</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            This account is already logged in on another device. Do you want to continue and logout the other session?
          </p>
          
          <div className="flex space-x-3 justify-end">
            <button
              onClick={cancelForceLogin}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmForceLogin}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Yes, Continue
            </button>
          </div>
        </div>
      </div>
    )}
  </section>
);
};

export default SigninPage;
