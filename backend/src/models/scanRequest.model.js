import mongoose, { Schema } from "mongoose";

const scanRequestSchema = new Schema(
  {
    description: { type: String, required: true }, // what the doctor wants
    patient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scanCentre: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hospital: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    dateOfUpload: { type: Date }, // when the scan is uploaded/updated
    appointment: { type: Schema.Types.ObjectId, ref: "Appointment" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    scanDocument: String,
  },
  {
    timestamps: true,
  }
);

export const ScanRequest = mongoose.model("ScanRequest", scanRequestSchema);
