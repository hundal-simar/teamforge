import Notification from '../models/Notification.js';
import { emitToUser } from '../config/socket.js';


export const createNotification = async ({ userId, type, payload = {} }) => {
  try {
    const notification = await Notification.create({ user: userId, type, payload });
    emitToUser(userId.toString(), 'notification:new', notification);
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};