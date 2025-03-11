import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { Gift, } from "lucide-react"

export default function ReferEarn() {
  const [referralCode] = useState("ABC123XYZ");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
<>
<div className="flex flex-col md:flex-row items-center justify-between bg-gray-100 dark:bg-gray-900 p-6 rounded-t-lg">
      {/* Left Side: Text Content */}
      <div className="md:w-1/2 text-center md:text-left">
  <h2 className="text-2xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-center md:justify-start gap-2">
    <Gift className="text-yellow-500" size={32} />
    Refer & Earn Rewards!
  </h2>
  <p className="text-gray-600 dark:text-gray-300 mb-4 flex items-center gap-2">
   
    Invite your friends and earn rewards! Share your unique referral ID with your friends and family, and when they sign up and make their first purchase, both of you get exciting benefits.
  </p>
  {/* <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md flex items-center gap-2">
    <Link size={20} />
    Get Your Referral Code
  </button> */}
</div>

      {/* Right Side: Image */}
      <div className="md:w-1/2 mt-6 md:mt-0 flex justify-center">
        <img
          src="/images/refer/refer.png"
          alt="Refer and Earn"
        //   className="rounded-xl shadow-lg"
        />
      </div>



      
    </div>

    <div className="flex flex-col md:flex-row items-center justify-center bg-gray-100 dark:bg-gray-900 p-6 rounded-b-lg">
      {/* Left Section: How It Works */}
      <div className="md:w-1/2 w-full bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg text-center md:text-left">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
    How It Works
  </h2>
  <ul className="text-gray-600 dark:text-gray-300 space-y-3">
    <li className="flex items-center gap-2">
      <CheckCircle className="text-green-500" size={20} />
      Share your unique referral code with friends.
    </li>
    <li className="flex items-center gap-2">
      <CheckCircle className="text-green-500" size={20} />
      Your friend signs up using your referral link.
    </li>
    <li className="flex items-center gap-2">
      <CheckCircle className="text-green-500" size={20} />
      They complete their first successful purchase.
    </li>
    <li className="flex items-center gap-2">
      <CheckCircle className="text-green-500" size={20} />
      You earn rewards like discounts or cashback.
    </li>
    <li className="flex items-center gap-2">
      <CheckCircle className="text-green-500" size={20} />
      Refer more friends and keep earning unlimited rewards!
    </li>
  </ul>
</div>
      {/* Right Section: Referral Code & Share */}
      <div className="md:w-1/2 w-full bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg text-center mt-6 md:mt-0 md:ml-6 relative">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Refer & Earn
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Invite your friends and earn rewards when they sign up using your referral code.
        </p>

        {/* Referral Code Box */}
        <div className="flex items-center justify-between bg-gray-200 dark:bg-gray-700 rounded-lg p-3 mb-4 relative">
          <span className="text-lg font-medium text-gray-900 dark:text-white">
            {referralCode}
          </span>
          <button
            onClick={handleCopy}
            className="text-blue-500 dark:text-blue-400 hover:text-blue-700 relative"
          >
            <Copy size={20} />
            {copied && (
              <span className="absolute top-[-30px] right-0 bg-black text-white text-xs px-2 py-1 rounded-md shadow-lg">
                Copied!
              </span>
            )}
          </button>
        </div>

        {/* Share Button */}
        <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 rounded-lg">
          <Share2 size={20} /> Share Referral Code
        </button>
      </div>
    </div>
    
   


    </>
  );
}
