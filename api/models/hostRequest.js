// api/models/hostRequest.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const hostRequestSchema = new Schema(
  {
    venueName: { type: String, required: true },
    businessType: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    mapLink: { type: String, default: '' },
    website: { type: String, default: '' },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedByEmail: { type: String, required: true },
    capacity: { type: Number, default: 0 },
    amenities: { type: String, default: '' },
    pricePerHour: { type: Number, default: 0 },
    images: [{ type: String }],
    seats: [{
      id: { type: Number },
      label: { type: String, default: '' },
        price: { type: Number, default: 0 },
      bookings: [{
        date: { type: String },
        startTime: { type: String },
        endTime: { type: String },
        hours: { type: Number },
        createdBy: { type: String, enum: ['user', 'owner'], default: 'owner' },
        createdByEmail: { type: String }
      }]
    }],
    availabilitySlots: [{
      date: { type: String },
      startTime: { type: String },
      endTime: { type: String },
      availableSeats: { type: Number }
    }]
  },
  { timestamps: true }
);

const HostRequest = mongoose.model('HostRequest', hostRequestSchema);
export default HostRequest;