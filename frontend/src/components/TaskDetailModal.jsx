import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import CommentThread from './CommentThread';
import FileUploadZone from './FileUploadZone';
import { useSearchParams } from 'react-router-dom';

export default function TaskDetailModal({ taskId, onClose, onUpdated, workspaceMembers }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newSubtask, setNewSubtask] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [descDraft, setDescDraft] = useState('');
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();
  const highlightCommentId = searchParams.get('comment');

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

  useEffect(() => {
    if (!socket) return;

    const handleTaskUpdate = (updatedTask) => {
      if (updatedTask._id === taskId) {
        setTask(updatedTask);
        onUpdated?.(updatedTask);
      }
    };

    socket.on('task:updated', handleTaskUpdate);
    return () => socket.off('task:updated', handleTaskUpdate);
  }, [socket, taskId]);

  if (loading || !task) {
    return (
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-6 w-[480px] max-w-[95vw] shadow-2xl backdrop-blur-xl antialiased flex flex-col items-center justify-center gap-3 min-h-[200px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-6 h-6 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs text-zinc-400 font-medium">Loading task...</p>
        </div>
      </div>
    );
  }

  const doneCount = task.subtasks.filter((s) => s.isDone).length;
  const progressPercent = task.subtasks.length > 0 ? (doneCount / task.subtasks.length) * 100 : 0;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900/95 border border-zinc-800/90 rounded-2xl p-6 w-[540px] max-w-[95vw] max-h-[90vh] overflow-y-auto relative shadow-2xl shadow-black/80 backdrop-blur-xl antialiased flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-lg cursor-pointer z-10"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Title Section */}
        <div className="pr-8">
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
              className="text-base font-bold text-zinc-100 w-full bg-zinc-950/80 border border-indigo-500/80 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          ) : (
            <h2
              onClick={() => setEditingTitle(true)}
              className="text-base font-bold text-zinc-100 cursor-text hover:bg-zinc-800/40 rounded-lg px-2 py-1 -ml-2 transition-colors border border-transparent hover:border-zinc-800/60 leading-snug"
            >
              {task.title}
            </h2>
          )}
        </div>

        {/* Priority & Meta Controls */}
        <div className="flex items-center gap-4 flex-wrap pb-4 border-b border-zinc-800/60">
          <label className="flex flex-col text-[10px] font-semibold text-zinc-400 tracking-wider uppercase gap-1.5">
            Priority
            <div className="relative">
              <select
                value={task.priority}
                onChange={(e) => saveField({ priority: e.target.value })}
                className="text-xs font-medium bg-zinc-950/80 text-zinc-200 border border-zinc-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer appearance-none pr-7 transition-all"
              >
                <option value="low" className="bg-zinc-900 text-zinc-200">
                  Low
                </option>
                <option value="medium" className="bg-zinc-900 text-zinc-200">
                  Medium
                </option>
                <option value="high" className="bg-zinc-900 text-zinc-200">
                  High
                </option>
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px]">
                ▼
              </span>
            </div>
          </label>

          <label className="flex flex-col text-[10px] font-semibold text-zinc-400 tracking-wider uppercase gap-1.5">
            Due date
            <input
              type="date"
              value={task.dueDate ? task.dueDate.slice(0, 10) : ''}
              onChange={(e) => saveField({ dueDate: e.target.value || null })}
              className="text-xs font-medium bg-zinc-950/80 text-zinc-200 border border-zinc-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer [color-scheme:dark]"
            />
          </label>

          {task.assignedTo && (
            <div className="text-xs text-zinc-400 ml-auto self-end pb-1.5 flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
                Assigned:
              </span>
              <span className="font-semibold text-zinc-200 bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-2 py-0.5">
                @{task.assignedTo.username}
              </span>
            </div>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase block mb-1.5">
            Description
          </label>
          <textarea
            value={descDraft}
            onChange={(e) => setDescDraft(e.target.value)}
            onBlur={handleDescBlur}
            placeholder="Add a detailed description..."
            rows={3}
            className="w-full text-xs bg-zinc-950/80 text-zinc-100 border border-zinc-800 rounded-xl p-3 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-y transition-all leading-relaxed"
          />
        </div>

        {/* File Attachments Zone */}
        <FileUploadZone
          taskId={taskId}
          attachments={task.attachments}
          onUpdated={(updatedTask) => {
            setTask(updatedTask);
            onUpdated?.(updatedTask);
          }}
        />

        {/* Subtasks Section */}
        <div className="pt-2 border-t border-zinc-800/60">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">
              Subtasks ({doneCount}/{task.subtasks.length})
            </label>
            {task.subtasks.length > 0 && (
              <span className="text-[10px] font-bold text-indigo-400">
                {Math.round(progressPercent)}%
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {task.subtasks.length > 0 && (
            <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden mb-3 border border-zinc-800/80">
              <div
                className="bg-indigo-500 h-full transition-all duration-300 ease-out rounded-full shadow-sm shadow-indigo-500/50"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* Subtask List */}
          <ul className="space-y-1 mb-3">
            {task.subtasks.map((subtask) => (
              <li
                key={subtask._id}
                className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-xl hover:bg-zinc-800/40 transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={subtask.isDone}
                  onChange={(e) => handleToggleSubtask(subtask._id, e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500/20 focus:ring-offset-0 cursor-pointer accent-indigo-500"
                />
                <span
                  className={`flex-1 text-xs transition-colors ${
                    subtask.isDone
                      ? 'line-through text-zinc-500'
                      : 'text-zinc-200 font-medium'
                  }`}
                >
                  {subtask.title}
                </span>
                <button
                  onClick={() => handleDeleteSubtask(subtask._id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 text-base leading-none p-1 transition-all cursor-pointer"
                  aria-label="Delete subtask"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          {/* Add Subtask Form */}
          <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add a subtask..."
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              className="flex-1 text-xs bg-zinc-950/80 text-zinc-100 border border-zinc-800 rounded-xl px-3 py-2 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            <button
              type="submit"
              className="text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-800 text-zinc-200 rounded-xl px-3.5 py-2 transition-colors cursor-pointer border border-zinc-700/60"
            >
              Add
            </button>
          </form>
        </div>

        {/* Comments Thread Section */}
        <div className="pt-2 border-t border-zinc-800/60">
          <CommentThread
            taskId={taskId}
            workspaceMembers={workspaceMembers}
            highlightCommentId={highlightCommentId}
          />
        </div>
      </div>
    </div>
  );
}