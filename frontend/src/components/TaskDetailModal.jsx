import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function TaskDetailModal({ taskId, onClose, onUpdated }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newSubtask, setNewSubtask] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [descDraft, setDescDraft] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const { data } = await api.get(`/tasks/${taskId}`);
        setTask(data);
        setTitleDraft(data.title);
        setDescDraft(data.description || '');
      } catch (err) {
        console.error('Failed to load task', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  const saveField = async (fields) => {
    try {
      const { data } = await api.patch(`/tasks/${taskId}`, fields);
      setTask(data);
      onUpdated?.(data);
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  const handleTitleSave = () => {
    setEditingTitle(false);
    if (titleDraft.trim() && titleDraft !== task.title) saveField({ title: titleDraft.trim() });
  };

  const handleDescBlur = () => {
    if (descDraft !== (task.description || '')) saveField({ description: descDraft });
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    try {
      const { data } = await api.post(`/tasks/${taskId}/subtasks`, { title: newSubtask.trim() });
      setTask(data);
      onUpdated?.(data);
      setNewSubtask('');
    } catch (err) {
      console.error('Failed to add subtask', err);
    }
  };

  const handleToggleSubtask = async (subtaskId, isDone) => {
    setTask((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((s) => (s._id === subtaskId ? { ...s, isDone } : s)),
    }));
    try {
      const { data } = await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`, { isDone });
      setTask(data);
      onUpdated?.(data);
    } catch (err) {
      console.error('Failed to toggle subtask', err);
      setTask((prev) => ({
        ...prev,
        subtasks: prev.subtasks.map((s) => (s._id === subtaskId ? { ...s, isDone: !isDone } : s)),
      }));
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    const previous = task;
    setTask((prev) => ({ ...prev, subtasks: prev.subtasks.filter((s) => s._id !== subtaskId) }));
    try {
      const { data } = await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
      setTask(data);
      onUpdated?.(data);
    } catch (err) {
      console.error('Failed to delete subtask', err);
      setTask(previous);
    }
  };

  if (loading || !task) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-lg p-6 w-[480px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
          <p className="text-sm text-gray-500">Loading task...</p>
        </div>
      </div>
    );
  }

  const doneCount = task.subtasks.filter((s) => s.isDone).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg p-6 w-[480px] max-w-[90vw] max-h-[85vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl">
          ×
        </button>

        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
            className="text-lg font-semibold w-full border border-gray-300 rounded px-2 py-1 mb-4"
          />
        ) : (
          <h2 onClick={() => setEditingTitle(true)} className="text-lg font-semibold mb-4 cursor-text">
            {task.title}
          </h2>
        )}

        <div className="flex gap-4 flex-wrap mb-4">
          <label className="flex flex-col text-xs text-gray-500 gap-1">
            Priority
            <select
              value={task.priority}
              onChange={(e) => saveField({ priority: e.target.value })}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="flex flex-col text-xs text-gray-500 gap-1">
            Due date
            <input
              type="date"
              value={task.dueDate ? task.dueDate.slice(0, 10) : ''}
              onChange={(e) => saveField({ dueDate: e.target.value || null })}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            />
          </label>

          {task.assignedTo && (
            <div className="text-sm text-gray-600 self-end">
              Assigned to: <strong>{task.assignedTo.name}</strong>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="text-xs text-gray-500 block mb-1">Description</label>
          <textarea
            value={descDraft}
            onChange={(e) => setDescDraft(e.target.value)}
            onBlur={handleDescBlur}
            placeholder="Add a description..."
            rows={4}
            className="w-full text-sm border border-gray-300 rounded p-2 resize-y"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-2">
            Subtasks ({doneCount}/{task.subtasks.length})
          </label>
          <ul className="mb-2">
            {task.subtasks.map((subtask) => (
              <li key={subtask._id} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  checked={subtask.isDone}
                  onChange={(e) => handleToggleSubtask(subtask._id, e.target.checked)}
                />
                <span className={`flex-1 text-sm ${subtask.isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {subtask.title}
                </span>
                <button
                  onClick={() => handleDeleteSubtask(subtask._id)}
                  className="text-gray-300 hover:text-red-600 text-sm"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={handleAddSubtask} className="flex gap-1.5">
            <input
              type="text"
              placeholder="Add a subtask"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              className="flex-1 text-sm border border-gray-300 rounded px-2 py-1.5"
            />
            <button type="submit" className="text-xs bg-indigo-600 text-white rounded px-2.5 py-1.5">
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}