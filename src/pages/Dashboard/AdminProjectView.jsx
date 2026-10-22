import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectsAPI, downloadProjectFile } from '../../services/api';
import Loading from '../../components/common/Loading';
import StatusBadge from '../../components/admin/StatusBadge';
import TableOfContents from '../../components/common/TableOfContents';
import {
  ArrowLeft,
  Download,
  Calendar,
  Tag,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Package,
  History,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileRow = ({ file, label }) => (
  <div className="flex flex-col gap-3 p-4 bg-admin-bg rounded-lg border border-admin-border sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center space-x-3">
      <FileText className="text-admin-blue" size={24} />
      <div>
        <p className="font-semibold text-admin-text">{label}</p>
        <p className="text-sm text-admin-muted">
          {file.originalName || file.fileName}
          {file.fileSize ? ` · ${formatSize(file.fileSize)}` : ''}
          {file.fileType ? ` · ${file.fileType.toUpperCase()}` : ''}
        </p>
      </div>
    </div>
    <button
      onClick={() => downloadProjectFile(file)}
      className="flex items-center justify-center space-x-2 px-4 py-2 bg-admin-blue text-white rounded-lg hover:bg-admin-blue-hover transition-colors"
    >
      <Download size={18} />
      <span>Download</span>
    </button>
  </div>
);

const AdminProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getById(id);
      setProject(response.data.project);
    } catch {
      toast.error('Failed to load project');
      navigate('/admin/projects');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <Loading />;
  if (!project) return null;

  const files = project.files || [];
  const currentFiles = files.filter((file) => file.isCurrent);
  const historyFiles = files.filter((file) => !file.isCurrent);
  const thumbnailUrl = project.thumbnail
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/uploads/thumbnails/${project.thumbnail}`
    : null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          to="/admin/projects"
          className="inline-flex items-center space-x-2 text-admin-blue hover:text-admin-blue-hover transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Projects</span>
        </Link>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-admin-blue mb-4">{project.title}</h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-admin-text mb-2">Description</h3>
              <p className="text-admin-muted whitespace-pre-wrap leading-relaxed">
                {project.description || project.summary || 'No description available'}
              </p>
            </div>

            {project.summary && project.summary !== project.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-admin-text mb-2">Summary</h3>
                <p className="text-admin-muted whitespace-pre-wrap leading-relaxed">{project.summary}</p>
              </div>
            )}

            {project.objective && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-admin-text mb-2">Objective</h3>
                <p className="text-admin-muted whitespace-pre-wrap leading-relaxed">{project.objective}</p>
              </div>
            )}
          </div>

          <div className="lg:w-80">
            <div className="bg-admin-bg rounded-lg p-4 space-y-4">
              {thumbnailUrl && (
                <div>
                  <h3 className="text-sm font-semibold text-admin-text mb-2 flex items-center space-x-2">
                    <ImageIcon size={16} />
                    <span>Cover image</span>
                  </h3>
                  <img
                    src={thumbnailUrl}
                    alt={project.title}
                    className="w-full h-48 object-cover rounded-lg border border-admin-border"
                    onError={(event) => { event.target.style.display = 'none'; }}
                  />
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-admin-text mb-2 flex items-center space-x-2">
                  <Tag size={16} />
                  <span>Course</span>
                </h3>
                <p className="text-admin-muted">{project.category?.name || 'N/A'}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-admin-text mb-2 flex items-center space-x-2">
                  <Tag size={16} />
                  <span>Category</span>
                </h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  project.hasSoftware ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {project.hasSoftware ? 'Documentation + Software' : 'Documentation only'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-admin-text mb-2">Status</h3>
                <StatusBadge status={project.status} />
              </div>

              {(project.level || project.institution) && (
                <div>
                  <h3 className="text-sm font-semibold text-admin-text mb-2">Academic details</h3>
                  <p className="text-admin-muted text-sm">
                    {[project.level, project.institution].filter(Boolean).join(' · ')}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-admin-text mb-2 flex items-center space-x-2">
                  <DollarSign size={16} />
                  <span>Pricing</span>
                </h3>
                <p className="text-admin-muted text-sm">
                  Documentation: ₦{parseFloat(project.documentationPrice || project.price || 0).toFixed(2)}
                </p>
                {project.hasSoftware && (
                  <p className="text-admin-muted text-sm">
                    Software:{' '}
                    {project.softwareSaleMode === 'included'
                      ? 'included'
                      : `₦${parseFloat(project.softwarePrice || 0).toFixed(2)}`}
                  </p>
                )}
                {project.hasSoftware && project.softwareSaleMode === 'separate' && parseFloat(project.fullProjectPrice || 0) > 0 && (
                  <p className="text-admin-muted text-sm">
                    Bundle: ₦{parseFloat(project.fullProjectPrice).toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-admin-text mb-2 flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Created</span>
                </h3>
                <p className="text-admin-muted">{formatDate(project.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {project.hasSoftware && (
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-admin-blue mb-4 flex items-center gap-2">
            <Package size={20} /> Accompanying software
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p><span className="text-admin-muted">Name:</span> <span className="text-admin-text font-medium">{project.softwareName || '—'}</span></p>
              <p><span className="text-admin-muted">Version:</span> <span className="text-admin-text">{project.softwareVersion || '—'}</span></p>
              <p><span className="text-admin-muted">Operating system:</span> <span className="text-admin-text">{project.softwareOperatingSystem || '—'}</span></p>
              <p><span className="text-admin-muted">Requirements:</span> <span className="text-admin-text">{project.softwareRequirements || '—'}</span></p>
            </div>
            <div className="space-y-2">
              <p><span className="text-admin-muted">Sale mode:</span> <span className="text-admin-text">{project.softwareSaleMode === 'separate' ? 'Sold separately' : 'Included with documentation'}</span></p>
              <p><span className="text-admin-muted">Licence:</span> <span className="text-admin-text">{project.softwareLicense || '—'}</span></p>
              <p className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-admin-blue" />
                <span className="text-admin-text">
                  {project.softwareRedistributionAllowed ? 'Redistribution permitted' : 'Redistribution not permitted'}
                </span>
              </p>
              {project.softwareDescription && (
                <p className="text-admin-muted whitespace-pre-wrap">{project.softwareDescription}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {project.hasSoftware === false && project.projectType === 'documentation' && (
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-admin-blue mb-2 flex items-center gap-2">
            <Package size={20} /> Documentation only
          </h2>
          <p className="text-admin-muted text-sm">
            This project has no active software. Use Edit to add an installer at any time.
          </p>
        </div>
      )}

      {project.projectType === 'documentation' && (
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-admin-blue mb-4">Table of Contents</h2>
          <TableOfContents collapsible={true} defaultExpanded={true} />
        </div>
      )}

      <div className="card p-6">
        <h2 className="text-xl font-bold text-admin-blue mb-4">Project files</h2>

        <div className="space-y-4">
          {currentFiles.length === 0 && historyFiles.length === 0 && (
            <p className="text-admin-muted text-center py-8">No files uploaded for this project.</p>
          )}

          {currentFiles.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              label={
                file.category === 'documentation'
                  ? 'Documentation'
                  : file.category === 'software'
                    ? 'Software installer'
                    : 'User guide'
              }
            />
          ))}

          {historyFiles.length > 0 && (
            <div className="pt-4 border-t border-admin-border">
              <h3 className="text-sm font-semibold text-admin-text mb-3 flex items-center gap-2">
                <History size={16} /> Replaced files (kept for existing purchases)
              </h3>
              <div className="space-y-3">
                {historyFiles.map((file) => (
                  <FileRow
                    key={file.id}
                    file={file}
                    label={
                      file.category === 'documentation'
                        ? 'Previous documentation'
                        : file.category === 'software'
                          ? 'Previous installer'
                          : 'Previous user guide'
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProjectView;
