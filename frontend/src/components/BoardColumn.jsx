import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import QuickAddTask from './QuickAddTask';

export default function BoardColumn({ column, tasks, projectId, onTaskCreated, onOpenTask, dragDisabled, workspaceMembers }) {
  const { setNodeRef } = useDroppable({ id: column.id, disabled: dragDisabled });

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl rounded-2xl p-3 flex-1 min-w-[280px] w-[280px] sm:w-auto flex flex-col snap-start shrink-0 shadow-xl transition-all">
      {/* Column Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            {column.name}
          </h4>
          <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-800/80 border border-zinc-700/50 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Task Droppable Container */}
      <div ref={setNodeRef} className="flex-1 flex flex-col gap-2.5 min-h-[80px] pb-2">
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onOpen={onOpenTask} dragDisabled={dragDisabled} />
          ))}
        </SortableContext>
      </div>

      {/* Quick Add Task Input/Trigger */}
      <div className="pt-2 border-t border-zinc-800/60">
        <QuickAddTask
          projectId={projectId}
          columnId={column.id}
          onCreated={onTaskCreated}
          workspaceMembers={workspaceMembers}
        />
      </div>
    </div>
  );
}