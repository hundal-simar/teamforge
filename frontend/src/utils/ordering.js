// Computes the order value for a task dropped between two neighbors.
// Pass null for prevTask/nextTask if dropped at the start/end of a column.
export const computeOrder = (prevTask, nextTask, gap = 1000) => {
  if (!prevTask && !nextTask) return gap; // empty column
  if (!prevTask) return nextTask.order / 2; // dropped at top
  if (!nextTask) return prevTask.order + gap; // dropped at bottom
  return (prevTask.order + nextTask.order) / 2; // dropped between two
};