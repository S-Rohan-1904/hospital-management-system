import mongoose, { Schema } from "mongoose";

const foodOrderedSchema = new mongoose.Schema({
  admittedPatientId: {
    type: Schema.Types.ObjectId,
    ref: "AdmittedPatient",
    required: true,
  },
  foodId: { type: Schema.Types.ObjectId, ref: "FoodAvailable", required: true }, // Links to FoodAvailable
  quantity: { type: Number, required: true }, // Quantity of the food item ordered
  orderDate: { type: Date, default: Date.now }, // Date of the order
  totalPrice: { type: Number, required: true }, // Calculated total price
});

export const FoodOrdered = mongoose.model("FoodOrdered", foodOrderedSchema);
