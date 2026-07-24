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
import api from '../api/axios';
import BoardColumn from '../components/BoardColumn';
import TaskDetailModal from '../components/TaskDetailModal';
import { computeOrder } from '../utils/ordering';
import { useSocket } from '../context/SocketContext';


export default function BoardPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openTaskId, setOpenTaskId] = useState(null);
  const { socket } = useSocket();
  const [viewerCount, setViewerCount] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, tasksRes] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/projects/${projectId}/tasks`),
        ]);
        setProject(projectRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        console.error('Error loading board', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const tasksByColumn = (columnId) =>
    tasks.filter((t) => t.columnId === columnId).sort((a, b) => a.order - b.order);

  const handleTaskCreated = (newTask) => setTasks((prev) => [...prev, newTask]);
  const handleTaskUpdated = (updatedTask) =>
    setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));

  const handleDragEnd = async (event) => {
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

  const handlePresence = ({ count }) => setViewerCount(count);

  socket.on('task:updated', handleTaskEvent);
  socket.on('task:moved', handleTaskEvent);
  socket.on('presence:update', handlePresence);

  // cleanup: leave the room and remove listeners when navigating away or projectId changes
  return () => {
    socket.emit('project:leave', projectId);
    socket.off('task:updated', handleTaskEvent);
    socket.off('task:moved', handleTaskEvent);
    socket.off('presence:update', handlePresence);
  };
}, [socket, projectId]);

  if (loading) return <p className="p-4 text-sm text-gray-500">Loading board...</p>;
  if (!project) return <p className="p-4 text-sm text-gray-500">Project not found.</p>;

  const sortedColumns = [...project.columns].sort((a, b) => a.order - b.order);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{project.name}</h2>
      <div className="flex items-center justify-between mb-4">
  
  {viewerCount > 0 && (
    <span className="text-xs text-gray-500">
      {viewerCount} {viewerCount === 1 ? 'person' : 'people'} viewing
    </span>
  )}
</div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex gap-4">
          {sortedColumns.map((col) => (
            <BoardColumn
              key={col.id}
              column={col}
              tasks={tasksByColumn(col.id)}
              projectId={projectId}
              onTaskCreated={handleTaskCreated}
              onOpenTask={setOpenTaskId}
            />
          ))}
        </div>
      </DndContext>

      {openTaskId && (
        <TaskDetailModal taskId={openTaskId} onClose={() => setOpenTaskId(null)} onUpdated={handleTaskUpdated} />
      )}
    </div>
  );
}