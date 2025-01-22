import mongoose, { Schema } from "mongoose";

const admittedPatientSchema = new mongoose.Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Links to User
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    bedHistory: [
      {
        bed: { type: Schema.Types.ObjectId, ref: "Bed", required: true }, // Links to Bed
        admissionDate: { type: Date, required: true }, // Date of room assignment
        dischargeDate: { type: Date }, // Date of discharge from the room (null if still in the room)
      },
    ],
    status: {
      type: String,
      enum: ["admitted","payment pending", "discharged"],
    },
  },
  {
    timestamps: true,
  }
);

export const AdmittedPatient = mongoose.model(
  "AdmittedPatient",
  admittedPatientSchema
);
