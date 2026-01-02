import mongoose from 'mongoose';

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    paymentId: { type: String, default: '' },
    signature: { type: String, default: '' },
    amount: { type: Number, default: 0 }, // stored in base currency units (e.g., INR)
    currency: { type: String, default: 'INR' },
    status: { type: String, default: 'created' },
    email: { type: String, default: '' },
    method: { type: String, default: '' },
    contact: { type: String, default: '' },
    notes: { type: Schema.Types.Mixed, default: {} },
    capturedAt: { type: Date },
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
