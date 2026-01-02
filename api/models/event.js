import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, default: 0 },
  image: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  attendees: { type: Number, default: 0 },
  badge: { type: String, enum: ['hot', 'featured', 'trending', 'new', ''], default: '' },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdBy: { type: String, required: true },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  capacity: { type: Number, default: 0 },
  ticketsAvailable: { type: Number, default: 0 },
  venue: { type: String, default: '' },
  amenities: { type: String, default: '' },
  images: [{ type: String }],
  bookings: [{
    userEmail: { type: String },
    userName: { type: String },
    quantity: { type: Number, default: 1 },
    bookedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;
