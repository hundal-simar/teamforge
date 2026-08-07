import { useEffect, useState } from 'react';
import api from '../api/axios';

const actionLabels = {
  task_created: 'created a task',
  task_moved: 'moved a task',
  task_deleted: 'deleted a task',
  project_created: 'created this project',
  columns_updated: 'updated the board columns',
  member_joined: 'joined the workspace',
  invite_sent: 'invited a teammate',
  comment_added: 'commented on a task',
  comment_deleted: 'deleted a comment',
};

export default function ActivityFeed({ projectId }) {
  const [activity, setActivity] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async (pageNum) => {
    setLoading(true);

    try {
      const { data } = await api.get(
        `/projects/${projectId}/activity?page=${pageNum}&limit=20`
      );

      setActivity((prev) => {
        if (pageNum === 1) {
          return data.activity;
        }

        const existingIds = new Set(
          prev.map((item) => item._id)
        );

        const newItems = data.activity.filter(
          (item) => !existingIds.has(item._id)
        );

        return [...prev, ...newItems];
      });

      setHasMore(data.pagination.hasMore);
    } catch (err) {
      console.error('Failed to load activity', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchActivity(1);
  }, [projectId]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivity(nextPage);
  };

  return (
    <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl p-5 flex flex-col h-full select-none antialiased">
      {/* Feed Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Activity Log
          </h3>
        </div>
        <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-800/60 border border-zinc-700/50 px-2 py-0.5 rounded-md">
          {activity.length} Events
        </span>
      </div>

      {/* Activity List Timeline */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {activity.length === 0 && !loading ? (
          <p className="text-xs text-zinc-500 text-center py-6">
            No activity recorded yet.
          </p>
        ) : (
          <ul className="relative space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-zinc-800/80">
            {activity.map((entry) => (
              <li key={entry._id} className="relative pl-6 text-xs group">
                {/* Timeline Dot */}
                <span className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-zinc-900 border border-zinc-700/80 group-hover:border-indigo-500/80 group-hover:bg-indigo-500/10 flex items-center justify-center transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 group-hover:bg-indigo-400 transition-colors" />
                </span>

                <div className="space-y-0.5">
                  <p className="text-zinc-300 leading-relaxed">
                    <strong className="font-semibold text-white">
                      {entry.userInfo?.username || 'User'}
                    </strong>{' '}
                    <span className="text-zinc-400">
                      {actionLabels[entry.action] || entry.action}
                    </span>
                  </p>

                  <time className="block text-[10px] font-medium text-zinc-500">
                    {new Date(entry.createdAt).toLocaleString(
                      undefined,
                      {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Load More Action */}
      {hasMore && (
        <div className="pt-4 mt-2 border-t border-zinc-800/60">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="w-full bg-zinc-800/60 hover:bg-zinc-800 disabled:opacity-50 text-zinc-300 hover:text-white font-medium text-xs rounded-xl py-2 px-3 border border-zinc-700/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              'Load More Activity'
            )}
          </button>
        </div>
      )}
    </aside>
  );
}