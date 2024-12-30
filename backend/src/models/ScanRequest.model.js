import mongoose, { Schema } from "mongoose";

const scanRequestSchema = new Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  date: Date,
  status: { type: String, enum: ["pending", "completed", "cancelled"] },
  documentUrl: {
    type: String,
  },
});

export const ScanRequestSchema = mongoose.model(
  "ScanRequest",
  scanRequestSchema
);
