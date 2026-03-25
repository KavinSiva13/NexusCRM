import Lead from '../models/Lead.js';
import Customer from '../models/Customer.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalLeads, activeCustomers, convertedLeads, lostLeads,
      pendingTasks, todayTasks, monthlyRevenue, recentActivities,
      leadsByStatus, leadsBySource, monthlyLeads
    ] = await Promise.all([
      Lead.countDocuments(),
      Customer.countDocuments(),
      Lead.countDocuments({ status: 'Converted' }),
      Lead.countDocuments({ status: 'Lost' }),
      Task.countDocuments({ status: { $in: ['Pending', 'In Progress'] } }),
      Task.countDocuments({
        dueDate: {
          $gte: new Date(now.setHours(0,0,0,0)),
          $lte: new Date(now.setHours(23,59,59,999))
        }
      }),
      Customer.aggregate([{ $group: { _id: null, total: { $sum: '$revenue' } } }]),
      Activity.find().populate('user', 'name').sort({ createdAt: -1 }).limit(10),
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
      Lead.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } }
      ])
    ]);

    res.json({
      stats: {
        totalLeads,
        activeCustomers,
        dealsClosedMonth: convertedLeads,
        pendingFollowUps: pendingTasks,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
      },
      leadsByStatus,
      leadsBySource,
      monthlyLeads,
      recentActivities,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
