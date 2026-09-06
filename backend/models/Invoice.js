import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  invoiceNumber: { type: String, unique: true },
  amount: { type: Number },
  pdfUrl: { type: String },
  status: { type: String, default: 'Generated' }
}, {
  timestamps: true
});

export default mongoose.model('Invoice', invoiceSchema);
