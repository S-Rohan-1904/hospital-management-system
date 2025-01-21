import mongoose, { Schema } from "mongoose";
import { v4 as uuidV4 } from 'uuid';

const appointmentSchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: "User", required: true },
  doctor: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
    enum: ["scheduled", "rescheduled", "rejected", "pending", "payment pending"],
  },
  description: String,
  onlineAppointment: {
    type: Boolean,
    default: false,
  },
  meetingId : {
    type: String,
    default:uuidV4,
    required: true,
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: "Payment"
  }
});

export const Appointment = mongoose.model("Appointment", appointmentSchema);
