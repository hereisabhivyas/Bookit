import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  senderId: { type: String, required: true }, // email of sender
  senderName: { type: String, required: true },
  content: { type: String, required: true }, // encrypted for private communities
  isEncrypted: { type: Boolean, default: false },
  type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  metadata: {
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    editedAt: { type: Date },
    deletedAt: { type: Date },
  },
}, { timestamps: true });

// Index for efficient querying
messageSchema.index({ communityId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
