import Customer from '../models/Customer.js';
import Activity from '../models/Activity.js';

const logActivity = async (user, action, customer) => {
  await Activity.create({ user: user._id, action, entity: 'Customer', entityId: customer._id, entityName: customer.name });
};

export const getCustomers = async (req, res) => {
  try {
    const { search, paymentStatus, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
    const total = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter)
      .populate('accountManager', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ customers, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('accountManager', 'name email');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create({ ...req.body, createdBy: req.user._id });
    await logActivity(req.user, 'Added customer', customer);
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('accountManager', 'name email');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    await logActivity(req.user, 'Updated customer', customer);
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
