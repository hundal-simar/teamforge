import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

export default function BoardPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await api.get(`/projects/${projectId}`);
        setProject(data);
      } catch (err) {
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  if (loading) return <p>Loading board...</p>;
  if (!project) return <p>Project not found.</p>;

  const sortedColumns = [...project.columns].sort((a, b) => a.order - b.order);

  return (
    <div>
      <h2>{project.name}</h2>
      <div style={{ display: 'flex', gap: '16px' }}>
        {sortedColumns.map((col) => (
          <div key={col.id} className="board-column" style={{ flex: 1, minWidth: '250px' }}>
            <h4>{col.name}</h4>
            <div className="column-tasks">
              {/* tasks render here in a later day */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}