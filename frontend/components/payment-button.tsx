import React from "react";
import axiosInstance from "../utils/axiosInstance";
import {
  Appointment,
  useAppointmentsContext,
} from "@/context/AppointmentsContext";
import { Button } from "./ui/button";

interface PaymentButtonProps {
  amount: number; // Amount in INR
  type: string; // Payment type (e.g., "appointment")
  id: string; // Unique ID for the payment type
  order_id: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  type,
  id,
  order_id,
}) => {
  const { fetchAppointments } = useAppointmentsContext();
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Failed to load Razorpay SDK. Please try again.");
      return;
    }

    try {
      // Step 1: Create Razorpay Order via your backend
      console.log(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Razorpay key_id from backend
        amount: amount * 100,
        currency: "INR",
        name: "HMS",
        description: "Payment for your service",
        order_id: order_id, // Razorpay order_id
        handler: async function (response: any) {
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            response;
          console.log({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
          });

          // Step 3: Verify payment on the backend
          const verificationResponse = await axiosInstance.post(
            "/payment/verify-payment",
            {
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
              type,
            }
          );

          console.log(verificationResponse.data.data);

          if (verificationResponse.data.data.success === true) {
            console.log("Payment successful and verified!");
            fetchAppointments();
          } else {
            console.log("Payment verification failed.");
          }
        },
        prefill: {
          name: "test",
          email: "testmail@example.com",
          contact: "9999999999",
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#3399cc",
        },
      };

      // Step 4: Open Razorpay Checkout
      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Error during payment process:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return <Button onClick={handlePayment}>Pay</Button>;
};

export default PaymentButton;
