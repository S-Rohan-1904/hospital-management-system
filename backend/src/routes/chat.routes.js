import { Router } from "express";
import {
  createChat,
  createSpecializationChat,
  getChatUsersBasedOnRole,
  getUserChats,
} from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getUserChats);
router.route("/users").get(verifyJWT, getChatUsersBasedOnRole);
router.route("/create").post(verifyJWT, createChat);
router.route("/create/specialization").post(verifyJWT, createSpecializationChat);

export default router;
