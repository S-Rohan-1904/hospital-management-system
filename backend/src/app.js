import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport.config.js";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(passport.initialize());

//routes

import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import hospitalRouter from "./routes/hospital.routes.js"
import appointmentRouter from "./routes/appointment.routes.js";
import scanRequestRouter from "./routes/scanRequest.routes.js";
app.use("/api/v1/users/", userRouter);
app.use("/api/v1/appointments/", appointmentRouter);
app.use("/api/v1/auth/",authRouter);
app.use("/api/v1/hospital/",hospitalRouter);
app.use("/api/v1/scan/",scanRequestRouter);

export default app;
