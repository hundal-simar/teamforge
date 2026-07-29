import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '../../routes/authRoutes.js';
import workspaceRoutes from '../../routes/workspaceRoutes.js';
import projectRoutes from '../../routes/projectRoutes.js';
import projectDetailRoutes from '../../routes/projectDetailRoutes.js';
import taskDetailRoutes from '../../routes/taskDetailRoutes.js';
import taskRoutes from '../../routes/taskRoutes.js';


const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/workspaces', projectRoutes); 
app.use('/api/projects', projectDetailRoutes);
app.use('/api/tasks', taskDetailRoutes);
app.use('/api/projects', taskRoutes);

export default app;