import { useState } from 'react';
import api from '../api/axios';

export default function CreateProjectModal({ workspaceId, onCreated, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post(`/workspaces/${workspaceId}/projects`, {
        name,
        description,
      });
      onCreated(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <h3>Create Project</h3>
        <input
          type="text"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create'}
        </button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
}