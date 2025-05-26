"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
  setUpiId,
  saveUpiId,
  setAmount,
  setIsSubmitting,
  resetUpiId,
} from "../../../lib/slices/withdrawalSlice";
import { selectRootState } from "@/lib/store";
import {
  useCreateWithdrawalRequestMutation,
  useDeleteUserWithdrawalRequestMutation,
  useFetchUserQuery,
  useFetchUserWithdrawalRequestQuery,
} from "@/services/api";
import { toast, Toaster } from "sonner";
import { ArrowDownIcon } from "lucide-react";
import { a } from "framer-motion/dist/types.d-DDSxwf0n";


// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

// Main Wallet Component
export default function UserWallet() {
  const [view, setView] = useState("main"); // main, withdraw, pending, history
  const [showFullHistory, setShowFullHistory] = useState(false);

  const handleViewFullHistory = () => {
    setShowFullHistory(true);
  };

  const handleBack = () => {
    if (showFullHistory) {
      setShowFullHistory(false);
    } else {
      setView("main");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="bottom-right" richColors />
      {view === "main" && !showFullHistory ? (
        <MainWalletView
          setView={setView}
          handleViewFullHistory={handleViewFullHistory}
        />
      ) : view === "withdraw" ? (
        <WithdrawFundsView handleBack={handleBack} />
      ) : view === "pending" ? (
        <PendingTransactionsView handleBack={handleBack} />
      ) : (
        <FullTransactionHistoryView handleBack={handleBack} />
      )}
    </div>
  );
}

// Transaction Item Component
function TransactionItem({ transaction }) {
  const formattedDate = new Date(transaction.requestedAt).toLocaleDateString(
    "en-IN",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  return (
    <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
        <ArrowDownIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800 dark:text-white">
          Withdrawal to {transaction.upiId}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formattedDate} • {transaction.status}
        </p>
      </div>
      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
        -₹{transaction.amount.toFixed(2)}
      </p>
    </div>
  );
}

// Main Wallet View
function MainWalletView({ setView, handleViewFullHistory }) {
  const { data, isLoading, error } = useFetchUserWithdrawalRequestQuery(undefined);

  const withdrawals = data?.data?.withdrawals || [];

  const {data: userData } = useFetchUserQuery(undefined);

  const user = userData?.data;


  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Your Wallet
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your balance and withdrawals
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Pro Tip:</span> Ensure your UPI ID is
            valid for withdrawals
          </p>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
      >
        <motion.div variants={item} className="h-full">
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Current Balance
              </h2>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {user?.walletBalance ? `₹${user.walletBalance}` : "₹0.00"}
              </p>
            </div>
            <button
              onClick={() => setView("withdraw")}
              className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 text-center"
            >
              Withdraw Funds
            </button>
          </div>
        </motion.div>

        <motion.div variants={item} className="h-full">
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Pending Withdrawals
              </h2>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ₹
                {withdrawals
                  .filter((t) => t.status === "Pending")
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => setView("pending")}
              className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 text-center"
            >
              View Details
            </button>
          </div>
        </motion.div>
      </motion.div>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Recent Withdrawals
        </h1>
        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        ) : error ? (
          <p className="text-red-600 dark:text-red-400">
            Error loading withdrawals
          </p>
        ) : withdrawals.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            No recent withdrawals.
          </p>
        ) : (
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
            {withdrawals.slice(0, 5).map((transaction) => (
              <TransactionItem key={transaction._id} transaction={transaction} />
            ))}
          </div>
        )}
        <div className="mt-4 text-center">
          <button
            onClick={handleViewFullHistory}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Full Withdrawal History
          </button>
        </div>
      </div>
    </>
  );
}

