import { Router } from "express";
import passport from "../config/passport.config.js";
import { generateAccessAndRefreshToken } from "../controllers/user.controller.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const router = Router();

router
  .route("/google")
  .get(passport.authenticate("google", { scope: ["profile", "email"] }));
router
  .route("/google/callback")
  .get(
    passport.authenticate("google", { session: false, failureRedirect: "/" }),
    async (req, res) => {
      try {
        const { accessToken, refreshToken } =
          await generateAccessAndRefreshToken(req.user._id);

        const loggedInUser = await User.findById(req.user._id).select(
          "-password -refreshToken"
        );

        const options = {
          httpOnly: true,
          secure: true,
        };

        res
          .status(200)
          .cookie("accessToken", accessToken, options)
          .cookie("refreshToken", refreshToken, options)
          .json(
            new ApiResponse(
              200,
              { user: loggedInUser },
              "User logged in successfully"
            )
          );
      } catch (error) {
        return res.status(500).json(new ApiResponse(500, {}, error.message))
      }
    }
  );

export default router;
