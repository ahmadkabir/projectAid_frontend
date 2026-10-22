import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import ActionMenu from '../../components/admin/ActionMenu';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';
import StatusBadge from '../../components/admin/StatusBadge';
import Pagination from '../../components/admin/Pagination';
import ProjectWizard from '../../components/admin/ProjectWizard';
import { useAdminPage } from '../../app/admin/layout/adminPageContext';
import { Search, Calendar, Plus, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AdminProjects = () => {
  const { setAdminPage } = useAdminPage() || {};
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

  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (!setAdminPage) return;
    setAdminPage('Projects', loading ? 'Loading projects…' : `${total} project${total === 1 ? '' : 's'} found`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, loading, setAdminPage]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await projectsAPI.getCategories();
        setCategories(response.data?.categories || []);
      } catch {
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
            openEditWizard(response.data.project);
          }
        } catch {
          toast.error('Unable to open project for editing');
        } finally {
          navigate(location.pathname, { replace: true });
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, location.pathname, navigate]);

  const openCreateWizard = () => {
    setEditingProject(null);
    setWizardOpen(true);
  };

  const openEditWizard = (project) => {
    setEditingProject(project);
    setWizardOpen(true);
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setEditingProject(null);
  };

  const handleSaved = async () => {
    closeWizard();
    await fetchProjects();
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

  const handleFilterSubmit = (event) => {
    event.preventDefault();
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

  const totalPages = useMemo(() => Math.ceil(total / limit) || 1, [total, limit]);

  const formatDateValue = (value) => {
    if (!value) return 'N/A';
    try {
      return format(new Date(value), 'PP');
    } catch {
      return value;
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={openCreateWizard} className="admin-btn">
          <Plus size={18} />
          <span>Add Project</span>
        </button>
      </div>

      <form onSubmit={handleFilterSubmit} className="card p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="admin-label" htmlFor="projects-search">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted pointer-events-none" />
              <input
                id="projects-search"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title, course, or type"
                className="admin-input pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="admin-label" htmlFor="projects-status">Status</label>
            <select
              id="projects-status"
              value={statusFilter}
              onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}
              className="admin-input"
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="admin-label" htmlFor="projects-category">Category</label>
            <select
              id="projects-category"
              value={typeFilter}
              onChange={(event) => { setTypeFilter(event.target.value); setPage(1); }}
              className="admin-input"
            >
              <option value="all">All</option>
              <option value="documentation">Documentation only</option>
              <option value="software">With software</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="admin-label" htmlFor="projects-course">Course</label>
            <select
              id="projects-course"
              value={courseFilter}
              onChange={(event) => { setCourseFilter(event.target.value); setPage(1); }}
              className="admin-input"
            >
              <option value="all">All Courses</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="admin-label" htmlFor="projects-start">Start date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted pointer-events-none" />
              <input
                id="projects-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="admin-input pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="admin-label" htmlFor="projects-end">End date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted pointer-events-none" />
              <input
                id="projects-end"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="admin-input pl-9"
              />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <button type="submit" className="admin-btn" disabled={fetching}>
              {fetching ? 'Filtering...' : 'Apply Filters'}
            </button>
            <button type="button" onClick={resetFilters} className="admin-btn-ghost">
              <RotateCcw size={15} />
              Reset
            </button>
          </div>
        </div>
      </form>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[760px]">
            <thead>
              <tr>
                <th scope="col">Project Title</th>
                <th scope="col">Course</th>
                <th scope="col">Category</th>
                <th scope="col">Status</th>
                <th scope="col">Created Date</th>
                <th scope="col" className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-admin-muted">
                    <p className="font-medium text-admin-text">No projects found</p>
                    <p className="text-xs mt-1">Try adjusting the filters or search.</p>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id}>
                    <td className="font-semibold text-admin-blue max-w-[260px] truncate">{project.title}</td>
                    <td className="text-admin-muted">{project.category?.name || 'N/A'}</td>
                    <td>
                      <span className={`status-pill ${
                        project.hasSoftware ? 'bg-admin-blue/10 text-admin-blue' : 'bg-admin-success/10 text-admin-success'
                      }`}>
                        <span className={`status-dot ${project.hasSoftware ? 'bg-admin-blue' : 'bg-admin-success'}`} />
                        {project.hasSoftware ? 'Documentation + Software' : 'Documentation only'}
                      </span>
                    </td>
                    <td><StatusBadge status={project.status} /></td>
                    <td className="text-admin-muted whitespace-nowrap">{formatDateValue(project.createdAt)}</td>
                    <td className="text-right">
                      <ActionMenu
                        project={project}
                        onEdit={openEditWizard}
                        onDeleteClick={handleDeleteClick}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={setPage}
          label="projects"
        />
      </div>

      {wizardOpen && (
        <ProjectWizard
          project={editingProject}
          categories={categories}
          onClose={closeWizard}
          onSaved={handleSaved}
        />
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
