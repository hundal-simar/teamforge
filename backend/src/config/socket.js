import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import User from '../models/User.js';

let io;

// projectId -> Map<userId, Set<socketId>>
// the Set matters: if the same user opens 2 tabs, both socket ids are tracked,
// but the user is only removed from presence once BOTH tabs disconnect
const presenceMap = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return next(new Error('No cookies provided'));

      const parsedCookies = cookie.parse(rawCookie);
      const token = parsedCookies.token;
      if (!token) return next(new Error('No token provided'));

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.user._id}`);

    socket.on('project:join', (projectId) => {
      socket.join(`project:${projectId}`);
      socket.currentProjectId = projectId;

      addToPresence(projectId, socket.user._id.toString(), socket.id);
      broadcastPresence(projectId);
    });

    socket.on('project:leave', (projectId) => {
      socket.leave(`project:${projectId}`);
      removeFromPresence(projectId, socket.user._id.toString(), socket.id);
    });

    socket.on('disconnect', () => {
      if (socket.currentProjectId) {
        removeFromPresence(socket.currentProjectId, socket.user._id.toString(), socket.id);
      }
    });
  });
};

const addToPresence = (projectId, userId, socketId) => {
  if (!presenceMap.has(projectId)) presenceMap.set(projectId, new Map());
  const userMap = presenceMap.get(projectId);

  if (!userMap.has(userId)) userMap.set(userId, new Set());
  userMap.get(userId).add(socketId);
};

const removeFromPresence = (projectId, userId, socketId) => {
  const userMap = presenceMap.get(projectId);
  if (!userMap) return;

  const socketSet = userMap.get(userId);
  if (!socketSet) return;

  socketSet.delete(socketId);

  // only drop the user entirely once ALL their tabs/sockets for this project are gone
  if (socketSet.size === 0) {
    userMap.delete(userId);
  }

  if (userMap.size === 0) {
    presenceMap.delete(projectId);
  }

  broadcastPresence(projectId);
};

const broadcastPresence = (projectId) => {
  const userMap = presenceMap.get(projectId);
  const count = userMap ? userMap.size : 0; // size of the Map = number of UNIQUE users, not sockets
  io.to(`project:${projectId}`).emit('presence:update', { projectId, count });
};

export const emitToProject = (projectId, event, payload) => {
  io.to(`project:${projectId}`).emit(event, payload);
};