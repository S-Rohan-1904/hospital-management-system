import mongoose from "mongoose";

const { Schema } = mongoose;

const wardSchema = new Schema(
  {
    hospital: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    name: {
      type: String,
      required: true,
      enum: ["General Ward", "ICU"],
    },
    capacity: {
      type: Number,
      required: true,
    },
    unoccupiedBeds: {
      type: Number,
      required: true,
    },
    bedCost: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Ward = mongoose.model("Ward", wardSchema);
