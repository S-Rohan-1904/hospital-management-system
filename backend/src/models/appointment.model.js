import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: "User" },
  doctor: { type: Schema.Types.ObjectId, ref: "User" },
  hospital: { type: Schema.Types.ObjectId, ref: "Hospital" },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["scheduled", "rescheduled", "rejected", "pending"],
  },
  description: String,
});

export const Appointment = mongoose.model("Appointment", appointmentSchema);
