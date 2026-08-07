import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useDispatch } from 'react-redux';
import { addWorkspace } from '../features/workspace/workspaceSlice';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';

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
      <div className="min-h-screen bg-zinc-950 p-6 sm:p-8 lg:p-10 relative selection:bg-indigo-500 selection:text-white antialiased">
        <div className="max-w-7xl mx-auto">
          {/* Skeleton Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-800/60 animate-pulse">
            <div className="h-8 w-48 bg-zinc-900 rounded-xl"></div>
            <div className="h-10 w-36 bg-zinc-900 rounded-xl"></div>
          </div>
          
          {/* Skeleton Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 sm:p-8 lg:p-10 relative overflow-hidden selection:bg-indigo-500 selection:text-white antialiased">
      {/* Background Radial Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-800/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Your Workspaces
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Select or manage your active team environments
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium text-sm rounded-xl px-5 py-2.5 shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer self-start sm:self-auto"
          >
            <span className="text-base font-bold">+</span> Create Workspace
          </button>
        </div>

        {/* Empty State */}
        {workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl rounded-2xl shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">No workspaces found</h3>
              <p className="text-sm text-zinc-400 max-w-sm">
                You're not part of any workspace yet. Create one to get started.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium underline transition-colors cursor-pointer"
            >
              Create your first workspace
            </button>
          </div>
        ) : (
          /* Workspace Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws) => (
              <div
                key={ws._id}
                onClick={() => navigate(`/workspaces/${ws._id}`)}
                className="group relative bg-zinc-900/60 border border-zinc-800/80 hover:border-indigo-500/50 backdrop-blur-xl rounded-2xl p-6 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors tracking-tight truncate">
                      {ws.name}
                    </h3>
                    {ws.isOwner && (
                      <span className="text-[10px] font-semibold tracking-wide uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full px-2.5 py-0.5 shrink-0">
                        Owner
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400">
                    {ws.memberCount} {ws.memberCount === 1 ? 'member' : 'members'} · {ws.projectCount}{' '}
                    {ws.projectCount === 1 ? 'project' : 'projects'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                  <Link
                    to={`/workspaces/${ws._id}/settings`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-medium text-zinc-400 hover:text-indigo-400 transition-colors inline-flex items-center gap-1 group/link"
                  >
                    <span>Settings</span>
                    <svg className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  <span className="text-xs font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal render */}
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
    </div>
  );
}