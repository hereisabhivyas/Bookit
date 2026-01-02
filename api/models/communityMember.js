import mongoose from 'mongoose';

const communityMemberSchema = new mongoose.Schema({
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  status: { type: String, enum: ['active', 'pending', 'banned'], default: 'active' },
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Compound index for unique membership
communityMemberSchema.index({ communityId: 1, userEmail: 1 }, { unique: true });

const CommunityMember = mongoose.model('CommunityMember', communityMemberSchema);

export default CommunityMember;
