import Router from "express";
import {
  getMedicalHistories,
  getMedicalHistoryById,
  createMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory,
} from "../controllers/medicalHistory.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/").get(verifyJWT, getMedicalHistories);
router.route("/:id").get(verifyJWT, getMedicalHistoryById);
router.route("/").post(verifyJWT, createMedicalHistory);
router.route("/:id").patch(verifyJWT, updateMedicalHistory);
router.route("/:id").delete(verifyJWT, deleteMedicalHistory);
export default router;
