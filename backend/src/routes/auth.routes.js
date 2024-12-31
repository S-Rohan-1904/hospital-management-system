import { Router } from "express";
const router = Router();

router.route("google").get(passport.authenticate("google", { scope: ["profile", "email"] }));
router.route("google/callback").get(passport.authenticate("google", { failureRedirect: "/" }),
(req, res) => {
  res.redirect("/");
}
);

export default router;