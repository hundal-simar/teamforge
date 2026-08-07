import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Avatar from './Avatar';

const formatDueDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const isOverdue = date < new Date().setHours(0, 0, 0, 0);
  return {
    text: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    isOverdue,
  };
};

const priorityColors = {
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const labelColors = [
  'bg-purple-500/15 text-purple-300 border-purple-500/20',
  'bg-sky-500/15 text-sky-300 border-sky-500/20',
  'bg-pink-500/15 text-pink-300 border-pink-500/20',
  'bg-teal-500/15 text-teal-300 border-teal-500/20',
  'bg-amber-500/15 text-amber-300 border-amber-500/20',
];

const colorForLabel = (label) => {
  const hash = label.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return labelColors[hash % labelColors.length];
};

export default function TaskCard({ task, onOpen, dragDisabled = false }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { columnId: task.columnId },
    disabled: dragDisabled,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const due = formatDueDate(task.dueDate);
  const doneSubtasks = task.subtasks?.filter((s) => s.isDone).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(dragDisabled ? {} : listeners)}
      onClick={() => !isDragging && onOpen(task._id)}
      className={`bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5 transition-all duration-200 antialiased select-none ${
        dragDisabled ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
      } ${
        isDragging
          ? 'shadow-2xl shadow-black/80 border-indigo-500/50 ring-2 ring-indigo-500/30 opacity-95 scale-[1.02] z-50 bg-zinc-900'
          : 'hover:border-zinc-700/80 hover:bg-zinc-900 shadow-sm'
      }`}
    >
      {/* Title */}
      <p className="text-xs font-semibold text-zinc-100 mb-2 leading-snug tracking-tight">
        {task.title}
      </p>

      {/* Labels */}
      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {task.labels.map((label) => (
            <span
              key={label}
              className={`text-[10px] font-medium rounded-md px-1.5 py-0.5 border ${colorForLabel(
                label
              )}`}
            >
              #{label}
            </span>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center gap-2 flex-wrap pt-0.5">
        {task.priority && (
          <span
            className={`text-[10px] font-semibold rounded-md px-1.5 py-0.5 capitalize border ${
              priorityColors[task.priority]
            }`}
          >
            {task.priority}
          </span>
        )}

        {due && (
          <span
            className={`text-[10px] font-medium flex items-center gap-1 ${
              due.isOverdue ? 'text-rose-400 font-semibold' : 'text-zinc-400'
            }`}
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
                strokeWidth="1.8"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {due.text}
          </span>
        )}

        {totalSubtasks > 0 && (
          <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {doneSubtasks}/{totalSubtasks}
          </span>
        )}

        {task.assignedTo && (
          <div className="ml-auto">
            <Avatar
              username={task.assignedTo.username}
              avatarUrl={task.assignedTo.avatar}
              size="xs"
            />
          </div>
        )}
      </div>
    </div>
  );
}