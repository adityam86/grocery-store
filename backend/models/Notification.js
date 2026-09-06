import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String },
  message: { type: String },
  isRead: { type: Boolean, default: false },
  type: { type: String, enum: ['order', 'promo', 'system'] }
}, {
  timestamps: true
});

export default mongoose.model('Notification', notificationSchema);
