import { Router } from "express";
import {
  getAllHospitals,
  getNearbyHospital,
  mapmyIndiaAccessToken,
} from "../controllers/map.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/get-nearby-hospitals").get(verifyJWT, getNearbyHospital);
router.route("/").get(verifyJWT, getAllHospitals);
router.route("/oauth").get(verifyJWT, mapmyIndiaAccessToken);

export default router;
