import { useState } from 'react';
import api from '../api/axios';

export default function QuickAddTask({ projectId, columnId, onCreated }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/projects/${projectId}/tasks`, { title, columnId });
      onCreated(data);
      setTitle('');
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
        className="text-left text-sm text-gray-500 hover:text-gray-800 px-1 py-1.5"
      >
        + Add task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-1.5 mt-1">
      <input
        autoFocus
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => !title && setOpen(false)}
        className="flex-1 text-sm border border-gray-300 rounded px-2 py-1.5"
      />
      <button
        type="submit"
        disabled={submitting}
        className="text-xs bg-indigo-600 text-white rounded px-2.5 py-1.5 disabled:opacity-50"
      >
        Add
      </button>
    </form>
  );
}