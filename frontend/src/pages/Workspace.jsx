import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWorkspaceById, fetchWorkspaceMembers } from '../features/workspace/workspaceSlice';

function Workspace() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { workspaceId } = useParams();

  const { currentWorkspace, loading } = useSelector((state) => state.workspace);

  useEffect(() => {
    dispatch(fetchWorkspaceById(workspaceId));
    dispatch(fetchWorkspaceMembers(workspaceId));
  }, [dispatch, workspaceId]);

  useEffect(() => {
    if (!loading && currentWorkspace) {
      navigate(`/workspaces/${workspaceId}/projects`, { replace: true });
    }
  }, [loading, currentWorkspace, workspaceId, navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-indigo-500 selection:text-white antialiased">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Glassmorphic Loading Card */}
      <div className="w-full max-w-sm bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 relative z-10 text-center">
        <div className="flex flex-col items-center justify-center space-y-4 py-2">
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <div className="absolute w-5 h-5 rounded-full bg-indigo-500/10 blur-sm" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-zinc-200 tracking-tight">Loading Workspace</p>
            <p className="text-xs text-zinc-500">Preparing your project dashboard...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Workspace;