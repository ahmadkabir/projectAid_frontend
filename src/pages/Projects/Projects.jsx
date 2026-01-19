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
    fetchCategories();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      // Send projectType filter to backend for database-level filtering
      if (filters.type) params.type = filters.type;
      
      const response = await projectsAPI.getAll(params);
      const projects = response.data.projects || [];
      
      // Additional frontend validation: ensure projectType matches filter
      // This is a safety check in case backend normalization changes values
      let filteredProjects = projects;
      if (filters.type) {
        const filterType = filters.type.toLowerCase();
        
        // Handle 'full' filter - not supported in current schema
        if (filterType === 'full') {
          filteredProjects = [];
        } else {
          filteredProjects = projects.filter((project) => {
            const projectType = project.projectType?.toLowerCase();
            
            // Strict matching: projectType must exactly match filter
            if (!projectType) {
              console.warn(`Project ${project.id} has no projectType. Excluding from filtered results.`);
              return false;
            }
            
            return projectType === filterType;
          });
        }
      }
      
      setProjects(filteredProjects);
    } catch (error) {
      toast.error('Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await projectsAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary-blue">Browse Projects</h1>

      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search projects..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="input-field flex-1"
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="input-field md:w-64"
        >
          <option value="">All Courses</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="input-field md:w-64"
        >
          <option value="">All Types</option>
          <option value="documentation">Documentation Only</option>
          <option value="software">Software Only</option>
          <option value="full">Full Project</option>
        </select>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg mb-2">
            {filters.type 
              ? `No ${filters.type === 'documentation' ? 'Documentation' : filters.type === 'software' ? 'Software' : 'Full Project'} projects found.`
              : 'No projects found.'}
          </p>
          {filters.type && (
            <p className="text-sm text-gray-400">
              {filters.type === 'full' 
                ? 'Full Project type is not currently available. Try filtering by Documentation or Software.'
                : 'Try adjusting your filters or search terms.'}
            </p>
          )}
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
