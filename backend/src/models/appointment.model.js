import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  date: Date,
  slot: String,
  status: { type: String, enum: ["scheduled", "rescheduled", "cancelled"] },
});

export const Appointment = mongoose.model("Appointment", appointmentSchema);
