import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, required: true },
  members: { type: Number, default: 0 },
  events: { type: Number, default: 0 },
  posts: { type: Number, default: 0 },
  tags: { type: [String], default: [] },
  image: { type: String, required: true },
  description: { type: String, required: true },
  badge: { type: String, enum: ['featured', 'new', ''], default: '' },
  isPrivate: { type: Boolean, default: false },
  requireApproval: { type: Boolean, default: false },
  allowMemberInvites: { type: Boolean, default: true },
  createdBy: { type: String },
}, { timestamps: true });

const Community = mongoose.model('Community', communitySchema);

export default Community;
