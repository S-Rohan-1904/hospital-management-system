import { Router } from "express";
import {
  getWardsInHospital,
  allocateBeds,
  changeBed,
  getFoodAvailable,
  orderFood,
  getAllBedOccupation,
  dischargePatient,
  getPendingPayments,
} from "../controllers/roomManagement.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getWardsInHospital);
router.route("/allot").post(verifyJWT, allocateBeds);
router.route("/change").patch(verifyJWT, changeBed);
router.route("/food").get(verifyJWT, getFoodAvailable);
router.route("/food/order").post(verifyJWT, orderFood);
router.route("/occupied-rooms").get(verifyJWT, getAllBedOccupation);
router.route("/discharge").patch(verifyJWT, dischargePatient);
router.route("/pending-payments").post(verifyJWT, getPendingPayments);

export default router;
