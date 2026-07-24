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

export default function TaskCard({ task, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { columnId: task.columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const due = formatDueDate(task.dueDate);
  const doneSubtasks = task.subtasks?.filter((s) => s.isDone).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !isDragging && onOpen(task._id)}
      className={`bg-white rounded-md shadow-sm p-3 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <p className="text-sm font-medium text-gray-900 mb-1.5">{task.title}</p>

      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {task.labels.map((label) => (
            <span key={label} className="text-[10px] bg-gray-200 text-gray-700 rounded px-1.5 py-0.5">
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
            title={task.assignedTo.name}
            className="ml-auto w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-semibold flex items-center justify-center"
          >
            {task.assignedTo.name?.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}