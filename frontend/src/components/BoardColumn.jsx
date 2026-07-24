import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import QuickAddTask from './QuickAddTask';

export default function BoardColumn({ column, tasks, projectId, onTaskCreated, onOpenTask }) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div className="bg-gray-100 rounded-lg p-3 flex-1 min-w-[260px] flex flex-col">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">{column.name}</h4>
      <div ref={setNodeRef} className="flex-1 flex flex-col gap-2 min-h-[60px]">
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onOpen={onOpenTask} />
          ))}
        </SortableContext>
      </div>
      <QuickAddTask projectId={projectId} columnId={column.id} onCreated={onTaskCreated} />
    </div>
  );
}