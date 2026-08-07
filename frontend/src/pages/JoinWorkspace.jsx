import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';

export default function JoinWorkspace() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', message: '' });

  useEffect(() => {
    const attemptJoin = async () => {
      try {
        const { data } = await api.post(`/workspaces/join/${token}`);

        if (data.needsRegistration) {
          // stash token so registration flow can re-call this endpoint after signup
          localStorage.setItem('pendingInviteToken', token);
          navigate(`/register?email=${encodeURIComponent(data.email)}`);
          return;
        }

        setState({ status: 'success', message: 'Successfully joined workspace' });
        setTimeout(() => navigate(`/workspaces/${data.workspaceId}`), 1500);
      } catch (err) {
        setState({
          status: 'error',
          message: err.response?.data?.message || 'Invite link is invalid or expired',
        });
      }
    };
    attemptJoin();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-indigo-500 selection:text-white antialiased">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 relative z-10 text-center">
        
        {/* Loading State */}
        {state.status === 'loading' && (
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <div className="absolute w-6 h-6 rounded-full bg-indigo-500/10 blur-sm" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight">Joining Workspace</h2>
              <p className="text-xs text-zinc-400">Verifying your invitation link...</p>
            </div>
          </div>
        )}

        {/* Success State */}
        {state.status === 'success' && (
          <div className="flex flex-col items-center justify-center space-y-4 py-4 animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight">Success!</h2>
              <p className="text-sm font-medium text-emerald-400">{state.message}</p>
              <p className="text-xs text-zinc-500 mt-2">Redirecting to workspace...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {state.status === 'error' && (
          <div className="flex flex-col items-center justify-center space-y-4 py-4 animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/10">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Unable to Join</h2>
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-xs text-red-400 font-medium">{state.message}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs rounded-xl py-2.5 px-4 border border-zinc-700/60 transition-all cursor-pointer"
            >
              Return to Home
            </button>
          </div>
        )}

      </div>
    </div>
  );
}