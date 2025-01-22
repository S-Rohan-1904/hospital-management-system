import React from "react";
import axiosInstance from "../utils/axiosInstance";
import {
  Appointment,
  useAppointmentsContext,
} from "@/context/AppointmentsContext";

interface PaymentButtonProps {
  amount: number; // Amount in INR
  type: string; // Payment type (e.g., "appointment")
  id: string; // Unique ID for the payment type
  appointment: Appointment;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  type,
  id,
  appointment,
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

      console.log(appointment.payment.orderId);

      const options = {
        key: process.env.RAZORPAY_KEY_ID, // Razorpay key_id from backend
        amount: amount * 100,
        currency: "INR",
        name: "HMS",
        description: "Payment for your service",
        order_id: appointment.payment.orderId, // Razorpay order_id
        handler: async function (response: any) {
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            response;

          // Step 3: Verify payment on the backend
          const verificationResponse = await axiosInstance.post(
            "/payment/verify-payment",
            {
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
              type: "appointment",
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
          name: appointment.patient.fullName,
          email: appointment.patient.email,
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

  return (
    <button
      onClick={handlePayment}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Pay Now
    </button>
  );
};

export default PaymentButton;
