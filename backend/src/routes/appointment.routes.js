import { Router } from "express";
import {
  requestAppointment,
  approveOrRejectAppointment,
  rescheduleAppointment,
  getAppointmentsById,
  updateDescriptionOfAppointment,
  deleteAppointment,
} from "../controllers/appointment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/").get(verifyJWT, getAppointmentsById);
router.route("/").post(verifyJWT, requestAppointment);
// doctor can add the description of the outcome of the appointment here
router.route("/:id").patch(verifyJWT, updateDescriptionOfAppointment);
router.route("/:id/reschedule").patch(verifyJWT, rescheduleAppointment);
router.route("/:id/:status").patch(verifyJWT, approveOrRejectAppointment);
router.route("/:id").delete(verifyJWT, deleteAppointment);

export default router;
