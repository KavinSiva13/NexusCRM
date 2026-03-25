import Task from '../models/Task.js';
import Activity from '../models/Activity.js';

export const getTasks = async (req, res) => {
  try {
    const { status, assignedTo, today } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (today === 'true') {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);
      filter.dueDate = { $gte: start, $lte: end };
    }
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('relatedLead', 'name')
      .populate('relatedCustomer', 'name')
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    await Activity.create({
      user: req.user._id, action: 'Created task', entity: 'Task',
      entityId: task._id, entityName: task.title
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTo', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (req.body.status === 'Completed') {
      await Activity.create({
        user: req.user._id, action: 'Completed task', entity: 'Task',
        entityId: task._id, entityName: task.title
      });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
