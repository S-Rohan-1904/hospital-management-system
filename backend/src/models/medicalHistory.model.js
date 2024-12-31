import mongoose, { Schema } from "mongoose";

const medicalHistorySchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: "User", required: true },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  hospital: {
    type: Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },
  startTime: { type: Date, required: true },
  endTime: { type: String, required: true },
  scanDocument: { type: String },
  diagnosis: { type: String, required: true },
  description: { type: String, required: true },
});

export const MedicalHistory = mongoose.model(
  "MedicalHistory",
  medicalHistorySchema
);
