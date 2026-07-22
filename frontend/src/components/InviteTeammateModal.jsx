import { useState } from 'react';
import axios from 'axios';

export default function InviteTeammateModal({ workspaceId, onClose }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [status, setStatus] = useState(null); // null | 'sending' | 'sent' | 'error'

  const handleInvite = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await axios.post(`/api/workspaces/${workspaceId}/invite`, { email, role });
      setStatus('sent');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="modal">
      <form onSubmit={handleInvite}>
        <h3>Invite a teammate</h3>
        <input
          type="email"
          placeholder="teammate@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending...' : 'Send Invite'}
        </button>
        {status === 'sent' && <p>Invite sent!</p>}
        {status === 'error' && <p>Failed to send invite. Try again.</p>}
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
}