import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String }
}, {
  timestamps: true
});

export default mongoose.model('Review', reviewSchema);
