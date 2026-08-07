import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import NotificationCenter from './NotificationCenter';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';
import { useDispatch } from 'react-redux';
import { fetchWorkspaces } from '../features/workspace/workspaceSlice';

function Navbar() {
  const [showModal, setShowModal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
  dispatch(fetchWorkspaces());
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <nav className="sticky top-0 z-30 bg-zinc-950/80 border-b border-zinc-800/80 backdrop-blur-xl px-4 sm:px-6 antialiased">
      <div className="flex items-center justify-between h-14">
        {/* Left: Logo + Workspace Switcher */}
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/"
            className="text-base font-bold text-white tracking-tight shrink-0 flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-indigo-600/30">
              T
            </div>
            TeamForge
          </Link>
          <div className="hidden sm:block w-px h-5 bg-zinc-800" />
          <div className="hidden sm:block min-w-0">
            <WorkspaceSwitcher />
          </div>
        </div>

        {/* Right: Actions, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl px-3.5 py-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <span className="text-sm font-bold leading-none">+</span>
            <span>Workspace</span>
          </button>

          {/* Mobile Create Button */}
          <button
            onClick={() => setShowModal(true)}
            className="sm:hidden p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-xl transition-colors cursor-pointer"
            aria-label="Create workspace"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>

          <NotificationCenter />

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-zinc-800/60 transition-colors cursor-pointer border border-transparent hover:border-zinc-700/60"
            >
              <Avatar
                username={user?.username}
                avatarUrl={user?.avatar}
                size="sm"
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-800/90 rounded-2xl shadow-2xl shadow-black/80 py-1.5 z-50 divide-y divide-zinc-800/60 animate-in fade-in duration-150">
                <div className="px-3.5 py-2.5">
                  <p className="text-xs font-semibold text-zinc-100 truncate">
                    {user?.username}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-zinc-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profile
                  </Link>
                </div>

                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 text-left px-3.5 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4 text-rose-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Workspace Switcher */}
      <div className="sm:hidden pb-2.5 pt-0.5 border-t border-zinc-800/50 mt-1">
        <WorkspaceSwitcher />
      </div>

      {showModal && (
        <CreateWorkspaceModal onClose={() => setShowModal(false)} />
      )}
    </nav>
  );
}

export default Navbar;