"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminloginMutation } from "../../../services/api";
import { useDispatch } from "react-redux";
import { setAdminAuth, adminLogout } from "../../../lib/slices/authSlice";
import { toast } from "sonner";

const SigninPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [_ADMINLOGIN, { isLoading }] = useAdminloginMutation();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await _ADMINLOGIN({ email, password }).unwrap();
      console.log("response", response);

      if (response?.message === "Login successful") {
        dispatch(
          setAdminAuth({
            admin_access_token: response.admin_access_token, // ✅ Updated token key
            admin_refresh_token: response.admin_refresh_token, // ✅ Updated token key
            admin: response.admin, // ✅ Store admin details in Redux state
          }),
        );

        // ✅ Store only tokens in localStorage
        localStorage.setItem("admin_access_token", response.admin_access_token);
        localStorage.setItem(
          "admin_refresh_token",
          response.admin_refresh_token,
        );

        toast.success("Login successful");
        router.push("/admin");
      } else {
        toast.error(response?.error || "Login failed");
      }
    } catch (error) {
      console.error("Login Error:", error);

      if (error?.status === 401) {
        toast.error("Invalid credentials. Please try again.");
      } else if (error?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <section className="relative z-10 flex min-h-screen items-center justify-center p-6">
      <div className="mx-auto max-w-[500px] rounded-lg bg-white px-6 py-10 shadow-lg dark:bg-dark sm:p-[60px]">
        <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
          Admin Sign In
        </h3>
        <p className="mb-6 text-center text-base font-medium text-body-color">
          Enter your credentials to access the dashboard.
        </p>

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-dark dark:text-white"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-md border px-4 py-3 focus:ring focus:ring-blue-300"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-dark dark:text-white"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-md border px-4 py-3 focus:ring focus:ring-blue-300"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-700 px-4 py-3 text-white transition duration-300 hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
      <div className="absolute -top-44 left-0 z-[-1]">
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
