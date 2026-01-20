import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import ActionMenu from '../../components/admin/ActionMenu';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';
import { Search, Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    category: '',
    level: '',
    institution: '',
    price: '',
    status: 'active'
  });

  const navigate = useNavigate();
  const location = useLocation();

  const fetchProjects = useCallback(async () => {
    try {
      setFetching(true);
      const response = await projectsAPI.getAll({
        page,
        limit,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        category: courseFilter !== 'all' ? courseFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });

      const data = response.data || {};
      setProjects(data.projects || []);
      setTotal(typeof data.total === 'number' ? data.total : (data.projects ? data.projects.length : 0));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load projects');
      setProjects([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [page, limit, searchTerm, statusFilter, typeFilter, courseFilter, startDate, endDate]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await projectsAPI.getCategories();
        setCategories(response.data?.categories || []);
      } catch (error) {
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const editId = location.state?.editProjectId;
    if (editId) {
      (async () => {
        try {
          const response = await projectsAPI.getById(editId);
          if (response.data?.project) {
            openEditModal(response.data.project);
          }
        } catch (error) {
          toast.error('Unable to open project for editing');
        } finally {
          navigate(location.pathname, { replace: true });
        }
      })();
    }
  }, [location.state, location.pathname, navigate]);

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    const projectType = project.projectType
      || (project.softwarePrice > 0 || project.fullProjectPrice > 0 ? 'software' : 'documentation');
    const price = project.price
      || project.documentationPrice
      || project.softwarePrice
      || project.fullProjectPrice
      || '';

    setFormData({
      title: project.title,
      description: project.description,
      course: project.categoryId,
      category: projectType,
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.course) {
      toast.error('Please select a course');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    if (!formData.level) {
      toast.error('Please select a level');
      return;
    }

    if (formData.category === 'documentation') {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast.error('Documentation price must be greater than 0');
        return;
      }
    }

    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('course', formData.course);
      payload.append('category', formData.category);
      payload.append('level', formData.level);
      if (formData.institution) {
        payload.append('institution', formData.institution);
      }
      if (formData.price) {
        payload.append('price', formData.price);
      }
      payload.append('status', formData.status);

      if (editingProject) {
        await projectsAPI.update(editingProject.id, payload);
        toast.success('Project updated successfully');
      } else {
        await projectsAPI.create(payload);
        toast.success('Project created successfully');
      }

      setShowModal(false);
      resetForm();
      await fetchProjects();
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
      await projectsAPI.delete(id);
      toast.success('Project deleted successfully');
      setDeleteModalOpen(false);
      setProjectToDelete(null);
      await fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setCourseFilter('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const currentRange = useMemo(() => {
    if (total === 0) return '0';
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    return `${start}-${end}`;
  }, [page, total, limit]);

  const totalPages = useMemo(() => Math.ceil(total / limit) || 1, [total, limit]);

  const formatDateValue = (value) => {
    if (!value) return 'N/A';
    try {
      return format(new Date(value), 'PP');
    } catch {
      return value;
    }
  };

  const renderStatusBadge = (status) => {
    const classes = status === 'active'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${classes}`}>
        {status || 'inactive'}
      </span>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-blue">Projects</h1>
          <p className="text-gray-600">Manage all projects available on the platform</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Add Project</span>
        </button>
      </div>

      <form onSubmit={handleFilterSubmit} className="card p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-600">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, course, or type"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="input-field"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Category</label>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="input-field"
            >
              <option value="all">All</option>
              <option value="documentation">Documentation</option>
              <option value="software">Software</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Course</label>
            <select
              value={courseFilter}
              onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
              className="input-field"
            >
              <option value="all">All Courses</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Start Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">End Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <button type="submit" className="btn-primary" disabled={fetching}>
              {fetching ? 'Filtering...' : 'Apply Filters'}
            </button>
            <button type="button" onClick={resetFilters} className="btn-outline">
              Reset
            </button>
          </div>
        </div>
      </form>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Course</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    No projects found
                  </td>
                </tr>
              ) : (
                projects.map((project) => {
                  const projectType = project.projectType || 'documentation';
                  return (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-primary-blue">{project.title}</td>
                      <td className="px-4 py-3 text-gray-600">{project.category?.name || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          projectType === 'software' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {projectType === 'software' ? 'Software' : 'Documentation'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{renderStatusBadge(project.status)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDateValue(project.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <ActionMenu
                          project={project}
                          onEdit={openEditModal}
                          onDeleteClick={handleDeleteClick}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {projects.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 text-sm text-gray-600 gap-3">
            <p>Showing {currentRange} of {total} projects</p>
            <div className="flex items-center gap-2">
              <button
                className="btn-outline flex items-center gap-1"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="font-semibold">Page {page} of {totalPages}</span>
              <button
                className="btn-outline flex items-center gap-1"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
              <div>
                <label className="label">Level<span className="text-red-500"> *</span></label>
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
              {formData.category === 'software' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <strong>Note:</strong> Software pricing will be supported soon. Please use Documentation for now.
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

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        project={projectToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default AdminProjects;
