import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  entity: { type: String, required: true }, // 'Lead', 'Customer', 'Task'
  entityId: mongoose.Schema.Types.ObjectId,
  entityName: String,
  details: String,
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);
