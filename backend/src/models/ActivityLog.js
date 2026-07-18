import mongoose from 'mongoose';
import Task from './Task.js';
import User from './User.js';


const activityLogSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ["Task", "Project", "Workspace"],
      required: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);
const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;