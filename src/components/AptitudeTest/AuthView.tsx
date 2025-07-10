"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface AuthViewProps {
  onShowLogin: () => void;
  onShowRegister: () => void;
  testName: string;
}

export const AuthView: React.FC<AuthViewProps> = ({ onShowLogin, onShowRegister, testName }) => (
  <section className="dark:via-gray-850 flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-gray-50 to-white py-24 dark:from-gray-800 dark:to-gray-800">
    <Card className="w-full max-w-lg border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="text-center">
        <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to {testName || "Aptitude Test"}
        </h2>
        <p className="mb-8 text-gray-600 dark:text-gray-300">
          Please log in or register to start the test.
        </p>
        <div className="flex flex-col gap-4">
          <Button
            onClick={onShowLogin}
            className="group relative inline-flex items-center gap-2 rounded bg-blue-600 px-6 py-6 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <span className="flex items-center gap-2">
              Log In
              <ArrowRight className="h-4 w-4" />
            </span>
          </Button>
          <Button
            onClick={onShowRegister}
            variant="outline"
            className="group rounded border-blue-500 px-6 py-6 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <span className="flex items-center gap-2">
              Register
              <ArrowRight className="h-4 w-4" />
            </span>
          </Button>
        </div>
      </div>
    </Card>
  </section>
);