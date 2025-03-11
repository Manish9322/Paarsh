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

const PurchaseModal = ({ isOpen, onClose, course }) => {
  if (!course) return null;
  const coursePrice = Number(course.price);
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.payment.isLoading);
  const [createOrder] = useCreateOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { data: userData } = useFetchUserQuery();
  const [finalPrice, setFinalPrice] = useState(coursePrice);

  const user = userData?.data;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
      const discount = coursePrice * 0.2;
      setFinalPrice((coursePrice - discount).toFixed(2));
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
      });

      const orderData = orderResponse.data; // ✅ Extract actual data

      if (orderData && orderData.success) {
        const options = {
          key: RAZORPAY_KEY_ID, // Public Key
          amount: orderData.amount,
          currency: orderData.currency,
          order_id: orderData.orderId,
          handler: async function (response) {
            await verifyPayment(response);
            alert("Payment Successful! Course Access Granted.");
            handleClose();
          },
        };

        // Step 3: Open Razorpay Payment Gateway
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error("Payment failed:", error);
    }

    dispatch(setLoading(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-lg">
      <Card className="relative flex w-full max-w-md flex-col space-y-6 rounded-xl bg-white p-8 shadow-2xl">
        {/* Close Button */}
        <Button
          variant="ghost"
          className="absolute right-4 top-4 text-xl text-gray-600 hover:text-gray-900"
          onClick={handleClose}
        >
          &times;
        </Button>

        {/* Course Details */}
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-black">{course.name}</h2>
          <p className="text-gray-500">{course.description}</p>
        </div>

        <Separator />

        {/* Price Details */}
        <div className="rounded-lg bg-gray-100 p-4 text-center">
          <p className="text-gray-600">
            Original Price:{" "}
            <span className="line-through">${coursePrice.toFixed(2)}</span>
          </p>
          {discountApplied && (
            <p className="text-red-500">
              Discount: -${(coursePrice * 0.2).toFixed(2)}
            </p>
          )}
          <p className="text-xl font-bold text-green-600">
            Final Price: ${finalPrice}
          </p>
        </div>

        {/* Promo Code Section */}
        <div className="flex flex-col space-y-3">
          <Input
            type="text"
            placeholder="Enter Promo Code"
            className="bg-white text-gray-600"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
          <Button
            onClick={applyPromoCode}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            Apply Code
          </Button>
          {errorMessage && (
            <p className="text-center text-sm text-red-500">{errorMessage}</p>
          )}
        </div>

        <Separator />

        {/* Proceed Button */}
        <Button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-green-500 py-3 text-lg hover:bg-green-600"
        >
          {isLoading ? "Processing..." : "Proceed to Payment"}
        </Button>
      </Card>
    </div>
  );
};

export default PurchaseModal;
