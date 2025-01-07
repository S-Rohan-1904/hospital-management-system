import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  checkAuthenicated,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { registerUserSchema } from "../schemas/registration.schema.js";
import { loginUserSchema } from "../schemas/logIn.schema.js";
const router = Router();

router
  .route("/register")
  .post(
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    validate(registerUserSchema),
    registerUser
  );

router.route("/login").post(validate(loginUserSchema), loginUser);
router.route("/logout").get(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/").get(checkAuthenicated);

export default router;
