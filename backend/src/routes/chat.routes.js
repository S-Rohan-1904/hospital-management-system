import { Router } from "express";
import {
  createChat,
  getChatUsersBasedOnRole,
  getUserChats,
} from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getUserChats);
router.route("/users").get(verifyJWT, getChatUsersBasedOnRole);
router.route("/create").post(verifyJWT, upload.single("avatar"),createChat);

export default router;
