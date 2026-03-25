import express from 'express';
import Activity from '../models/Activity.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.get('/', async (req, res) => {
  try {
    const { entity, entityId } = req.query;
    const filter = {};
    if (entity) filter.entity = entity;
    if (entityId) filter.entityId = entityId;
    const activities = await Activity.find(filter)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
export default router;
