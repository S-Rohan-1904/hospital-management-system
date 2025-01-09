import { Router } from "express";
import {
  createScanRequest,
  deleteScanRequest,
  approveOrRejectScanRequest,
  getScanRequests,
  completeScanRequest,
  updateScanRequest,
  getAllScancentres,
} from "../controllers/scanRequest.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createScanRequestSchema, updateScanRequestSchema } from "../schemas/scanRequest.schema.js";

const router = Router();

router.route("/").get(verifyJWT, getScanRequests);
router.route("/").post(verifyJWT, validate(createScanRequestSchema), createScanRequest);
router
  .route("/:id/complete")
  .post(verifyJWT, upload.single("scanDocument"), completeScanRequest);
router.route("/:id").delete(verifyJWT, deleteScanRequest);
router
  .route("/:id/:status/updateStatus")
  .patch(verifyJWT, approveOrRejectScanRequest);

router
  .route("/:id")
  .patch(verifyJWT, upload.single("scanDocument"), updateScanRequest);
router.route("/centres").get(verifyJWT, getAllScancentres)

export default router;
