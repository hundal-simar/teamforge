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
    <div className="w-72 border-l border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Activity
      </h3>

      <ul className="space-y-3">
        {activity.map((entry) => (
          <li key={entry._id} className="text-xs text-gray-600">
            <strong>{entry.userInfo?.username}</strong>{' '}
            {actionLabels[entry.action] || entry.action}

            <div className="text-gray-400">
              {new Date(entry.createdAt).toLocaleString(
                undefined,
                {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              )}
            </div>
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="mt-3 text-xs text-indigo-600 hover:underline disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
}