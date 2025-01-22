import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRazorpayPayment } from "../controllers/paymentgateway.controller.js";

const router = Router();

router.route("/verify-payment").post(verifyJWT, verifyRazorpayPayment);

export default router;
