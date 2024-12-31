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
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  scanDocuments: [{ type: String }],
  diagnosis: { type: String, required: true },
  description: { type: String, required: true },
});

export const MedicalHistory = mongoose.model(
  "MedicalHistory",
  medicalHistorySchema
);
