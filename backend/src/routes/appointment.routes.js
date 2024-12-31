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

router.route("/request-appointment").post(verifyJWT, requestAppointment);
router.route("/approve-appointment").patch(verifyJWT, approveAppointment);
router.route("/reject-appointment").patch(verifyJWT, rejectAppointment);
router.route("/reschedule-appointment").patch(verifyJWT, rescheduleAppointment);
router.route("/appointments").get(verifyJWT, getAppointments);

export default router;
