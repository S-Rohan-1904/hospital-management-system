import { Router } from "express";
import {
  createScanRequest,
  deleteScanRequest,
  approveOrRejectScanRequest,
  getScanRequests,
  completeScanRequest,
  updateScanRequest,
} from "../controllers/scanRequest.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/").get(verifyJWT, getScanRequests);
router.route("/").post(verifyJWT, createScanRequest);
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

export default router;
