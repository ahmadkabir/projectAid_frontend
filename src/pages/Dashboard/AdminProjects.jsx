import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import ActionMenu from '../../components/admin/ActionMenu';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';
import { Search, X, Table, Grid, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'inactive', 'all'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'documentation', 'software'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '', // Renamed from categoryId - represents academic course
    category: '', // New field - 'documentation' | 'software'
    level: '', // ND, HND, BSc, MSc
    institution: '', // Optional institution name
    price: '', // Single price field (replaces documentationPrice/softwarePrice/fullProjectPrice)
    status: 'active'
  });

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  // Handle edit from view page
  useEffect(() => {
    if (location.state?.editProjectId && projects.length > 0) {
      const project = projects.find(p => p.id === location.state.editProjectId);
      if (project) {
        handleEdit(project);
        // Clear state
        window.history.replaceState({}, document.title);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, projects.length]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Fetch all projects regardless of status
      const response = await projectsAPI.getAll({ status: 'all' });
      setProjects(response.data.projects);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await projectsAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.course) {
      toast.error('Please select a course');
      return;
    }
    
    if (!formData.category) {
      toast.error('Please select a category (documentation or software)');
      return;
    }
    
    // Validate Level
    if (!formData.level) {
      toast.error('Please select a level (ND, HND, BSc, or MSc)');
      return;
    }
    
    if (formData.category === 'documentation') {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast.error('Documentation price must be greater than 0');
        return;
      }
    }
    
    try {
      const formDataToSend = new FormData();
      
      // Append basic fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('course', formData.course); // categoryId in backend
      formDataToSend.append('category', formData.category);
      formDataToSend.append('level', formData.level);
      if (formData.institution) {
        formDataToSend.append('institution', formData.institution);
      }
      formDataToSend.append('price', formData.price);
      formDataToSend.append('status', formData.status);

      if (editingProject) {
        await projectsAPI.update(editingProject.id, formDataToSend);
        toast.success('Project updated successfully');
      } else {
        await projectsAPI.create(formDataToSend);
        toast.success('Project created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save project');
    }
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (id) => {
    setIsDeleting(true);
    try {
      const response = await projectsAPI.delete(id);
      
      // Find the project to get its title for the success message
      const deletedProject = projects.find(p => p.id === id);
      const projectTitle = deletedProject?.title || 'Project';
      
      // Show success toast with project details
      toast.success(
        `Project "${projectTitle}" (ID: ${id}) deleted successfully!`,
        {
          duration: 4000,
          icon: '✅',
          style: {
            borderRadius: '10px',
            background: '#10b981',
            color: '#fff',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }
      );
      
      // Close modal and refresh projects list
      setDeleteModalOpen(false);
      setProjectToDelete(null);
      await fetchProjects();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete project';
      toast.error(errorMessage, {
        duration: 5000,
        style: {
          borderRadius: '10px',
          background: '#ef4444',
          color: '#fff',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
      console.error('Delete project error:', error.response?.data || error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    // Determine category from existing project data
    let category = 'documentation'; // Default
    if (project.projectType) {
      category = project.projectType;
    } else if (project.category) {
      category = project.category;
    } else {
      // Legacy: determine from prices
      if (project.softwarePrice > 0 || project.fullProjectPrice > 0) {
        category = 'software';
      }
    }
    
    // Determine price (use price field or fallback to legacy fields)
    let price = project.price || project.documentationPrice || project.softwarePrice || project.fullProjectPrice || '';
    
    setFormData({
      title: project.title,
      description: project.description,
      course: project.categoryId,
      category: category,
      level: project.level || '',
      institution: project.institution || '',
      price: price.toString(),
      status: project.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      course: '',
      category: '',
      level: '',
      institution: '',
      price: '',
      status: 'active'
    });
    setEditingProject(null);
  };

  if (loading) return <Loading />;

  // Filter projects based on active tab, category filter, and search query
  const filteredProjects = projects.filter((project) => {
    // Filter by status tab
    if (activeTab === 'active' && project.status !== 'active') return false;
    if (activeTab === 'inactive' && project.status !== 'inactive') return false;

    // Filter by category (documentation/software)
    if (categoryFilter !== 'all') {
      const projectType = project.projectType || 
                         (project.softwarePrice > 0 || project.fullProjectPrice > 0 ? 'software' : 'documentation');
      if (projectType !== categoryFilter) return false;
    }

    // Filter by search query (case-insensitive)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const titleMatch = project.title?.toLowerCase().includes(query);
      const courseMatch = project.category?.name?.toLowerCase().includes(query);
      
      // Check projectType (new field) or legacy category detection
      const projectType = project.projectType || 
                         (project.softwarePrice > 0 || project.fullProjectPrice > 0 ? 'software' : 'documentation');
      const categoryMatch = projectType?.toLowerCase().includes(query) ||
                           (query.includes('documentation') && projectType === 'documentation') ||
                           (query.includes('software') && projectType === 'software');
      
      if (!titleMatch && !courseMatch && !categoryMatch) {
        return false;
      }
    }

    return true;
  });

  // Count projects by status
  const activeCount = projects.filter(p => p.status === 'active').length;
  const inactiveCount = projects.filter(p => p.status === 'inactive').length;
  const allCount = projects.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-blue">Manage Projects</h1>
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-primary-blue shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Table view"
            >
              <Table size={20} />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'card'
                  ? 'bg-white text-primary-blue shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Card view"
            >
              <Grid size={20} />
            </button>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary"
          >
            Add New Project
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title, course, or category..."
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all bg-white shadow-sm"
            aria-label="Search projects"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X size={20} />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-600">
            Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        )}
      </div>

      {/* Filters Row */}
      <div className="mb-6 space-y-4">
        {/* Status Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'active'
                  ? 'border-primary-blue text-primary-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'inactive'
                  ? 'border-primary-blue text-primary-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inactive ({inactiveCount})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'all'
                  ? 'border-primary-blue text-primary-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All ({allCount})
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">Filter by type:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-primary-blue text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setCategoryFilter('documentation')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === 'documentation'
                  ? 'bg-primary-blue text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Documentation
            </button>
            <button
              onClick={() => setCategoryFilter('software')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === 'software'
                  ? 'bg-primary-blue text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Software
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          {searchQuery ? (
            <>
              <p className="text-gray-500 text-lg mb-2">No projects match your search.</p>
              <p className="text-sm text-gray-400 mb-4">
                Try adjusting your search terms or{' '}
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-primary-blue hover:text-primary-green font-medium"
                >
                  clear the search
                </button>
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-500 text-lg">
                {activeTab === 'active' && 'No active projects found'}
                {activeTab === 'inactive' && 'No inactive projects found'}
                {activeTab === 'all' && 'No projects found'}
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="mt-4 btn-primary"
              >
                Create Your First Project
              </button>
            </>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => {
                  const projectType = project.projectType || 'documentation';
                  const createdDate = project.createdAt 
                    ? new Date(project.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    : 'N/A';

                  return (
                    <tr 
                      key={project.id} 
                      onClick={() => navigate(`/admin/projects/${project.id}/view`)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/admin/projects/${project.id}/view`);
                        }
                      }}
                      aria-label={`View details for ${project.title}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-primary-blue transition-colors">
                          {project.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{project.category?.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          projectType === 'software' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {projectType === 'software' ? 'Software' : 'Documentation'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          project.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{createdDate}</span>
                        </div>
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ActionMenu 
                          project={project} 
                          onEdit={handleEdit} 
                          onDeleteClick={handleDeleteClick} 
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const projectType = project.projectType || 'documentation';

            return (
              <div 
                key={project.id} 
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-green/30 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2"
                onClick={() => navigate(`/admin/projects/${project.id}/view`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/admin/projects/${project.id}/view`);
                  }
                }}
                aria-label={`View details for ${project.title}`}
              >
                {/* Card Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-primary-blue group-hover:text-primary-green transition-colors line-clamp-2 flex-1 pr-2">
                      {project.title}
                    </h3>
                    {/* Action Menu - Positioned at top right */}
                    <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                      <ActionMenu 
                        project={project} 
                        onEdit={handleEdit} 
                        onDeleteClick={handleDeleteClick} 
                      />
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                    {project.description || project.summary || 'No description available'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary-blue/10 text-primary-blue">
                      {project.category?.name || 'Uncategorized'}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                      projectType === 'software' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {projectType === 'software' ? 'Software' : 'Documentation'}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                      project.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-primary-blue">
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="4"
                  required
                />
              </div>
              {/* Course Field (Renamed from Category) */}
              <div>
                <label className="label">Course</label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select course</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Field (New - documentation/software) */}
              <div>
                <label className="label">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select category</option>
                  <option value="documentation">Documentation</option>
                  <option value="software">Software</option>
                </select>
              </div>

              {/* Level Field */}
              <div>
                <label className="label">Level <span className="text-red-500">*</span></label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select level</option>
                  <option value="ND">ND</option>
                  <option value="HND">HND</option>
                  <option value="BSc">BSc</option>
                  <option value="MSc">MSc</option>
                </select>
              </div>

              {/* Institution Field */}
              <div>
                <label className="label">Institution</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Federal Polytechnic, Kano"
                />
              </div>

              {/* Conditionally Render Fields Based on Category */}
              {formData.category === 'documentation' && (
                <>
                  <div>
                    <label className="label">Price (₦)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input-field"
                      required
                      placeholder="Enter documentation price"
                    />
                  </div>

                  <div>
                    <label className="label">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="input-field"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}

              {/* Software category - placeholder for future */}
              {formData.category === 'software' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <strong>Note:</strong> Software category is coming soon. Please select "Documentation" for now.
                </div>
              )}
              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingProject ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        project={projectToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default AdminProjects;
