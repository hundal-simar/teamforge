import { Worker } from 'bullmq';
import redis from '../config/redis.js';
import { sendInviteEmail, sendDueDateReminderEmail } from '../utils/mailer.js';

const connection = {
  host: redis.options.host,
  port: redis.options.port,
  password: redis.options.password,
};

const emailWorker = new Worker(
  'emailQueue',
  async (job) => {
    
    if (job.name === 'invite') {
      const { toEmail, workspaceName, inviteLink } = job.data;
      await sendInviteEmail(toEmail, workspaceName, inviteLink);
    } else if (job.name === 'due-date-reminder') {
      const { toEmail, taskTitle, dueDate } = job.data;
      await sendDueDateReminderEmail(toEmail, taskTitle, dueDate);
    } else {
      throw new Error(`Unknown job type: ${job.name}`);
    }
  },
  { connection }
);


emailWorker.on('failed', (job, err) => {
  console.error(`Email job ${job.id} (${job.name}) failed:`, err.message);
});

emailWorker.on('completed', (job) => {
  console.log(`Email job ${job.id} (${job.name}) completed`);
});

export default emailWorker;