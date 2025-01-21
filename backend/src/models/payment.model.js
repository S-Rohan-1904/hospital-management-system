import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['appointment','discharge'], 
    },
    order_id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['created', 'paid'], // Matches Razorpay statuses
      default: 'created',
    },
  },
  { timestamps: true } 
);

// Export the Payment model
export const Payment = mongoose.model('Payment', paymentSchema);
