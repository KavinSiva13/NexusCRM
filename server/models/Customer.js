import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: String,
  email: String,
  phone: String,
  address: String,
  services: [String],
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Overdue', 'Partial'], default: 'Pending' },
  accountManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  revenue: { type: Number, default: 0 },
  convertedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);
