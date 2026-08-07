import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addWorkspace } from '../features/workspace/workspaceSlice';

export default function CreateWorkspaceModal({ onClose, onCreated }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const slug = name.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      const newWorkspace = await dispatch(addWorkspace({ name: name.trim(), slug })).unwrap();

      if (onCreated) {
        onCreated(newWorkspace);
      } else {
        onClose();
        navigate(`/workspaces/${newWorkspace._id}`);
      }
    } catch (err) {
      setError(err || 'Failed to create workspace');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md shadow-2xl relative z-10 space-y-5 antialiased"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">
            Create Workspace
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-800/50 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Workspace Name <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Corp or Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-zinc-100 placeholder:text-zinc-500 text-xs rounded-xl px-3.5 py-2.5 outline-none transition-all duration-200"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-2 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="text-xs font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white rounded-xl px-4 py-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
            >
              {submitting ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}