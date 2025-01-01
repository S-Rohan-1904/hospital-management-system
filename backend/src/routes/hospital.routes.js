import { Router } from "express";
import { getNearbyHospital } from "../controllers/map.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
const router = Router();

router.route("/get-nearby-hospitals").get(verifyJWT,getNearbyHospital);

export default router;