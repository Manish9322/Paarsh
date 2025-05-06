"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { useCreateOrderMutation } from "@/services/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PurchaseProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
  activeOffer?: {
    _id: string;
    code: string;
    discountPercentage: number;
    validUntil: string;
  };
}

const Purchase = ({ isOpen, onClose, course, activeOffer }: PurchaseProps) => {
  const [createOrder] = useCreateOrderMutation();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const calculateFinalPrice = () => {
    if (!course?.price) return 0;
    const originalPrice = parseFloat(course.price);
    if (isNaN(originalPrice)) return 0;
    
    if (activeOffer) {
      const discounted = originalPrice - (originalPrice * activeOffer.discountPercentage / 100);
      return discounted.toFixed(0);
    }
    return originalPrice;
  };

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("accessToken");

      if (!userId || !token) {
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem("redirectAfterLogin", currentPath);
        router.push("/signin");
        return;
      }

      const amount = calculateFinalPrice();
      const response = await createOrder({
        userId,
        courseId: course._id,
        amount,
        offerId: activeOffer?._id
      }).unwrap();

      if (response.success) {
        // Handle successful order creation
        // You might want to redirect to payment page or handle it according to your flow
        toast.success("Order created successfully");
        // Add your payment handling logic here
      } else {
        toast.error(response.error || "Failed to create order");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Purchase Course</DialogTitle>
        </DialogHeader>
        
        <div className="mt-6">
          <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold">Course Details</h3>
            <div className="mb-4">
              <h4 className="font-medium">{course?.courseName}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{course?.tagline}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Original Price</span>
                <span>₹{course?.price}</span>
              </div>

              {activeOffer && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Discount ({activeOffer.code})</span>
                  <span>-₹{(parseFloat(course?.price) * activeOffer.discountPercentage / 100).toFixed(0)}</span>
                </div>
              )}

              <div className="border-t pt-3 dark:border-gray-600">
                <div className="flex justify-between font-semibold">
                  <span>Final Price</span>
                  <div className="flex items-center">
                    <FaIndianRupeeSign className="mr-1" />
                    <span>{calculateFinalPrice()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {activeOffer && (
              <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Offer <span className="font-semibold">{activeOffer.code}</span> applied
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Valid until {new Date(activeOffer.validUntil).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                onClick={handlePurchase}
                className="w-full bg-blue-600 py-6 text-lg font-semibold transition-all hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : `Pay ₹${calculateFinalPrice()}`}
              </Button>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                By purchasing, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Purchase; 