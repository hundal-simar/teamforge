import mongoose from 'mongoose';
import ActivityLog from '../models/ActivityLog.js';
import Task from '../models/Task.js';

// GET /api/projects/:id/activity?page=1&limit=20
export const getProjectActivity = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Step 1: resolve which tasks belong to this project — ActivityLog
    // doesn't store project directly, only entityType + entityId, so we
    // need task ids to match Task-level log entries against this project.
    const taskIds = await Task.find({ project: projectId }).distinct('_id');

    const matchStage = {
      $or: [
        { entityType: 'Project', entityId: new mongoose.Types.ObjectId(projectId) },
        { entityType: 'Task', entityId: { $in: taskIds } },
      ],
    };

    const activity = await ActivityLog.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users', // confirm this matches your actual MongoDB collection name for User
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          action: 1,
          entityType: 1,
          entityId: 1,
          metadata: 1,
          createdAt: 1,
          'userInfo._id': 1,
          'userInfo.username': 1,
          'userInfo.email': 1,
        },
      },
    ]);

    const total = await ActivityLog.countDocuments(matchStage);

    res.status(200).json({
      activity,
      pagination: { page, limit, total, hasMore: skip + activity.length < total },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching activity' });
  }
};