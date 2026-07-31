import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const labelColors = [
  'bg-purple-100 text-purple-700',
  'bg-blue-100 text-blue-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
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
      className={`bg-white rounded-md p-3 transition-shadow ${
        dragDisabled ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
      } ${
        isDragging ? 'shadow-lg ring-2 ring-indigo-200 opacity-90 scale-[1.02]' : 'shadow-sm opacity-100'
      }`}
    >
      <p className="text-sm font-medium text-gray-900 mb-1.5">{task.title}</p>

      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {task.labels.map((label) => (
            <span key={label} className={`text-[10px] rounded px-1.5 py-0.5 ${colorForLabel(label)}`}>
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        {task.priority && (
          <span className={`text-[10px] rounded px-1.5 py-0.5 capitalize ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        )}
        {due && (
          <span className={`text-[10px] ${due.isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
            {due.text}
          </span>
        )}
        {totalSubtasks > 0 && (
          <span className="text-[10px] text-gray-400">{doneSubtasks}/{totalSubtasks}</span>
        )}
        {task.assignedTo && (
          <span
            title={task.assignedTo.username}
            className="ml-auto w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-semibold flex items-center justify-center"
          >
            {task.assignedTo.username?.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}