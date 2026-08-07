export default function FilterBar({ tasks, members, filters, onChange }) {
  const uniqueLabels = [...new Set(tasks.flatMap((t) => t.labels || []))];

  const handleAssigneeChange = (e) =>
    onChange({ ...filters, assignee: e.target.value || null });
  const handlePriorityChange = (e) =>
    onChange({ ...filters, priority: e.target.value || null });
  const handleLabelClick = (label) => {
    onChange({ ...filters, label: filters.label === label ? null : label });
  };
  const handleClearAll = () =>
    onChange({ assignee: null, priority: null, label: null });

  const hasActiveFilters = filters.assignee || filters.priority || filters.label;

  return (
    <div className="flex items-center flex-wrap gap-2 mb-5 pb-3 border-b border-zinc-800/80 antialiased">
      {/* Assignee Filter Dropdown */}
      <div className="relative">
        <select
          value={filters.assignee || ''}
          onChange={handleAssigneeChange}
          className="text-xs bg-zinc-900/90 text-zinc-200 border border-zinc-800 hover:border-zinc-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3 py-1.5 outline-none transition-all duration-200 cursor-pointer appearance-none pr-7"
        >
          <option value="" className="bg-zinc-900 text-zinc-300">
            All assignees
          </option>
          {members.map((m) => (
            <option
              key={m.user._id}
              value={m.user._id}
              className="bg-zinc-900 text-zinc-200"
            >
              {m.user.username}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px]">
          ▼
        </span>
      </div>

      {/* Priority Filter Dropdown */}
      <div className="relative">
        <select
          value={filters.priority || ''}
          onChange={handlePriorityChange}
          className="text-xs bg-zinc-900/90 text-zinc-200 border border-zinc-800 hover:border-zinc-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3 py-1.5 outline-none transition-all duration-200 cursor-pointer appearance-none pr-7"
        >
          <option value="" className="bg-zinc-900 text-zinc-300">
            All priorities
          </option>
          <option value="low" className="bg-zinc-900 text-zinc-200">
            Low
          </option>
          <option value="medium" className="bg-zinc-900 text-zinc-200">
            Medium
          </option>
          <option value="high" className="bg-zinc-900 text-zinc-200">
            High
          </option>
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px]">
          ▼
        </span>
      </div>

      {/* Labels Filter Chips */}
      {uniqueLabels.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 ml-1">
          {uniqueLabels.map((label) => {
            const isActive = filters.label === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleLabelClick(label)}
                className={`text-[11px] font-medium rounded-lg px-2.5 py-1 border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/90 text-white border-indigo-500 shadow-sm shadow-indigo-600/20'
                    : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                #{label}
              </button>
            );
          })}
        </div>
      )}

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearAll}
          className="text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 rounded-lg px-2 py-1 transition-colors ml-auto cursor-pointer flex items-center gap-1"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Clear filters
        </button>
      )}
    </div>
  );
}