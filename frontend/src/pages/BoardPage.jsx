import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/axios';
import BoardColumn from '../components/BoardColumn';
import TaskDetailModal from '../components/TaskDetailModal';
import ActivityFeed from '../components/ActivityFeed';
import BoardSkeleton from '../components/BoardSkeleton';
import { computeOrder } from '../utils/ordering';
import { useSocket } from '../context/SocketContext';
import { fetchWorkspaceMembers } from '../features/workspace/workspaceSlice';
import Breadcrumbs from '../components/Breadcrumbs';
import FilterBar from '../components/FilterBar';
import { useSearchParams } from 'react-router-dom';
import { DragOverlay } from '@dnd-kit/core';
import TaskCard from '../components/TaskCard';

export default function BoardPage() {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const members = useSelector((state) => state.workspace.members);
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openTaskId, setOpenTaskId] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [activeTask, setActiveTask] = useState(null);

  const [filters, setFilters] = useState({ assignee: null, priority: null, label: null });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  useEffect(() => {
    const fetchBoard = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/projects/${projectId}/board`);
        setProject(data.project);
        setTasks(data.tasks);
      } catch (err) {
        console.error('Error loading board', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [projectId]);

  useEffect(() => {
    const taskIdFromUrl = searchParams.get('task');
    if (taskIdFromUrl) setOpenTaskId(taskIdFromUrl);
  }, [searchParams]);

  useEffect(() => {
    if (project?.workspace) {
      const workspaceId = typeof project.workspace === 'string' ? project.workspace : project.workspace._id;
      dispatch(fetchWorkspaceMembers(workspaceId));
    }
  }, [project, dispatch]);

  useEffect(() => {
    if (!socket || !projectId) return;

    socket.emit('project:join', projectId);

    const handleTaskEvent = (updatedTask) => {
      setTasks((prev) => {
        const exists = prev.some((t) => t._id === updatedTask._id);
        return exists
          ? prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
          : [...prev, updatedTask];
      });
    };

    const handleTaskDeleted = ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    };

    const handlePresence = ({ count }) => setViewerCount(count);

    socket.on('task:updated', handleTaskEvent);
    socket.on('task:moved', handleTaskEvent);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('presence:update', handlePresence);

    return () => {
      socket.emit('project:leave', projectId);
      socket.off('task:updated', handleTaskEvent);
      socket.off('task:moved', handleTaskEvent);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('presence:update', handlePresence);
    };
  }, [socket, projectId]);

  const tasksByColumn = (columnId) =>
    tasks
      .filter((t) => t.columnId === columnId)
      .filter((t) => !filters.assignee || t.assignedTo?._id === filters.assignee)
      .filter((t) => !filters.priority || t.priority === filters.priority)
      .filter((t) => !filters.label || t.labels?.includes(filters.label))
      .sort((a, b) => a.order - b.order);

  const hasActiveFilters = !!(filters.assignee || filters.priority || filters.label);

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t._id === newTask._id);
      return exists ? prev : [...prev, newTask];
    });
  };

  const handleTaskUpdated = (updatedTask) =>
    setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const overTask = tasks.find((t) => t._id === over.id);
    const targetColumnId = overTask ? overTask.columnId : over.id;

    const columnTasks = tasksByColumn(targetColumnId).filter((t) => t._id !== taskId);
    const overIndex = overTask ? columnTasks.findIndex((t) => t._id === over.id) : columnTasks.length;

    const prevTask = columnTasks[overIndex - 1] || null;
    const nextTask = overTask ? columnTasks[overIndex] : null;
    const newOrder = computeOrder(prevTask, nextTask);

    const previousTasks = tasks;

    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, columnId: targetColumnId, order: newOrder } : t))
    );

    try {
      await api.patch(`/tasks/${taskId}/status`, { columnId: targetColumnId, order: newOrder });
    } catch (err) {
      console.error('Failed to update task status, rolling back', err);
      setTasks(previousTasks);
    }
  };

  if (loading) return <BoardSkeleton />;
  if (!project) return <p className="p-6 text-sm text-zinc-400 bg-zinc-950 min-h-screen">Project not found.</p>;

  const sortedColumns = [...project.columns].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col lg:flex-row relative selection:bg-indigo-500 selection:text-white antialiased">
      {/* Glow Effects */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[350px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Main Board Container */}
      <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-x-auto relative z-10">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: project.workspace?.name || 'Workspace', to: `/workspaces/${project.workspace?._id}` },
            { label: project.name, to: `/projects/${projectId}` },
          ]}
        />

        {/* Board Header & Presence Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {project.name}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Kanban Task Board</p>
          </div>

          {viewerCount > 0 && (
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full self-start sm:self-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-indigo-300">
                {viewerCount} {viewerCount === 1 ? 'person' : 'people'} viewing
              </span>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="space-y-3">
          <FilterBar tasks={tasks} members={members} filters={filters} onChange={setFilters} />
          
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 backdrop-blur-md">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Dragging is disabled while filters are active — clear filters to reorder tasks.</span>
            </div>
          )}
        </div>

        {/* Kanban Board DnD Layout */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <div className="flex gap-5 overflow-x-auto pb-6 items-start">
            {sortedColumns.map((col) => (
              <BoardColumn
                key={col.id}
                column={col}
                tasks={tasksByColumn(col.id)}
                projectId={projectId}
                onTaskCreated={handleTaskCreated}
                onOpenTask={setOpenTaskId}
                dragDisabled={hasActiveFilters}
                workspaceMembers={members}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-2 opacity-90 scale-105 transition-transform">
                <TaskCard task={activeTask} onOpen={() => {}} dragDisabled={false} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Task Modal */}
        {openTaskId && (
          <TaskDetailModal
            taskId={openTaskId}
            onClose={() => setOpenTaskId(null)}
            onUpdated={handleTaskUpdated}
            workspaceMembers={members}
          />
        )}
      </div>

      {/* Activity Sidebar */}
      <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl p-4 sm:p-6 shrink-0 relative z-10">
        <ActivityFeed projectId={projectId} />
      </aside>
    </div>
  );
}