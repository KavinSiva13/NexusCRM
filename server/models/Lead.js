import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  email: String,
  company: String,
  source: { type: String, enum: ['Website', 'Ads', 'Referral', 'Social Media', 'Other'], default: 'Website' },
  status: { type: String, enum: ['New', 'Contacted', 'Follow-up', 'Converted', 'Lost'], default: 'New' },
  notes: String,
  followUpDate: Date,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Lead', leadSchema);
