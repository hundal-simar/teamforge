import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/axios';
import { fetchWorkspaceById, fetchWorkspaceMembers } from '../features/workspace/workspaceSlice';
import CreateProjectModal from '../components/CreateProjectModal';
import InviteTeammateModal from '../components/InviteTeammateModal';
import Avatar from '../components/Avatar';
import { useSocket } from '../context/SocketContext';

export default function Project() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { socket } = useSocket();

  const { currentWorkspace, members, loading: workspaceLoading } = useSelector((state) => state.workspace);

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    dispatch(fetchWorkspaceById(workspaceId));
    dispatch(fetchWorkspaceMembers(workspaceId));
  }, [dispatch, workspaceId]);

  useEffect(() => {
    const fetchProjects = async () => {
      setProjectsLoading(true);
      try {
        const { data } = await api.get(`/workspaces/${workspaceId}/projects`);
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, [workspaceId]);

  useEffect(() => {
    if (!socket || !workspaceId) return;
    socket.emit('workspace:join', workspaceId);

    const handleProjectCreated = (project) => {
      setProjects(prev => {
      const exists = prev.some(p => p._id === project._id);

      if (exists) return prev;

     return [...prev, project];
    });
   };
    const handleMemberEvent = () => dispatch(fetchWorkspaceMembers(workspaceId));

    socket.on('project:created', handleProjectCreated);
    socket.on('member:joined', handleMemberEvent);
    socket.on('member:removed', handleMemberEvent);
    socket.on('member:roleChanged', handleMemberEvent);

    return () => {
      socket.emit('workspace:leave', workspaceId);
      socket.off('project:created', handleProjectCreated);
      socket.off('member:joined', handleMemberEvent);
      socket.off('member:removed', handleMemberEvent);
      socket.off('member:roleChanged', handleMemberEvent);
    };
  }, [socket, workspaceId, dispatch]);

  const handleCreated = () => {
    
  };

  if (workspaceLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 sm:p-8 lg:p-10 relative selection:bg-indigo-500 selection:text-white antialiased">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-zinc-900 rounded-xl w-64"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 flex items-center justify-center text-sm text-zinc-400">
        Workspace not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 sm:p-8 lg:p-10 relative overflow-hidden selection:bg-indigo-500 selection:text-white antialiased">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Workspace Header */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {currentWorkspace.name}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {members.length} {members.length === 1 ? 'member' : 'members'} · {projects.length}{' '}
              {projects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>

          <Link
            to={`/workspaces/${workspaceId}/settings`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 rounded-xl text-xs font-medium transition-all self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </div>

        {/* Content Section */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Projects Area */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
              <h2 className="text-base font-bold text-white tracking-tight">Projects</h2>
              <button
                onClick={() => setShowCreateProject(true)}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium text-xs rounded-xl px-4 py-2 shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                + New Project
              </button>
            </div>

            {projectsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl"></div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="p-8 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl text-center space-y-2">
                <p className="text-sm text-zinc-400">No projects yet — create one to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div
                    key={project._id}
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className="group bg-zinc-900/60 border border-zinc-800/80 hover:border-indigo-500/50 backdrop-blur-xl rounded-2xl p-5 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-800/40 flex justify-end">
                      <span className="text-[11px] font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Board →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Members Sidebar */}
          <div className="lg:w-72 shrink-0 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
              <h2 className="text-base font-bold text-white tracking-tight">Members</h2>
              <button
                onClick={() => setShowInvite(true)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                + Invite
              </button>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl">
              <ul className="space-y-3">
                {members.map((member) => (
                  <li
                    key={member.user._id}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/40 transition-colors"
                  >
                    <Avatar username={member.user.username} avatarUrl={member.user.avatar} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-zinc-200 truncate">{member.user.username}</p>
                      <span className="inline-block text-[10px] font-medium text-zinc-500 capitalize">
                        {member.role}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Modal overlays */}
        {showCreateProject && (
          <CreateProjectModal
            workspaceId={workspaceId}
            onCreated={handleCreated}
            onClose={() => setShowCreateProject(false)}
          />
        )}

        {showInvite && (
          <InviteTeammateModal workspaceId={workspaceId} onClose={() => setShowInvite(false)} />
        )}
      </div>
    </div>
  );
}