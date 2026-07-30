import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';

export default function WorkspaceSettingsPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [nameDraft, setNameDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);

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
    try {
      await api.put(`/workspaces/${workspaceId}/members/${memberId}`, {
        role: newRole,
      });

      fetchWorkspace();
    } catch (err) {
      console.error('Failed to update role', err);
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
      <p className="p-6 text-sm text-gray-500">
        Loading settings...
      </p>
    );
  }

  if (!workspace) {
    return (
      <p className="p-6 text-sm text-gray-500">
        Workspace not found.
      </p>
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
    <div className="p-6 max-w-2xl">
      <Link
        to={`/workspaces/${workspaceId}`}
        className="text-xs text-indigo-600 hover:underline"
      >
        ← Back to workspace
      </Link>

      <h1 className="text-xl font-semibold mt-2 mb-6">
        Workspace Settings
      </h1>

      {/* Workspace Name */}
      {canManage ? (
        <section className="mb-8">
          <label className="text-xs text-gray-500 block mb-1">
            Workspace name
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={handleRename}
              className="flex-1 text-sm border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </section>
      ) : (
        <section className="mb-8">
          <label className="text-xs text-gray-500 block mb-1">
            Workspace name
          </label>

          <p className="text-sm text-gray-900">
            {workspace.name}
          </p>
        </section>
      )}

      {/* Members */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Members
        </h2>

        <ul className="space-y-2">
          {workspace.members.map((member) => (
            <li
              key={member.user._id}
              className="flex items-center justify-between border border-gray-100 rounded px-3 py-2"
            >
              <div>
                <p className="text-sm text-gray-900">
                  {member.user.username}
                </p>

                <p className="text-xs text-gray-500">
                  {member.user.email}
                </p>
              </div>

              {canManage ? (
                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(e) =>
                      handleRoleChange(
                        member.user._id,
                        e.target.value
                      )
                    }
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>

                  <button
                    onClick={() =>
                      setConfirmAction({
                        type: 'removeMember',
                        payload: member.user._id,
                      })
                    }
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <span className="text-xs text-gray-500 capitalize">
                  {member.role}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Pending Invites */}
      {canManage && pendingInvites.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Pending Invites
          </h2>

          <ul className="space-y-2">
            {pendingInvites.map((invite) => (
              <li
                key={invite.token}
                className="text-sm text-gray-600 border border-gray-100 rounded px-3 py-2"
              >
                {invite.email}{' '}
                <span className="text-xs text-gray-400">
                  ({invite.role})
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Danger Zone */}
      {isOwnerUser && (
        <section className="border-t border-gray-200 pt-6">
          <h2 className="text-sm font-semibold text-red-600 mb-2">
            Danger Zone
          </h2>

          <button
            onClick={() =>
              setConfirmAction({
                type: 'deleteWorkspace',
              })
            }
            className="text-sm bg-red-600 text-white rounded px-4 py-2 hover:bg-red-700"
          >
            Delete Workspace
          </button>
        </section>
      )}

      {confirmAction?.type === 'removeMember' && (
        <ConfirmDialog
          title="Remove member?"
          message="This member will lose access to this workspace immediately."
          confirmLabel="Remove"
          onConfirm={() =>
            handleRemoveMember(confirmAction.payload)
          }
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