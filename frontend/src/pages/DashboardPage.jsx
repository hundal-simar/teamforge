import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useDispatch } from 'react-redux';
import { addWorkspace } from '../features/workspace/workspaceSlice';

export default function DashboardPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/me/workspaces');
      setWorkspaces(data);
    } catch (err) {
      console.error('Failed to load workspaces', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  if (loading) {
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Your Workspaces</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white text-sm rounded px-4 py-2 hover:bg-indigo-700"
        >
          + Create Workspace
        </button>
      </div>

      {workspaces.length === 0 ? (
        <p className="text-sm text-gray-500">
          You're not part of any workspace yet. Create one to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <div
              key={ws._id}
              onClick={() => navigate(`/workspaces/${ws._id}`)}
              className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">{ws.name}</h3>
                {ws.isOwner && (
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 rounded px-1.5 py-0.5">
                    Owner
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {ws.memberCount} {ws.memberCount === 1 ? 'member' : 'members'} · {ws.projectCount}{' '}
                {ws.projectCount === 1 ? 'project' : 'projects'}
              </p>
              <Link
                to={`/workspaces/${ws._id}/settings`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-indigo-600 hover:underline mt-2 inline-block"
              >
                Settings
              </Link>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchWorkspaces();
          }}
        />
      )}
    </div>
  );
}