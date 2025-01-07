import { Router } from "express";
import {
  requestAppointment,
  approveOrRejectAppointment,
  rescheduleAppointment,
  getAppointmentsById,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  requestAppointmentSchema,
  rescheduleAppointmentSchema,
  updateAppointmentSchema,
} from "../schemas/appointment.schema.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getAppointmentsById);
router.route("/").post(verifyJWT, validate(requestAppointmentSchema), requestAppointment);
// doctor can add the description of the outcome of the appointment here
router.route("/:id").patch(verifyJWT, validate(updateAppointmentSchema), updateAppointment);
router.route("/:id/reschedule").patch(verifyJWT, validate(rescheduleAppointmentSchema), rescheduleAppointment);
router.route("/:id/:status").patch(verifyJWT, approveOrRejectAppointment);
router.route("/:id").delete(verifyJWT, deleteAppointment);

export default router;
