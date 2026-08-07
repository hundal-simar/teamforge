import { useState } from 'react';
import api from '../api/axios';

export default function QuickAddTask({ projectId, columnId, onCreated, workspaceMembers = [] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/projects/${projectId}/tasks`, {
        title,
        columnId,
        assignedTo: assignedTo || undefined,
      });
      onCreated(data);
      setTitle('');
      setAssignedTo('');
      setOpen(false);
    } catch (err) {
      console.error('Failed to create task', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-xl px-2.5 py-2 transition-all duration-200 flex items-center gap-1.5 cursor-pointer group"
      >
        <span className="text-zinc-500 group-hover:text-indigo-400 transition-colors text-sm font-bold">
          +
        </span>
        <span>Add task</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 mt-1 p-2.5 bg-zinc-900/90 border border-zinc-800/90 rounded-2xl shadow-xl backdrop-blur-md antialiased"
    >
      <input
        autoFocus
        type="text"
        placeholder="Task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-xs bg-zinc-950/80 text-zinc-100 border border-zinc-800 rounded-xl px-3 py-2 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
      />

      {workspaceMembers.length > 0 && (
        <div className="relative">
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full text-xs bg-zinc-950/80 text-zinc-300 border border-zinc-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 cursor-pointer appearance-none pr-7"
          >
            <option value="" className="bg-zinc-900 text-zinc-400">
              Unassigned
            </option>
            {workspaceMembers.map((m) => (
              <option key={m.user._id} value={m.user._id} className="bg-zinc-900 text-zinc-200">
                {m.user.username}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px]">
            ▼
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 pt-0.5">
        <button
          type="submit"
          disabled={submitting}
          className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
        >
          {submitting && (
            <svg className="animate-spin w-3 h-3 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          <span>{submitting ? 'Adding...' : 'Add Task'}</span>
        </button>

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-xl px-3 py-1.5 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}