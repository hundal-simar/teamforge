import mongoose from 'mongoose';
import Task from './Task.js';
import User from './User.js';


const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    type: {
      type: String,
      required: true,
    },

    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;