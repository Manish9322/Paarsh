"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const transactionData = [
  {
    id: 1,
    type: "Deposit",
    amount: "+₹50.00",
    date: "2025-04-27",
    status: "Completed",
    description: "Added funds via Credit Card",
  },
  {
    id: 2,
    type: "Purchase",
    amount: "-₹29.99",
    date: "2025-04-26",
    status: "Completed",
    description: "Course: Advanced JavaScript",
  },
  {
    id: 3,
    type: "Refund",
    amount: "+₹15.00",
    date: "2025-04-25",
    status: "Completed",
    description: "Refund for canceled course",
  },
  {
    id: 4,
    type: "Purchase",
    amount: "-₹29.99",
    date: "2025-04-26",
    status: "Completed",
    description: "Course: Advanced JavaScript",
  },
  {
    id: 5,
    type: "Refund",
    amount: "+₹15.00",
    date: "2025-04-25",
    status: "Completed",
    description: "Refund for canceled course",
  },
];

const referralData = [
  {
    id: 1,
    friendName: "John Doe",
    date: "2025-04-20",
    status: "Accepted",
    reward: "₹10.00",
  },
  {
    id: 2,
    friendName: "Jane Smith",
    date: "2025-04-18",
    status: "Pending",
    reward: "₹0.00",
  },
  {
    id: 3,
    friendName: "Alice Johnson",
    date: "2025-04-15",
    status: "Accepted",
    reward: "₹10.00",
  },
];

const paymentMethods = [
  {
    id: 1,
    type: "Visa",
    lastFour: "1234",
    expiry: "12/26",
  },
  {
    id: 2,
    type: "MasterCard",
    lastFour: "5678",
    expiry: "09/25",
  },
];

const pendingTransactions = [
  {
    id: 1,
    type: "Purchase",
    amount: "-₹49.99",
    date: "2025-04-28",
    status: "Pending",
    description: "Course: React Advanced",
    canCancel: true,
  },
  {
    id: 2,
    type: "Withdrawal",
    amount: "-₹100.00",
    date: "2025-04-27",
    status: "Pending",
    description: "Bank Transfer",
    canCancel: false,
  },
];

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
  const [view, setView] = useState("main"); // main, withdraw, referral, payment, pending
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
      {view === "main" && !showFullHistory ? (
        <MainWalletView
          setView={setView}
          handleViewFullHistory={handleViewFullHistory}
        />
      ) : view === "withdraw" ? (
        <WithdrawFundsView handleBack={handleBack} />
      ) : view === "referral" ? (
        <ReferralProgramView handleBack={handleBack} />
      ) : view === "payment" ? (
        <PaymentMethodsView handleBack={handleBack} />
      ) : view === "pending" ? (
        <PendingTransactionsView handleBack={handleBack} />
      ) : (
        <FullTransactionHistoryView handleBack={handleBack} />
      )}
    </div>
  );
}

