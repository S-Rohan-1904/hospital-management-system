import mongoose, { Schema } from "mongoose";

const foodAvailableSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    }, // Links to Hospital
    foodItem: { type: String, required: true }, // Name of the food item
    description: { type: String }, // Optional: Description of the food item
    available: { type: Boolean, default: true }, // Availability status
    price: { type: Number, required: true }, // Price of the food item
  },
  {
    timestamps: true,
  }
);

export const FoodAvailable = mongoose.model(
  "FoodAvailable",
  foodAvailableSchema
);
