import mongoose, { Schema } from "mongoose";

const medicalHistorySchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: "User" },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  hospital: {
    type: Schema.Types.ObjectId,
    ref: "Hospital",
  },
  date: { type: Date, required: true },
  slot: { type: String, required: true },
  scanDocument: { type: String, required: true },
  diagnosis: { type: String, required: true },
  description: { type: String, required: true },
});

export const MedicalHistory = mongoose.model(
  "MedicalHistory",
  medicalHistorySchema
);
