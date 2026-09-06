import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  hindiName: { type: String, default: '' },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  description: { type: String, default: '' },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  reviews: [reviewSchema],
  tag: { type: String, default: '' },
  stockQuantity: { type: Number, default: 50 },
  inStock: { type: Boolean, default: true }
});

const Product = mongoose.model('Product', productSchema);
export default Product;
