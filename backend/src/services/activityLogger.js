import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async ({ entityType, entityId, action, userId, metadata = {} }) => {
  try {
    await ActivityLog.create({
      entityType,
      entityId,
      action,
      user: userId,
      metadata,
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};