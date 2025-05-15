import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../lib/slices/paymentSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  useCreateOrderMutation,
  useFetchUserQuery,
  useVerifyPaymentMutation,
} from "@/services/api";
import { RAZORPAY_KEY_ID } from "../../config/config";
import { set } from "mongoose";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

const PurchaseModal = ({ isOpen, onClose, course, activeOffer }) => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.payment.isLoading);
  const [createOrder] = useCreateOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { data: userData } = useFetchUserQuery();
  const [finalPrice, setFinalPrice] = useState(course?.price || 0);

  const user = userData?.data;
  const router = useRouter();
  const params = useSearchParams();


  const agentRefCode = params.get("ref"); // Get the referral code from URL
   
  console.log("Agent Referral Code:", agentRefCode); // Log the referral code for debugging
  useEffect(() => {
    if (course?.price) {
      // If there's an active offer, apply it immediately
      if (activeOffer && new Date() <= new Date(activeOffer.validUntil)) {
        const discountedPrice = Number(course.price) * (1 - activeOffer.discountPercentage / 100);
        setFinalPrice(discountedPrice);
        setDiscountApplied(true);
      } else {
        setFinalPrice(Number(course.price));
      }
      coursePrice = Number(course.price);
    }
  }, [course, activeOffer]); // Run when course or activeOffer updates
  
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  let coursePrice;
  if (!course) {
    return null;
  } else {
    coursePrice = Number(course.price);
  }

  const validPromoCode = "DISCOUNT20";

  if (!isOpen) return null;

  const handleClose = () => {
    setPromoCode("");
    setDiscountApplied(false);
    setFinalPrice(coursePrice);
    setErrorMessage("");
    onClose();
  };

  const applyPromoCode = () => {
    if (promoCode === validPromoCode) {
      const currentPrice = Number(course?.price || 0);
      const discount = currentPrice * 0.2;
      setFinalPrice(Number(currentPrice - discount));
      setDiscountApplied(true);
      setErrorMessage("");
    } else {
      setErrorMessage("Invalid promo code");
      setDiscountApplied(false);
    }
  };

  const handlePayment = async () => {
    dispatch(setLoading(true));
    
    try {
      // Step 1: Request backend to create order
      const orderResponse = await createOrder({
        userId: user._id,
        courseId: course._id,
        amount: finalPrice * 100, // Convert to smallest currency unit
        agentRefCode: agentRefCode, // Pass the referral code to the backend
        // Only pass the offerId if the offer is valid
        ...(activeOffer && new Date() <= new Date(activeOffer.validUntil) ? { offerId: activeOffer._id } : {})
      });
     
      console.log("Order Response:", orderResponse); // Log the order response for debugging
      const orderData = orderResponse.data; // ✅ Extract actual data

      console.log("Order Data:", orderData); // Log the order data for debugging

      if (orderData && orderData.success) {
        const options = {
          key: RAZORPAY_KEY_ID, // Public Key
          amount: orderData?.data?.amount,
          currency: orderData?.data?.currency,
          order_id: orderData?.data?.orderId,
          handler: async function (response) {
            try {
              await verifyPayment(response);
              toast.success("Payment Successful! Course Access Granted.", {
                duration: 5000,
                position: "top-center",
                icon: "🎉",
                style: {
                  borderRadius: "10px",
                  background: "#333",
                  color: "#fff",
                },
              });
              handleClose();
              router.push("/userdashboard"); 
            } catch (error) {
              toast.error("Payment verification failed. Please contact support.", {
                duration: 5000,
                position: "top-center",
              });
              console.error("Payment verification error:", error);
            }
          },
          prefill: {
            email: user?.email || "",
            name: user?.name || "",
          },
          theme: {
            color: "#4F46E5", // blue color to match our UI
          },
        };

        // Step 3: Open Razorpay Payment Gateway
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error("Payment initialization failed. Please try again.", {
        duration: 4000,
        position: "top-center",
      });
    }

    dispatch(setLoading(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm dark:bg-black/70">
      <div className="relative w-full md:max-w-5xl max-h-[85vh] overflow-auto md:overflow-hidden rounded-md bg-white shadow-xl dark:bg-gray-900">
        {/* Close button */}
        <button 
          className="absolute right-4 top-4 z-50 rounded-full bg-gray-100 p-2 text-gray-600 transition-all hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          onClick={handleClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Split panel container */}
        <div className="flex flex-col md:flex-row">
          {/* Left panel (image/course info) */}
          <div className="relative flex-shrink-0 bg-gradient-to-br from-blue-800 via-blue-700 to-blue-800 p-6 md:w-2/5">
            {/* Background pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />
              </svg>
            </div>
            
            <div className="relative z-10 flex h-full flex-col">
              {/* Course category badge at top */}
              <div className="mb-4 inline-block self-start rounded-md bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/80 backdrop-blur-sm">
                {course?.category || "Online Course"}
              </div>
              
              {/* Course title */}
              <h1 className="mb-4 text-2xl font-bold tracking-tight text-white md:text-3xl">
                {course?.title || "Course Title"}
              </h1>
              
              {/* Instructor info */}
              <div className="mb-6 flex items-center space-x-2">
                <div className="h-8 w-8 overflow-hidden rounded-full bg-white/20">
                  {course?.instructorAvatar ? (
                    <img 
                      src={course.instructorAvatar} 
                      alt={course.instructor} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-600 text-xs font-bold text-white">
                      {course?.instructor?.charAt(0) || "I"}
                    </div>
                  )}
                </div>
                <p className="text-white/90">
                  {course?.instructor || "Instructor"}
                </p>
              </div>
              
              {/* Course thumbnail with enhanced styling - moved down */}
              <div className="overflow-hidden rounded-md bg-gradient-to-br from-white/20 to-white/5 p-[2px] shadow-lg backdrop-blur-sm">
                <div className="aspect-video overflow-hidden rounded-md border border-white/10">
                  {course?.thumbnail ? (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-900 to-blue-900 p-6">
                      <div className="rounded-full bg-white/10 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Feature highlights - adding content to fill space */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-md bg-white/10 p-3 backdrop-blur-sm">
                  <div className="mb-1 text-xl text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-white/80">Certificate Included</p>
                </div>
                
                <div className="rounded-md bg-white/10 p-3 backdrop-blur-sm">
                  <div className="mb-1 text-xl text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-white/80">Lifetime Access</p>
                </div>
              </div>
              
              {/* Price badge with enhanced styling */}
              <div className="mt-6 rounded-md bg-gradient-to-r from-white/20 to-white/5 p-[1px] backdrop-blur-sm">
                <div className="rounded-md bg-gradient-to-r from-black/30 to-black/10 px-5 py-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/80">Price</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white">
                        {(activeOffer || discountApplied) ? (
                          <>
                            <span className="mr-2 text-sm line-through opacity-70">
                              ₹{Number(course?.price || 0).toFixed(2)}
                            </span>
                            ₹{Number(finalPrice).toFixed(2)}
                          </>
                        ) : (
                          `₹${Number(finalPrice).toFixed(2)}`
                        )}
                      </span>
                      {(activeOffer || discountApplied) && (
                        <span className="rounded-full bg-green-500 px-2 py-1 text-xs font-bold text-white">
                          {activeOffer ? `${activeOffer.discountPercentage}% OFF` : '20% OFF'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced decorative elements */}
              <div className="absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-blue-700/30 blur-3xl"></div>
              <div className="absolute -right-16 top-32 h-40 w-40 rounded-full bg-blue-700/20 blur-3xl"></div>
              <div className="absolute left-1/2 top-8 h-24 w-24 -translate-x-1/2 rounded-full bg-blue-600/30 blur-2xl"></div>
            </div>
          </div>
          
          {/* Right panel (payment details) */}
          <div className="flex flex-grow flex-col justify-between p-8 text-gray-800 dark:text-white md:w-3/5">
            <div>
              <h1 className="text-2xl font-bold">Complete Your Purchase</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">Unlock access to this course in just a few steps</p>
              
              {/* Price summary */}
              <div className="mt-8 rounded-md bg-gray-50 p-6 shadow-sm dark:bg-gray-800/80">
                <h3 className="mb-4 text-lg font-medium">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Course Price</span>
                    <span>₹{Number(course?.price || 0).toFixed(2)}</span>
                  </div>
                  
                  {activeOffer && (new Date() <= new Date(activeOffer.validUntil)) && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Special Offer ({activeOffer.code} - {activeOffer.discountPercentage}% OFF)</span>
                      <span>-₹{(Number(course?.price || 0) * activeOffer.discountPercentage / 100).toFixed(2)}</span>
                    </div>
                  )}
                  
                  {discountApplied && !activeOffer && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Promo Discount (20%)</span>
                      <span>-₹{(Number(course?.price || 0) * 0.2).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-lg font-medium">Total</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{Number(finalPrice).toFixed(2)}</span>
                    </div>
                    {activeOffer && (
                      <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                        {new Date() <= new Date(activeOffer.validUntil) ? 
                          `Offer valid until ${new Date(activeOffer.validUntil).toLocaleDateString()}` : 
                          <span className="text-red-500 dark:text-red-400">OFFER EXPIRED</span>
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Promo code section */}
              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Have a promo code?
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-grow">
                    <Input
                      type="text"
                      placeholder="Enter your code"
                      className="h-12 w-full rounded-md border border-gray-300 bg-white px-4 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={activeOffer} // Only disable input if there's an active offer
                    />
                    {promoCode && (
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        onClick={() => setPromoCode("")}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <Button
                    onClick={applyPromoCode}
                    disabled={!promoCode || activeOffer}
                    className="h-12 rounded-md bg-blue-600 px-5 font-medium text-white transition-all hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                  >
                    Apply
                  </Button>
                </div>
                {errorMessage && (
                  <p className="mt-2 text-sm font-medium text-red-500 dark:text-red-400">{errorMessage}</p>
                )}
                {activeOffer ? (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Special offer already applied. Promo codes cannot be used with special offers.
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Use code DISCOUNT20 for 20% off your purchase
                  </p>
                )}
              </div>
            </div>
            
            {/* Payment button */}
            <div className="mt-8">
              <Button
                onClick={handlePayment}
                disabled={isLoading}
                className="relative h-14 w-full overflow-hidden rounded-md bg-blue-600 font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 disabled:bg-gray-400 dark:bg-blue-600 dark:hover:bg-blue-700 dark:hover:shadow-blue-600/10"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">Complete Purchase</span>
                    <div className="absolute inset-0 -translate-x-full transform-gpu bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full"></div>
                  </>
                )}
              </Button>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
