export const createTaskTool = {
  name: "createTask",
  description:
    "Creates a new task in TeamForge with a title, optional due date, and priority. " +
    "columnId and projectId are optional — omit them for the user's default project and 'todo' column. " +
    "Only look up projects/columns explicitly if the user names a specific project other than their default.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string", description: "Short, clear title of the task" },
      columnId: { type: "string", description: "Column ID — omit unless the user specifies one" },
      projectId: { type: "string", description: "Project ID — omit unless the user specifies one" },
      dueDate: { type: "string", description: "Due date in natural language or ISO format, if mentioned" },
      priority: { type: "string", enum: ["low", "medium", "high"], description: "Urgency, if inferable" }
    },
    required: ["title"]
  }
};

export const searchTasksTool = {
  name: "searchTasks",
  description: "Searches TeamForge tasks by keyword and optional status. Use this when the user asks about existing tasks (e.g. what's due, what's pending).",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Keyword to search task titles for" },
      status: { type: "string", enum: ["todo", "in_progress", "done"], description: "Filter by status, if mentioned" }
    },
    required: ["query"]
  }
};

export const getWorkspacesTool = {
  name: "getWorkspaces",
  description:
    "Returns all workspaces available to the current user.",
  parameters: {
    type: "object",
    properties: {}
  }
};

export const getProjectsTool = {
  name: "getProjects",
  description:
    "Returns all projects available to the current user. Use this before creating tasks when project information is missing.",
  parameters: {
    type: "object",
    properties: {
      workspaceId: { type: "string", description: "ID of the workspace to list projects for" }
    },
    required: ["workspaceId"]
  }
};

export const getColumnsTool = {
  name: "getColumns",
  description:
    "Returns all columns for a project. Use this when a column is required before creating a task.",
  parameters: {
    type: "object",
    properties: {
      projectId: {
        type: "string",
        description: "The project id"
      }
    },
    required: ["projectId"]
  }
};
    
export const allTools = [{ functionDeclarations: [createTaskTool, searchTasksTool, getWorkspacesTool, getProjectsTool, getColumnsTool] }];