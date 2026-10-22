import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import AnimatedProjectCard from '../../components/common/AnimatedProjectCard';
import toast from 'react-hot-toast';

const Projects = () => {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || ''
  });

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.type) params.type = filters.type;

      const response = await projectsAPI.getAll(params);
      // The API already restricts visitors to published resources.
      setProjects(response.data.projects || []);
    } catch {
      toast.error('Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await projectsAPI.getCategories();
      setCategories(response.data.categories || []);
    } catch {
      // Filtering still works without the course list.
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary-blue">Browse Projects</h1>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search projects..."
          value={filters.search}
          onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          className="input-field flex-1"
        />
        <select
          value={filters.category}
          onChange={(event) => setFilters({ ...filters, category: event.target.value })}
          className="input-field md:w-64"
        >
          <option value="">All Courses</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <select
          value={filters.type}
          onChange={(event) => setFilters({ ...filters, type: event.target.value })}
          className="input-field md:w-64"
        >
          <option value="">All Types</option>
          <option value="documentation">Documentation only</option>
          <option value="software">With accompanying software</option>
        </select>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg mb-2">No projects found.</p>
          <p className="text-sm text-gray-400">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <AnimatedProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