// Withdraw Funds View
function WithdrawFundsView({ handleBack }) {
  const dispatch = useDispatch();
  const { hasAccountDetails, storedUpiId, upiId, amount, isSubmitting } =
    useSelector((state) => selectRootState(state).withdrawal);
  const [createWithdrawal] = useCreateWithdrawalRequestMutation();

  const handleSubmitUpi = (e) => {
    e.preventDefault();
    dispatch(saveUpiId(upiId));
  };

  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault();
    dispatch(setIsSubmitting(true));

    try {
      const response = await createWithdrawal({
        amount: parseFloat(amount),
        upiId: storedUpiId,
      }).unwrap();

      if (response.success) {
        toast.success(response.message);
        dispatch(setAmount(""));
        dispatch(resetUpiId());
      } else {
        toast.error(response.message || "Failed to process withdrawal");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error(
        error?.data?.message || "An error occurred during withdrawal"
      );
    } finally {
      dispatch(setIsSubmitting(false));
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Withdraw Funds
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Request a withdrawal from your wallet balance
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Pro Tip:</span> Ensure your UPI ID is
            valid before withdrawing
          </p>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 border border-gray-100 dark:border-gray-700"
      >
        <motion.div variants={item}>
          {!hasAccountDetails ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Add UPI ID
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Please provide your UPI ID to proceed with withdrawals.
              </p>
              <form onSubmit={handleSubmitUpi} className="space-y-4">
                <div>
                  <label
                    htmlFor="upiId"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    UPI ID
                  </label>
                  <input
                    type="text"
                    id="upiId"
                    value={upiId}
                    onChange={(e) => dispatch(setUpiId(e.target.value))}
                    className="mt-1 p-4 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                    placeholder="example@upi"
                    required
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-block bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-300 text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 text-center"
                  >
                    Save UPI ID
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Withdrawal Form
              </h2>
              <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Withdrawal Amount (₹)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => dispatch(setAmount(e.target.value))}
                    className="mt-1 p-4 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter amount"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    UPI ID
                  </label>
                  <p className="mt-1 text-gray-800 dark:text-white">
                    {storedUpiId}
                  </p>
                  <button
                    type="button"
                    onClick={() => dispatch(resetUpiId())}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    Change UPI ID
                  </button>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-block bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-300 text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 text-center ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? "Processing..." : "Withdraw"}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}

// Pending Transactions View
function PendingTransactionsView({ handleBack }) {
  const { data, isLoading, error } = useFetchUserWithdrawalRequestQuery(undefined);
  const withdrawals = data?.data?.withdrawals || [];
  const pendingWithdrawals = withdrawals.filter((t) => t.status === "Pending");

  const [_CANCEL_TRANSACTION] = useDeleteUserWithdrawalRequestMutation();

const handleCancelTransaction = async (id: any) => {
  try {
    const response = await _CANCEL_TRANSACTION(id).unwrap(); // throws on non-2xx status

    // If success is false, show specific message
    if (!response.success) {
      const message = response.message || "Failed to cancel the request. Please try again.";

      if (message === "Invalid input") {
        toast.error("Invalid request. Please try again.");
      } else if (message === "Withdrawal request not found") {
        toast.error("Request not found. It may have already been deleted.");
      } else if (message === "Cannot delete processed request") {
        toast.error("Cannot cancel this request as it has already been processed.");
      } else {
        toast.error(message);
      }

      return;
    }

    toast.success("Withdrawal request cancelled successfully.");
  } catch (err: any) {
    console.error("handleCancelTransaction error:", err);

    // Check if it's an API error and try to extract message
    const errorMessage = err?.data?.message || "Something went wrong. Please try again.";
    toast.error(errorMessage);
  }
};



  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Pending Withdrawals
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            View and manage your pending withdrawals
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Pro Tip:</span> Withdrawals may take
            up to 24 hours to process
          </p>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 border border-gray-100 dark:border-gray-700"
      >
        <motion.div variants={item}>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Pending Withdrawals
          </h2>
          {isLoading ? (
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          ) : error ? (
            <p className="text-red-600 dark:text-red-400">
              Error loading withdrawals
            </p>
          ) : pendingWithdrawals.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              No pending withdrawals at this time.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingWithdrawals.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                    <ArrowDownIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      Withdrawal to {transaction.upiId}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(transaction.requestedAt).toLocaleDateString(
                        "en-IN",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}{" "}
                      • {transaction.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                      -₹{transaction.amount.toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleCancelTransaction(transaction._id)}
                      className="text-red-600 dark:text-red-400 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleBack}
            className="inline-block bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-300"
          >
            Back
          </button>
        </div>
      </motion.div>
    </>
  );
}

// Full Transaction History View
function FullTransactionHistoryView({ handleBack }) {
  const { data, isLoading, error } = useFetchUserWithdrawalRequestQuery(undefined);
  const withdrawals = data?.data?.withdrawals || [];

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Full Withdrawal History
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            View all your withdrawal transactions
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Pro Tip:</span> Contact support for
            any withdrawal issues
          </p>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 border border-gray-100 dark:border-gray-700"
      >
        <motion.div variants={item}>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            All Withdrawals
          </h2>
          {isLoading ? (
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          ) : error ? (
            <p className="text-red-600 dark:text-red-400">
              Error loading withdrawals
            </p>
          ) : withdrawals.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              No withdrawals found.
            </p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((transaction) => (
                <TransactionItem
                  key={transaction._id}
                  transaction={transaction}
                />
              ))}
            </div>
          )}
        </motion.div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleBack}
            className="inline-block bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-300"
          >
            Back
          </button>
        </div>
      </motion.div>
    </>
  );
}