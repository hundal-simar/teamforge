import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function JoinWorkspace() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', message: '' });

  useEffect(() => {
    const attemptJoin = async () => {
      try {
        const { data } = await axios.post(`/api/workspaces/join/${token}`);

        if (data.needsRegistration) {
          // stash token so registration flow can re-call this endpoint after signup
          localStorage.setItem('pendingInviteToken', token);
          navigate(`/register?email=${encodeURIComponent(data.email)}`);
          return;
        }

        setState({ status: 'success', message: 'Successfully joined workspace' });
        setTimeout(() => navigate(`/workspace/${data.workspaceSlug}`), 1500);
      } catch (err) {
        setState({
          status: 'error',
          message: err.response?.data?.message || 'Invite link is invalid or expired',
        });
      }
    };
    attemptJoin();
  }, [token, navigate]);

  if (state.status === 'loading') return <p>Joining workspace...</p>;
  if (state.status === 'success') return <p>{state.message}</p>;
  return <p style={{ color: 'red' }}>{state.message}</p>;
}