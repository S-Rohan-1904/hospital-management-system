import mongoose, { Schema } from "mongoose";

const doctorSchema = new Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },
});

export const Doctor = mongoose.model("Doctor", doctorSchema);
