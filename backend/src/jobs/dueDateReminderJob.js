import cron from 'node-cron';
import Task from '../models/Task.js';
import { emailQueue } from '../queues/emailQueue.js';

export const startDueDateReminderJob = () => {
  if (process.env.NODE_ENV === 'test') return;

  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const dueSoonTasks = await Task.find({
        dueDate: { $gte: now, $lte: in24Hours },
        assignedTo: { $ne: null },
        remindedAt: null,
      }).populate('assignedTo', 'username email');

      for (const task of dueSoonTasks) {
        if (emailQueue) {
          await emailQueue.add('due-date-reminder', {
            toEmail: task.assignedTo.email,
            taskTitle: task.title,
            dueDate: task.dueDate,
          });
        }

        task.remindedAt = new Date();
        await task.save();
      }

      console.log(
        `Due-date scan: queued ${dueSoonTasks.length} reminder(s)`
      );
    } catch (err) {
      console.error('Due-date reminder job failed:', err);
    }
  });
};