import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { useSocket } from '../context/SocketContext';

export default function WorkspaceSettingsPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [nameDraft, setNameDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionError, setActionError] = useState('');

  const fetchWorkspace = async () => {
    try {
      const { data } = await api.get(`/workspaces/${workspaceId}`);
      setWorkspace(data);
      setNameDraft(data.name);
    } catch (err) {
      console.error('Failed to load workspace', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  useEffect(() => {
    if (!socket || !workspaceId) return;
    socket.emit('workspace:join', workspaceId);

    const refresh = () => fetchWorkspace();
    socket.on('member:joined', refresh);
    socket.on('member:removed', refresh);
    socket.on('member:roleChanged', refresh);

    return () => {
      socket.emit('workspace:leave', workspaceId);
      socket.off('member:joined', refresh);
      socket.off('member:removed', refresh);
      socket.off('member:roleChanged', refresh);
    };
  }, [socket, workspaceId]);

  const handleRename = async () => {
    if (nameDraft.trim() === workspace.name) return;

    try {
      const { data } = await api.patch(`/workspaces/${workspaceId}`, {
        name: nameDraft.trim(),
      });

      setWorkspace(data);
    } catch (err) {
      console.error('Failed to rename workspace', err);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    setActionError('');
    try {
      await api.put(`/workspaces/${workspaceId}/members/${memberId}`, { role: newRole });
      fetchWorkspace();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);

      setConfirmAction(null);
      fetchWorkspace();
    } catch (err) {
      console.error('Failed to remove member', err);
    }
  };

  const handleDeleteWorkspace = async () => {
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete workspace', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 sm:p-8 flex items-center justify-center text-sm text-zinc-400 selection:bg-indigo-500 selection:text-white">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 flex items-center justify-center text-sm text-zinc-400">
        Workspace not found.
      </div>
    );
  }

  const pendingInvites = workspace.inviteTokens || [];

  const currentUserRole = (() => {
    if (!workspace || !user) return null;

    if (
      workspace.owner?._id === user._id ||
      workspace.owner === user._id
    ) {
      return 'owner';
    }

    const memberEntry = workspace.members.find(
      (m) => (m.user?._id || m.user) === user._id
    );

    return memberEntry?.role || null;
  })();

  const canManage =
    currentUserRole === 'owner' ||
    currentUserRole === 'admin';

  const isOwnerUser =
    currentUserRole === 'owner';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center relative overflow-hidden selection:bg-indigo-500 selection:text-white antialiased">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Main Glass Card */}
      <div className="w-full max-w-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10 space-y-8">
        
        {/* Navigation & Header */}
        <div>
          <Link
            to={`/workspaces/${workspaceId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors mb-4 group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to workspace
          </Link>

          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Workspace Settings
          </h1>

          <div className="flex items-center gap-2 mt-2">
            <Avatar username={workspace.owner.username} avatarUrl={workspace.owner.avatar} size="xs" />
            <p className="text-xs text-zinc-400">
              Owned by <span className="font-medium text-zinc-200">{workspace.owner.username}</span>
            </p>
          </div>
        </div>

        {/* Action Error Notification */}
        {actionError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in duration-200">
            <p className="text-xs text-red-400 font-medium text-center">{actionError}</p>
          </div>
        )}

        {/* Workspace Name Section */}
        <section className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Workspace Name
          </label>

          {canManage ? (
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={handleRename}
              className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-zinc-100 placeholder:text-zinc-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200"
            />
          ) : (
            <div className="p-3 bg-zinc-950/40 border border-zinc-800/50 rounded-xl">
              <p className="text-sm font-medium text-zinc-200">{workspace.name}</p>
            </div>
          )}
        </section>

        {/* Members Section */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Members
          </h2>
          <ul className="space-y-2">
            {workspace.members.map((member) => {
              const isOwnerRow = member.role === 'owner';
              return (
                <li
                  key={member.user._id}
                  className="flex items-center justify-between bg-zinc-950/40 border border-zinc-800/50 hover:border-zinc-700/60 transition-colors rounded-xl p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar username={member.user.username} avatarUrl={member.user.avatar} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 truncate">{member.user.username}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{member.user.email}</p>
                    </div>
                  </div>

                  {isOwnerRow ? (
                    <span className="text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg px-2.5 py-1">
                      Owner
                    </span>
                  ) : canManage ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                        className="bg-zinc-900 border border-zinc-700/70 text-zinc-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => setConfirmAction({ type: 'removeMember', payload: member.user._id })}
                        className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors px-1 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500 capitalize font-medium">{member.role}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Pending Invites Section */}
        {canManage && pendingInvites.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Pending Invites
            </h2>
            <ul className="space-y-2">
              {pendingInvites.map((invite) => (
                <li
                  key={invite.token}
                  className="flex items-center justify-between text-xs bg-zinc-950/30 border border-zinc-800/40 rounded-xl p-3"
                >
                  <span className="font-medium text-zinc-300">{invite.email}</span>
                  <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                    {invite.role}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Danger Zone */}
        {isOwnerUser && (
          <section className="border-t border-zinc-800/80 pt-6 space-y-3">
            <h2 className="text-xs font-semibold text-red-400 uppercase tracking-wider">
              Danger Zone
            </h2>
            <p className="text-xs text-zinc-500">
              Permanently remove this workspace, including all associated projects, tasks, and data.
            </p>
            <button
              onClick={() =>
                setConfirmAction({
                  type: 'deleteWorkspace',
                })
              }
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-medium text-xs rounded-xl px-4 py-2.5 transition-all cursor-pointer"
            >
              Delete Workspace
            </button>
          </section>
        )}

      </div>

      {/* Confirmation Modals */}
      {confirmAction?.type === 'removeMember' && (
        <ConfirmDialog
          title="Remove member?"
          message="This member will lose access to this workspace immediately."
          confirmLabel="Remove"
          onConfirm={() => handleRemoveMember(confirmAction.payload)}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {confirmAction?.type === 'deleteWorkspace' && (
        <ConfirmDialog
          title="Delete this workspace?"
          message="This permanently deletes the workspace and all its projects and tasks. This cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDeleteWorkspace}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}