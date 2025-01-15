import Router from "express";
import {
  getMedicalHistories,
  getMedicalHistoryById,
  createMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory,
  getMedicalHistoryAsPDF,
} from "../controllers/medicalHistory.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { 
  createMedicalHistorySchema, 
  getMedicalHistorySchema, 
  updateMedicalHistorySchema,
} from "../schemas/medicalHistory.schema.js";

const router = Router();

router.route("/:patientId/hospital/:doctorId").get(verifyJWT, getMedicalHistories);
router.route("/:id").get(verifyJWT, getMedicalHistoryById);
router.route("/").post(verifyJWT, validate(createMedicalHistorySchema), createMedicalHistory);
router.route("/:id").patch(verifyJWT, validate(updateMedicalHistorySchema), updateMedicalHistory);
router.route("/:id").delete(verifyJWT, deleteMedicalHistory);
router.route("/pdf").post(verifyJWT, getMedicalHistoryAsPDF)
export default router;
