import mongoose from 'mongoose';

const statusUpdateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String },
  image: { type: String },
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

const StatusUpdate = mongoose.model('StatusUpdate', statusUpdateSchema);

export default StatusUpdate;