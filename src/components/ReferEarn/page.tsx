import { useState } from "react";
import { Copy, Share2, CheckCircle, Gift } from "lucide-react";
import { useFetchUserQuery } from "@/services/api";

export default function ReferEarn() {
  const [copiedText, setCopiedText] = useState("");

  const { data: userData, isLoading } = useFetchUserQuery(undefined);
  const user = userData?.data;
  const referralCode = user?.refferalCode || "N/A";
  const referralLink = `https://www.paarshedu.com/signup?ref=${referralCode}`;

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(""), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleShare = async () => {
    const message = `Hey! 🎉 Join me on this amazing platform and get exclusive rewards. Sign up using my referral link: ${referralLink}`;

    try {
      if (navigator.share) {
        await navigator.share({
          text: message, // Only include text (contains the link)
        });
      } else {
        handleCopy(message);
        alert("Sharing is not supported on this device. Referral link copied!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-between rounded-t-lg bg-gray-100 p-6 dark:bg-gray-900 md:flex-row">
        <div className="text-center md:w-1/2 md:text-left">
          <h2 className="mb-4 flex items-center justify-center gap-2 text-2xl font-bold text-gray-800 dark:text-white md:justify-start md:text-4xl">
            <Gift className="text-yellow-500" size={32} />
            Refer & Earn Rewards!
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Invite your friends and earn rewards! Share your unique referral ID,
            and when they sign up and make their first purchase, both of you
            receive exciting benefits.
          </p>
        </div>

        <div className="mt-6 flex justify-center md:mt-0 md:w-1/2">
          <img src="/images/refer/refer.png" alt="Refer and Earn" />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-b-lg bg-gray-100 p-9 dark:bg-gray-900 md:flex-row">
        <div className="w-full rounded-2xl bg-white p-6 text-center shadow-lg dark:bg-gray-800 md:w-1/2 md:text-left">
          <h2 className="mb-4 text-2xl text-center font-bold text-gray-900 dark:text-white">
            How It Works
          </h2>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300">
            {[
              "Share your unique referral code with friends.",
              "Your friend signs up using your referral link.",
              "They complete their first successful purchase.",
              "You earn rewards like discounts or cashback.",
              "Refer more friends and keep earning unlimited rewards!",
            ].map((text, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-6 w-full rounded-2xl bg-white p-6 text-center shadow-lg dark:bg-gray-800 md:ml-6 md:mt-0 md:w-1/2">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Refer & Earn
          </h1>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Invite your friends and earn rewards when they sign up using your
            referral code.
          </p>

          {/* Referral Code Box */}
          <div className="relative mb-4 flex items-center justify-between rounded-lg bg-gray-200 p-3 dark:bg-gray-700">
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              {referralCode}
            </span>
            <button
              onClick={() => handleCopy(referralCode)}
              className="relative text-blue-500 hover:text-blue-700 dark:text-blue-400"
            >
              <Copy size={20} />
              {copiedText === referralCode && (
                <span className="absolute right-0 top-[-30px] rounded-md bg-black px-2 py-1 text-xs text-white shadow-lg">
                  Copied!
                </span>
              )}
            </button>
          </div>

          {/* Referral Link Box */}
          <div className="relative mb-4 flex items-center justify-between rounded-lg bg-gray-200 p-3 dark:bg-gray-700">
            <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {referralLink}
            </span>
            <button
              onClick={() => handleCopy(referralLink)}
              className="relative text-blue-500 hover:text-blue-700 dark:text-blue-400"
            >
              <Copy size={20} />
              {copiedText === referralLink && (
                <span className="absolute right-0 top-[-30px] rounded-md bg-black px-2 py-1 text-xs text-white shadow-lg">
                  Copied!
                </span>
              )}
            </button>
          </div>

          {/* Share Button */}
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            onClick={handleShare}
          >
            <Share2 size={20} /> Share Referral Link
          </button>
        </div>
      </div>
    </>
  );
}
