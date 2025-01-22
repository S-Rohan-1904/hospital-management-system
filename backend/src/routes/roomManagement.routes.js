import { Router } from "express";
import {
  getWardsInHospital,
  allocateBeds,
  changeBed,
  removeBedOccupation,
  getFoodAvailable,
  orderFood,
  getAllBedOccupation,
  dischargePatient,
} from "../controllers/roomManagement.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getWardsInHospital);
router.route("/allot").post(verifyJWT, allocateBeds);
router.route("/change").patch(verifyJWT, changeBed);
router.route("/food").get(verifyJWT, getFoodAvailable);
router.route("/food/order").post(verifyJWT, orderFood);
router.route("/:id/remove").patch(verifyJWT, removeBedOccupation);
router.route("/occupied-rooms").get(verifyJWT, getAllBedOccupation);
router.route("/discharge").get(verifyJWT, dischargePatient);

export default router;
