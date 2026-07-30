import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addWorkspace } from '../features/workspace/workspaceSlice';

export default function CreateWorkspaceModal({ onClose, onCreated }) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const slug = name.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      await dispatch(addWorkspace({ name: name.trim(), slug })).unwrap();
      onCreated();
    } catch (err) {
      setError(err || 'Failed to create workspace');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-96" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">Create Workspace</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Workspace name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full text-sm border border-gray-300 rounded px-3 py-2 mb-3"
          />
          {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="text-sm px-3 py-1.5 text-gray-600">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="text-sm bg-indigo-600 text-white rounded px-3 py-1.5 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}