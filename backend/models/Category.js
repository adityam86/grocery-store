import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  hindiName: { type: String },
  icon: { type: String },
  description: { type: String }
});

export default mongoose.model('Category', categorySchema);
