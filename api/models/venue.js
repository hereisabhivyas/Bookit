import mongoose from 'mongoose';

const { Schema } = mongoose;

const venueSchema = new Schema(
  {
    hostRequestId: { type: Schema.Types.ObjectId, ref: 'HostRequest', index: true },
    venueName: { type: String, required: true },
    businessType: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    website: { type: String, default: '' },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
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
          createdBy: { type: String, enum: ['user', 'owner'], default: 'user' },
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

const Venue = mongoose.model('Venue', venueSchema);
export default Venue;
