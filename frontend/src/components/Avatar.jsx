const sizeClasses = {
  xs: 'w-5 h-5 text-[10px]',
  sm: 'w-6 h-6 text-[11px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-20 h-20 text-2xl',
};

export default function Avatar({ username, avatarUrl, size = 'sm' }) {
  const initial = username?.charAt(0).toUpperCase() || '?';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        title={username}
        className={`${sizeClasses[size]} rounded-full object-cover shrink-0 border border-zinc-700/60 shadow-sm ring-2 ring-zinc-900/50 transition-transform duration-200 select-none`}
      />
    );
  }

  return (
    <span
      title={username}
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center shrink-0 border border-indigo-400/30 shadow-md shadow-indigo-500/10 ring-2 ring-zinc-900/50 select-none antialiased`}
    >
      {initial}
    </span>
  );
}