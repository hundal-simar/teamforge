import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import api from '../api/axios';

export default function ProfilePage() {
  const { user, fetchUser } = useAuth();
  const [usernameDraft, setUsernameDraft] = useState(user?.username || '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleUsernameSave = async () => {
    if (usernameDraft.trim() === user.username) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.patch('/users/me', { username: usernameDraft.trim() });
      await fetchUser(); // refresh AuthContext's user so the navbar/etc. update too
      setSuccess('Username updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update username');
      setUsernameDraft(user.username); // revert on failure
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 flex items-center justify-center text-sm text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center relative overflow-hidden selection:bg-indigo-500 selection:text-white antialiased">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Profile Card Container */}
      <div className="w-full max-w-lg bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10 space-y-6">
        
        {/* Header */}
        <div className="pb-4 border-b border-zinc-800/60">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Your Profile</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage your account details and visual preferences</p>
        </div>

        {/* Avatar Section */}
        <div className="flex items-center gap-5 p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/50">
          <div className="relative group">
            <Avatar username={user.username} avatarUrl={user.avatar} size="lg" />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-xs font-medium text-zinc-200 rounded-lg border border-zinc-700/60 transition-all cursor-pointer"
            >
              {uploadingAvatar ? 'Uploading...' : 'Change photo'}
            </button>
            <p className="text-[11px] text-zinc-500">JPG, PNG, or WEBP. Max size recommended 2MB.</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleAvatarSelect}
            className="hidden"
          />
        </div>

        {/* Username Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Username
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={usernameDraft}
              onChange={(e) => setUsernameDraft(e.target.value)}
              className="flex-1 bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-zinc-100 placeholder:text-zinc-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200"
            />
            <button
              onClick={handleUsernameSave}
              disabled={saving || usernameDraft.trim() === user.username}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-medium text-xs rounded-xl px-4 py-2.5 transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Readonly Email Field */}
        <div className="space-y-1.5 p-4 rounded-xl bg-zinc-950/30 border border-zinc-800/40">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Email Address
          </label>
          <p className="text-sm font-medium text-zinc-200">{user.email}</p>
          <p className="text-[11px] text-zinc-500">Email address is managed permanently and cannot be changed.</p>
        </div>

        {/* Dynamic Status Notifications */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in duration-200">
            <p className="text-xs text-red-400 font-medium text-center">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in fade-in duration-200">
            <p className="text-xs text-emerald-400 font-medium text-center">{success}</p>
          </div>
        )}

      </div>
    </div>
  );
}