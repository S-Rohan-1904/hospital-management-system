import { Router } from "express";
import {
  getAllHospitals,
  getNearbyHospital,
} from "../controllers/map.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/get-nearby-hospitals").get(verifyJWT, getNearbyHospital);
router.route("/").get(verifyJWT, getAllHospitals);

export default router;
