import Lead from '../models/Lead.js';
import Activity from '../models/Activity.js';

const logActivity = async (user, action, lead) => {
  await Activity.create({ user: user._id, action, entity: 'Lead', entityId: lead._id, entityName: lead.name });
};

export const getLeads = async (req, res) => {
  try {
    const { status, assignedTo, source, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (source) filter.source = source;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ leads, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createLead = async (req, res) => {
  try {
    const lead = await Lead.create({ ...req.body, createdBy: req.user._id });
    await logActivity(req.user, 'Created lead', lead);
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTo', 'name email');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    await logActivity(req.user, `Updated lead status to ${lead.status}`, lead);
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    await logActivity(req.user, 'Deleted lead', lead);
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
