import http from 'http';
import app from './app.js'; 
import { initSocket } from './socket/socketServer.js';
import './queues/emailWorker.js'; 
import { startDueDateReminderJob } from './jobs/dueDateReminderJob.js';


const server = http.createServer(app); // wraps Express app in a plain HTTP server
initSocket(server); // attaches Socket.io to that SAME server — same port, no separate listener
startDueDateReminderJob();


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));