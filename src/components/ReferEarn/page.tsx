import { useState, useEffect } from "react";
import { Copy, Share2, CheckCircle, Gift, Award, Users, CreditCard, Zap } from "lucide-react";
import { useFetchUserQuery } from "@/services/api";

export default function ReferEarn() {
  const [copiedText, setCopiedText] = useState("");
  const [referralStats, setReferralStats] = useState({
    totalReferred: 0,
    totalEarned: 0,
    pendingRewards: 0
  });

  const { data: userData, isLoading } = useFetchUserQuery(undefined);
  const user = userData?.data;
  const referralCode = user?.refferalCode || "PAARSh1023";
  const referralLink = `https://www.paarshedu.com/signup?ref=${referralCode}`;

  // Simulate fetching referral stats
  useEffect(() => {
    // This would be replaced with an actual API call
    const timer = setTimeout(() => {
      setReferralStats({
        totalReferred: 3,
        totalEarned: 1500,
        pendingRewards: 500
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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
    const message = `Hey! 🎉 Join PaarshEdu and get 20% off your first course! Use my referral code: ${referralCode} or sign up directly: ${referralLink}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join PaarshEdu with my referral!",
          text: message,
        });
      } else {
        handleCopy(message);
        alert("Sharing is not supported on this device. Referral message copied!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const rewards = [
    {
      title: "20% Discount",
      description: "Your friend gets 20% off their first course purchase",
      icon: <CreditCard className="text-blue-500" size={24} />
    },
    {
      title: "₹500 Cashback",
      description: "You earn ₹500 when your friend completes their first course",
      icon: <Award className="text-blue-500" size={24} />
    },
    {
      title: "Unlimited Referrals",
      description: "No limit on how many friends you can refer",
      icon: <Users className="text-blue-500" size={24} />
    },
    {
      title: "Quick Rewards",
      description: "Rewards credited within 48 hours of qualification",
      icon: <Zap className="text-blue-500" size={24} />
    }
  ];

  return (
    <>
      <div className="flex flex-col items-center justify-between rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 md:flex-row">
        <div className="text-center md:w-1/2 md:text-left">
          <h1 className="mb-4 flex items-center justify-center gap-2 text-2xl font-bold text-gray-800 dark:text-white md:justify-start md:text-4xl">
            <Gift className="text-blue-500" size={32} />
            Refer Friends, Earn Rewards!
          </h1>
          <p className="mb-4 text-gray-600 dark:text-gray-300 text-lg">
            Share the gift of learning and be rewarded! Invite your friends to PaarshEdu and both of you will receive exclusive benefits.
          </p>
          <div className="hidden md:block">
            <button
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 mt-2"
              onClick={handleShare}
            >
              <Share2 size={20} /> Share Now
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-center md:mt-0 md:w-1/2">
          <img src="/images/refer/refer.png" alt="Refer and Earn" />
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
          <Users className="mx-auto mb-2 text-blue-500" size={28} />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Friends Referred</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{referralStats.totalReferred}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
          <Award className="mx-auto mb-2 text-blue-500" size={28} />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Earned</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{referralStats.totalEarned}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
          <CreditCard className="mx-auto mb-2 text-blue-500" size={28} />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Pending Rewards</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{referralStats.pendingRewards}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row py-6 pt-0 gap-6">
        {/* How It Works Section */}
        <div className="w-full rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:border-gray-700 dark:bg-gray-800 md:w-1/2">
          <h1 className="mb-4 text-2xl text-center font-bold text-gray-900 dark:text-white">
            How It Works
          </h1>
          <div className="space-y-6">
            {[
              { step: "1", text: "Share your unique referral code with friends", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
              { step: "2", text: "Your friend signs up using your referral link", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
              { step: "3", text: "They purchase and complete their first course", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
              { step: "4", text: "Both of you receive your rewards automatically", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-8 h-8 ${item.color} rounded-full flex items-center justify-center font-bold`}>
                  {item.step}
                </div>
                <div className="flex-grow">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="w-full rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:border-gray-700 dark:bg-gray-800 md:w-1/2">
          <h1 className="mb-4 text-2xl text-center font-bold text-gray-900 dark:text-white">
            Your Referral Details
          </h1>
          
          {/* Referral Code Box */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Referral Code</label>
            <div className="relative flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700 p-4 border border-gray-200 dark:border-gray-600">
              <span className="text-lg font-medium text-gray-900 dark:text-white tracking-wider">
                {referralCode}
              </span>
              <button
                onClick={() => handleCopy(referralCode)}
                className="relative text-blue-500 hover:text-blue-700 dark:text-blue-400 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
              >
                {copiedText === referralCode ? <CheckCircle size={20} /> : <Copy size={20} />}
                {copiedText === referralCode && (
                  <span className="absolute right-0 top-[-30px] rounded-md bg-black px-2 py-1 text-xs text-white shadow-lg">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Referral Link Box */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Referral Link</label>
            <div className="relative flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700 p-4 border border-gray-200 dark:border-gray-600">
              <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {referralLink}
              </span>
              <button
                onClick={() => handleCopy(referralLink)}
                className="relative text-blue-500 hover:text-blue-700 dark:text-blue-400 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
              >
                {copiedText === referralLink ? <CheckCircle size={20} /> : <Copy size={20} />}
                {copiedText === referralLink && (
                  <span className="absolute right-0 top-[-30px] rounded-md bg-black px-2 py-1 text-xs text-white shadow-lg">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-sm hover:shadow transition-all duration-300"
              onClick={handleShare}
            >
              <Share2 size={20} /> Share via Social Media
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 rounded-lg transition-colors border border-blue-200 dark:border-blue-800/30"
              onClick={() => handleCopy(`Join PaarshEdu with my referral code: ${referralCode} and get 20% off your first course! ${referralLink}`)}
            >
              <Copy size={20} /> Copy Message
            </button>
          </div>
        </div>
      </div>

      {/* Rewards Section */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Rewards Youll Both Receive
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rewards.map((reward, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
              <div className="mb-3 p-3 rounded-full bg-gray-50 dark:bg-gray-700">
                {reward.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{reward.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{reward.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