// Main Wallet View
function MainWalletView({ setView, handleViewFullHistory }) {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Your Wallet
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your balance and transactions
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Pro Tip:</span> Add funds to enroll in premium courses
          </p>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <motion.div variants={item} className="h-full">
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Current Balance
              </h2>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ₹125.50
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
                Pending Transactions
              </h2>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ₹0.00
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

        <motion.div variants={item} className="h-full">
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Referral Rewards
              </h2>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ₹20.00
              </p>
            </div>
            <button
              onClick={() => setView("referral")}
              className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 text-center"
            >
              Invite Friends
            </button>
          </div>
        </motion.div>

        <motion.div variants={item} className="h-full">
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Payment Methods
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                2 Cards Linked
              </p>
            </div>
            <button
              onClick={() => setView("payment")}
              className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 text-center"
            >
              Manage Cards
            </button>
          </div>
        </motion.div>
      </motion.div>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Transaction History
        </h1>
        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
          {transactionData.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                {transaction.type === "Deposit" && (
                  <ArrowUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
                {transaction.type === "Purchase" && (
                  <ArrowDownIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                {transaction.type === "Refund" && (
                  <ArrowUpIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {transaction.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {transaction.date} • {transaction.status}
                </p>
              </div>
              <p
                className={`text-sm font-semibold ${
                  transaction.type === "Purchase"
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {transaction.amount}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={handleViewFullHistory}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Full Transaction History
          </button>
        </div>
      </div>
    </>
  );
}

// Withdraw Funds View
function WithdrawFundsView({ handleBack }) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Placeholder for backend API call to process withdrawal
    setTimeout(() => {
      alert(`Withdrawal of ₹${amount} to ${paymentMethod} initiated!`);
      setIsSubmitting(false);
      setAmount("");
    }, 1000);
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
            <span className="font-semibold">Pro Tip:</span> Ensure your payment method is verified before withdrawing
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
            Withdrawal Form
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Withdrawal Amount (₹)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter amount"
                min="1"
                step="0.01"
                required
              />
            </div>
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment Method
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="card">Credit/Debit Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="upi">UPI</option>
              </select>
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
        </motion.div>
      </motion.div>
    </>
  );
}

// Referral Program View
function ReferralProgramView({ handleBack }) {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Referral Program
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Invite friends and earn rewards
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Pro Tip:</span> Share your unique referral link to maximize rewards
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
            Referral History
          </h2>
          <div className="space-y-3">
            {referralData.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                  <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {referral.friendName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {referral.date} • {referral.status}
                  </p>
                </div>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {referral.reward}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div variants={item} className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Your Referral Link
          </h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value="https://example.com/referral/abc123"
              readOnly
              className="flex-1 rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white p-2"
            />
            <button
              onClick={() => navigator.clipboard.writeText("https://example.com/referral/abc123")}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300"
            >
              Copy
            </button>
          </div>
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

// Payment Methods View
function PaymentMethodsView({ handleBack }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handleAddCard = (e) => {
    e.preventDefault();
    // Placeholder for backend API call to add card
    alert(`Card ending in ${cardNumber.slice(-4)} added!`);
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setShowAddForm(false);
  };

  const handleRemoveCard = (id) => {
    // Placeholder for backend API call to remove card
    alert(`Card with ID ${id} removed!`);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Payment Methods
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your linked cards
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Pro Tip:</span> Keep your payment methods updated for seamless transactions
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Linked Cards
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300"
            >
              {showAddForm ? "Cancel Add" : "Add New Card"}
            </button>
          </div>
          <div className="space-y-3">
            {paymentMethods.map((card) => (
              <div
                key={card.id}
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                  <CreditCardIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {card.type} ending in {card.lastFour}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Expires {card.expiry}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveCard(card.id)}
                  className="text-red-600 dark:text-red-400 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {showAddForm && (
          <motion.div variants={item} className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Add New Card
            </h2>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Card Number
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    id="expiry"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                    placeholder="123"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="inline-block bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300"
                >
                  Add Card
                </button>
              </div>
            </form>
          </motion.div>
        )}
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

// Pending Transactions View
function PendingTransactionsView({ handleBack }) {
  const handleCancelTransaction = (id) => {
    // Placeholder for backend API call to cancel transaction
    alert(`Transaction ${id} cancellation requested!`);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Pending Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            View and manage your pending transactions
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Pro Tip:</span> Some transactions may take up to 24 hours to process
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
            Pending Transactions
          </h2>
          <div className="space-y-3">
            {pendingTransactions.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">
                No pending transactions at this time.
              </p>
            ) : (
              pendingTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                    {transaction.type === "Purchase" && (
                      <ArrowDownIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                    {transaction.type === "Withdrawal" && (
                      <ArrowDownIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {transaction.date} • {transaction.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p
                      className={`text-sm font-semibold ${
                        transaction.type === "Purchase" || transaction.type === "Withdrawal"
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {transaction.amount}
                    </p>
                    {transaction.canCancel && (
                      <button
                        onClick={() => handleCancelTransaction(transaction.id)}
                        className="text-red-600 dark:text-red-400 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
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
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Full Transaction History
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            View all your wallet transactions
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Pro Tip:</span> Use filters to sort transactions by type or date
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
            All Transactions
          </h2>
          <div className="space-y-3">
            {transactionData.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                  {transaction.type === "Deposit" && (
                    <ArrowUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                  {transaction.type === "Purchase" && (
                    <ArrowDownIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                  {transaction.type === "Refund" && (
                    <ArrowUpIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.date} • {transaction.status}
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    transaction.type === "Purchase"
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {transaction.amount}
                </p>
              </div>
            ))}
          </div>
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

// Icon components
function ArrowUpIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="19" x2="12" y2="5"></line>
      <polyline points="5 12 12 5 19 12"></polyline>
    </svg>
  );
}

function ArrowDownIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <polyline points="19 12 12 19 5 12"></polyline>
    </svg>
  );
}

function UserIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

function CreditCardIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
      <line x1="1" y1="10" x2="23" y2="10"></line>
    </svg>
  );
}