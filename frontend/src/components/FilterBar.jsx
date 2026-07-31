export default function FilterBar({ tasks, members, filters, onChange }) {
  const uniqueLabels = [...new Set(tasks.flatMap((t) => t.labels || []))];

  const handleAssigneeChange = (e) => onChange({ ...filters, assignee: e.target.value || null });
  const handlePriorityChange = (e) => onChange({ ...filters, priority: e.target.value || null });
  const handleLabelClick = (label) => {
    onChange({ ...filters, label: filters.label === label ? null : label });
  };
  const handleClearAll = () => onChange({ assignee: null, priority: null, label: null });

  const hasActiveFilters = filters.assignee || filters.priority || filters.label;

  return (
    <div className="flex items-center flex-wrap gap-2 mb-4 pb-3 border-b border-gray-200">
      <select
        value={filters.assignee || ''}
        onChange={handleAssigneeChange}
        className="text-xs border border-gray-300 rounded px-2 py-1.5"
      >
        <option value="">All assignees</option>
        {members.map((m) => (
          <option key={m.user._id} value={m.user._id}>
            {m.user.username}
          </option>
        ))}
      </select>

      <select
        value={filters.priority || ''}
        onChange={handlePriorityChange}
        className="text-xs border border-gray-300 rounded px-2 py-1.5"
      >
        <option value="">All priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      {uniqueLabels.length > 0 && (
        <div className="flex gap-1">
          {uniqueLabels.map((label) => (
            <button
              key={label}
              onClick={() => handleLabelClick(label)}
              className={`text-[10px] rounded px-2 py-1 border ${
                filters.label === label
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {hasActiveFilters && (
        <button onClick={handleClearAll} className="text-xs text-gray-400 hover:text-gray-700 ml-1">
          Clear filters
        </button>
      )}
    </div>
  );
}