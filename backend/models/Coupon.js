import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, unique: true, uppercase: true },
  discountType: { type: String, enum: ['percentage', 'fixed'] },
  discountValue: { type: Number },
  minPurchase: { type: Number },
  expiryDate: { type: Date },
  isActive: { type: Boolean, default: true }
});

export default mongoose.model('Coupon', couponSchema);
