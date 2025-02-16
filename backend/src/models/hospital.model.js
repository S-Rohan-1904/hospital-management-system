import mongoose, { Schema } from "mongoose";

const hospitalSchema = new Schema({
  name: String,
  address: String,
  contact: String,
  location: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: [Number],
  },
  doctors: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

export const Hospital = mongoose.model("Hospital", hospitalSchema);
