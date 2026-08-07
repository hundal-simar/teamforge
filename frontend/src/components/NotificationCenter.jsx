import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import Avatar from './Avatar';

const notificationText = {
  mention: (n) => `@${n.payload.actorUsername} mentioned you in a comment`,
  assignment: (n) => `@${n.payload.actorUsername} assigned you a task`,
};

const notificationLink = (n) => {
  if (n.payload.projectId && n.payload.taskId) {
    return `/projects/${n.payload.projectId}?task=${n.payload.taskId}${
      n.payload.commentId ? `&comment=${n.payload.commentId}` : ''
    }`;
  }
  if (n.payload.projectId) return `/projects/${n.payload.projectId}`;
  return '#';
};

const groupByDate = (notifications) => {
  const groups = { Today: [], Yesterday: [], Earlier: [] };
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (const n of notifications) {
    const created = new Date(n.createdAt).toDateString();
    if (created === today) groups.Today.push(n);
    else if (created === yesterday) groups.Yesterday.push(n);
    else groups.Earlier.push(n);
  }
  return groups;
};

export default function NotificationCenter() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications?limit=30');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNew = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };
    socket.on('notification:new', handleNew);
    return () => socket.off('notification:new', handleNew);
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    const handleEscape = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await api.patch(`/notifications/${notificationId}/read`);
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await api.patch('/notifications/read-all');
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const grouped = groupByDate(notifications);

  return (
    <div className="relative antialiased" ref={panelRef}>
      {/* Notification Trigger Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-xl transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-indigo-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-zinc-950 shadow-sm shadow-indigo-500/50">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Mobile Overlay */}
          <div
            className="fixed inset-0 z-40 sm:hidden bg-black/60 backdrop-blur-xs"
            onClick={() => setOpen(false)}
          />

          {/* Notifications Dropdown Panel */}
          <div className="fixed sm:absolute right-0 top-0 sm:top-full sm:mt-2 z-50 w-full sm:w-96 h-full sm:h-auto sm:max-h-[32rem] bg-zinc-900/95 border border-zinc-800/90 sm:rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-xl overflow-y-auto flex flex-col divide-y divide-zinc-800/60 animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 backdrop-blur-md sticky top-0 z-10">
              <span className="text-xs font-bold text-zinc-100 tracking-tight">
                Notifications
              </span>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="sm:hidden text-zinc-400 hover:text-zinc-200 text-lg leading-none cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content States */}
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="p-6 text-center text-xs text-zinc-500 font-medium">
                  Loading notifications...
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="p-8 text-center text-xs text-zinc-500 font-medium">
                  You're all caught up.
                </div>
              )}

              {!loading &&
                Object.entries(grouped).map(
                  ([groupLabel, items]) =>
                    items.length > 0 && (
                      <div key={groupLabel}>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-4 pt-3 pb-1.5 bg-zinc-950/40">
                          {groupLabel}
                        </p>
                        {items.map((n) => (
                          <Link
                            key={n._id}
                            to={notificationLink(n)}
                            onClick={() => {
                              if (!n.isRead) handleMarkAsRead(n._id);
                              setOpen(false);
                            }}
                            className={`flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/40 last:border-b-0 ${
                              n.isRead ? 'opacity-70' : 'bg-indigo-500/5'
                            }`}
                          >
                            <Avatar
                              username={n.payload.actorUsername}
                              avatarUrl={n.payload.actorAvatar}
                              size="sm"
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs ${
                                  n.isRead
                                    ? 'text-zinc-400'
                                    : 'text-zinc-100 font-semibold'
                                }`}
                              >
                                {(notificationText[n.type] ||
                                  (() => 'New notification'))(n)}
                              </p>
                              <p className="text-[10px] text-zinc-500 mt-1">
                                {new Date(n.createdAt).toLocaleString(
                                  undefined,
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}
                              </p>
                            </div>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0 shadow-sm shadow-indigo-500/50" />
                            )}
                          </Link>
                        ))}
                      </div>
                    )
                )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}