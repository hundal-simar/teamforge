import Project from "../models/Project";

const DEFAULT_COLUMNS = [
  { id: 'todo', name: 'To Do', order: 0 },
  { id: 'in-progress', name: 'In Progress', order: 1 },
  { id: 'done', name: 'Done', order: 2 },
];

// POST /api/workspaces/:id/projects

const createProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      workspace: id,
      columns: DEFAULT_COLUMNS,
    });

    res.status(201).json(project);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A project with this name already exists in this workspace' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error creating project' });
  }
};

// GET /api/workspaces/:id/projects
const listProjects = async (req, res) => {
  try {
    const { id } = req.params;
    const projects = await Project.find({ workspace: id }).select('-columns');
    res.status(200).json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
};

// GET /api/projects/:id

const getProjectDetail = async (req, res) => {
  res.status(200).json(req.project);
};

// PATCH /api/projects/:id/columns
const updateColumns = async (req, res) => {
  try {
    const { columns } = req.body; 
    const project = req.project; 

    project.columns = columns;
    await project.save();

    res.status(200).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating columns' });
  }
};

export default {createProject, listProjects, getProjectDetail, updateColumns};