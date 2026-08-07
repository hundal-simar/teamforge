import { Worker } from 'bullmq';
import redis from '../config/redis.js';
import { sendInviteEmail, sendDueDateReminderEmail } from '../utils/mailer.js';

let emailWorker = null;

if (process.env.NODE_ENV !== 'test') {
  

  emailWorker = new Worker(
    'emailQueue',
    async (job) => {
      if (job.name === 'invite') {
        const { toEmail, workspaceName, inviteLink } = job.data;
        await sendInviteEmail(toEmail, workspaceName, inviteLink);
      } else if (job.name === 'due-date-reminder') {
        const { toEmail, taskTitle, dueDate } = job.data;
        await sendDueDateReminderEmail(toEmail, taskTitle, dueDate);
      }
    },
      { connection: { url: process.env.REDIS_URL } }
 
  );

  emailWorker.on('failed', (job, err) => {
    console.error(`Email job ${job.id} (${job.name}) failed:`, err.message);
  });

  emailWorker.on('completed', (job) => {
    console.log(`Email job ${job.id} (${job.name}) completed`);
  });
}

export default emailWorker;