import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import CreateProjectModal from '../components/CreateProjectModal';

export default function Project() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get(`/workspaces/${workspaceId}/projects`);
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [workspaceId]);

  const handleCreated = (newProject) => {
    setProjects((prev) => [...prev, newProject]);
  };

  if (loading) return <p>Loading projects...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Projects</h2>
        <button onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      <div className="project-grid">
        {projects.map((project) => (
          <div
            key={project._id}
            className="project-card"
            onClick={() => navigate(`/projects/${project._id}`)}
          >
            <h4>{project.name}</h4>
            <p>{project.description}</p>
          </div>
        ))}
        {projects.length === 0 && <p>No projects yet — create one to get started.</p>}
      </div>

      {showModal && (
        <CreateProjectModal
          workspaceId={workspaceId}
          onCreated={handleCreated}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}