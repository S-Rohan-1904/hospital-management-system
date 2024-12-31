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

router.route("/appointment").post(verifyJWT, requestAppointment);
router.route("/appointment/:id/approve").patch(verifyJWT, approveAppointment);
router.route("/appointment/:id/reject").patch(verifyJWT, rejectAppointment);
router
  .route("/appointment/:id/reschedule")
  .patch(verifyJWT, rescheduleAppointment);
router.route("/appointments").get(verifyJWT, getAppointments);

export default router;
