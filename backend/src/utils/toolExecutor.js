import { z } from "zod";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Workspace from "../models/Workspace.js";

const createTaskSchema = z.object({
  title: z.string().min(1),
  columnId: z.string().optional(),
  projectId: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium")
});

const searchTasksSchema = z.object({
  query: z.string(),
  status: z.enum(["todo", "in-progress", "done"]).optional()
});


async function getUserWorkspaces(userId) {
  return Workspace.find({
    $or: [{ owner: userId }, { "members.user": userId }]
  });
}

const toolRegistry = {
  async createTask(args, userId) {
    const parsed = createTaskSchema.safeParse(args);
    if (!parsed.success) {
      return { success: false, error: "Invalid task arguments: " + parsed.error.message };
    }

    let { columnId, projectId } = parsed.data;
    let project;

    if (!projectId) {
      const workspaces = await getUserWorkspaces(userId);
      if (!workspaces.length) {
        return { success: false, error: "You don't belong to any workspace yet." };
      }
      const workspaceIds = workspaces.map(w => w._id);

      project = await Project.findOne({ workspace: { $in: workspaceIds } })
        .sort({ createdAt: 1 });

      if (!project) {
        return { success: false, error: "No project found to create the task in." };
      }
      projectId = project._id.toString();
    } else {
      project = await Project.findById(projectId);
      if (!project) {
        return { success: false, error: "Project not found." };
      }
      // Ownership check: make sure this project's workspace actually
      // belongs to the requesting user before creating a task in it.
      const workspaces = await getUserWorkspaces(userId);
      const allowed = workspaces.some(w => w._id.equals(project.workspace));
      if (!allowed) {
        return { success: false, error: "You don't have access to that project." };
      }
    }

    if (!columnId) {
      if (!project.columns?.length) {
        return { success: false, error: "This project has no columns defined." };
      }
      const firstColumn = [...project.columns].sort((a, b) => a.order - b.order)[0];
      columnId = firstColumn.id;
    }

    const lastTask = await Task.findOne({ project: projectId, columnId }).sort({ order: -1 });
    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      title: parsed.data.title,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      priority: parsed.data.priority,
      createdBy: userId,
      order,
      columnId,
      project: projectId
    });

    return { success: true, taskId: task._id.toString(), title: task.title };
  },

  async searchTasks(args, userId) {
    const parsed = searchTasksSchema.safeParse(args);
    if (!parsed.success) {
      return { success: false, error: "Invalid search arguments: " + parsed.error.message };
    }

    // Scope search to the user's own projects, same access pattern as createTask.
    const workspaces = await getUserWorkspaces(userId);
    const workspaceIds = workspaces.map(w => w._id);
    const projects = await Project.find({ workspace: { $in: workspaceIds } }, "_id");
    const projectIds = projects.map(p => p._id);

    const filter = {
      project: { $in: projectIds },
      title: { $regex: parsed.data.query, $options: "i" }
    };
    if (parsed.data.status) filter.columnId = parsed.data.status;

    const tasks = await Task.find(filter).limit(5).lean();
    return {
      success: true,
      count: tasks.length,
      tasks: tasks.map(t => ({ title: t.title, status: t.columnId, dueDate: t.dueDate }))
    };
  },

  async getWorkspaces(args, userId) {
    const workspaces = await getUserWorkspaces(userId);
    return {
      success: true,
      workspaces: workspaces.map(w => ({ id: w._id.toString(), name: w.name }))
    };
  },

  async getProjects(args, userId) {
    const workspaces = await getUserWorkspaces(userId);
    const allowed = workspaces.some(w => w._id.toString() === args.workspaceId);
    if (!allowed) {
      return { success: false, error: "You don't have access to that workspace." };
    }

    const projects = await Project.find({ workspace: args.workspaceId });
    return {
      success: true,
      projects: projects.map(p => ({ id: p._id.toString(), name: p.name }))
    };
  },

  async getColumns(args, userId) {
    const project = await Project.findById(args.projectId);
    if (!project) {
      return { success: false, error: "Project not found." };
    }
    return {
      success: true,
      columns: [...project.columns]
        .sort((a, b) => a.order - b.order)
        .map(c => ({ id: c.id, name: c.name }))
    };
  }
};

export async function executeTool(name, args, userId) {
  const fn = toolRegistry[name];
  if (!fn) return { success: false, error: `Unknown tool: ${name}` };
  try {
    return await fn(args, userId);
  } catch (err) {
    return { success: false, error: err.message };
  }
}