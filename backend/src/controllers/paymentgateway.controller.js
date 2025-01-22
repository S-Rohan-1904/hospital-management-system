import razorpay from "razorpay";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Payment } from "../models/payment.model.js";
import { Appointment } from "../models/appointment.model.js";
import crypto from "crypto";
import { AdmittedPatient } from "../models/admittedPatient.model.js";

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createRazorpayOrder = async (amount, type, id) => {
  const options = {
    amount: amount, // Amount in paise (e.g., ₹500.00 = 50000 paise)
    currency: "INR",
    receipt: "receipt#1",
  };

  const order = await razorpayInstance.orders.create(options);

  const payment = await Payment.create({
    type,
    id,
    order_id: order.id,
  });
  return payment;
};

const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    const paymentObject = await Payment.findOne({
      order_id: razorpay_order_id,
    });
    paymentObject.status = "paid";
    await paymentObject.save();

    if (type === "appointment") {
      const appointment = await Appointment.findOne({
        paymentId: paymentObject._id,
      });
      appointment.status = "scheduled";
      await appointment.save({ validateBeforeSave: false });
    } else {
      const admittedPatientObject = await AdmittedPatient.findOne({
        paymentId: paymentObject._id,
      });
      admittedPatientObject.status = "discharged";
      await admittedPatientObject.save({ validateBeforeSave: false });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, { success: true }, "Payment verified successfully")
      );
  } else {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Payment Verification Failed"));
  }
});

export { createRazorpayOrder, verifyRazorpayPayment };
