import mongoose from "mongoose";

const { Schema } = mongoose;

const bedSchema = new Schema(
  {
    bedNumber: {
      type: Number,
      required: true,
    },
    ward: {
      type: Schema.Types.ObjectId,
      ref: "Ward",
      required: true,
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
    floor: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Bed = mongoose.model("Bed", bedSchema);
