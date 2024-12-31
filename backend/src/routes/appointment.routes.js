import { Router } from "express";
import {
  requestAppointment,
  approveAppointment,
  rejectAppointment,
  rescheduleAppointment,
  getAppointments,
} from "../controllers/appointment.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
const router = Router();

router.route("/").get(verifyJWT, getAppointments);
router.route("/").post(verifyJWT, requestAppointment);
router.route("/:id/approve").patch(verifyJWT, approveAppointment);
router.route("/:id/reject").patch(verifyJWT, rejectAppointment);
router.route("/:id/reschedule").patch(verifyJWT, rescheduleAppointment);

export default router;
