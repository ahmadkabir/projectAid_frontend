import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import TableOfContents from '../../components/common/TableOfContents';
import { ArrowLeft, Download, Calendar, Tag, DollarSign, FileText, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getById(id);
      setProject(response.data.project);
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/admin/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (filename, type) => {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
    const url = type === 'documentation' 
      ? `${baseUrl}/uploads/documentation/${filename}`
      : `${baseUrl}/uploads/thumbnails/${filename}`;
    
    window.open(url, '_blank');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDocumentDownload = (filePath) => {
    if (!filePath) return;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
    const normalized = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    window.open(`${baseUrl}/${normalized}`, '_blank');
  };

  if (loading) return <Loading />;
  if (!project) return null;

  const projectType = project.projectType || 'documentation';
  const documentFiles = project.documentFiles || [];
  const thumbnailUrl = project.thumbnail
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/uploads/thumbnails/${project.thumbnail}`
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin/projects"
          className="inline-flex items-center space-x-2 text-primary-blue hover:text-primary-green transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Projects</span>
        </Link>
        <h1 className="text-3xl font-bold text-primary-blue">Project Details</h1>
      </div>

      {/* Project Information Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Main Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-primary-blue mb-4">{project.title}</h2>
            
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {project.description || project.summary || 'No description available'}
              </p>
            </div>

            {/* Summary if available */}
            {project.summary && project.summary !== project.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Summary</h3>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {project.summary}
                </p>
              </div>
            )}

            {/* Objective if available */}
            {project.objective && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Objective</h3>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {project.objective}
                </p>
              </div>
            )}

            {/* Features if available */}
            {project.features && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Features</h3>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {project.features}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Metadata */}
          <div className="lg:w-80">
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {/* Thumbnail */}
              {thumbnailUrl && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <ImageIcon size={16} />
                    <span>Thumbnail</span>
                  </h3>
                  <img
                    src={thumbnailUrl}
                    alt={project.title}
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Course */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Tag size={16} />
                  <span>Course</span>
                </h3>
                <p className="text-gray-600">{project.category?.name || 'N/A'}</p>
              </div>

              {/* Category/Type */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Tag size={16} />
                  <span>Category</span>
                </h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  projectType === 'software' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {projectType === 'software' ? 'Software' : 'Documentation'}
                </span>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {project.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Price */}
              {project.price && parseFloat(project.price) > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <DollarSign size={16} />
                    <span>Price</span>
                  </h3>
                  <p className="text-gray-600 font-bold text-lg">₦{parseFloat(project.price).toFixed(2)}</p>
                </div>
              )}

              {/* Created Date */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Created</span>
                </h3>
                <p className="text-gray-600">{formatDate(project.createdAt)}</p>
              </div>

              {/* Updated Date */}
              {project.updatedAt && project.updatedAt !== project.createdAt && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>Last Updated</span>
                  </h3>
                  <p className="text-gray-600">{formatDate(project.updatedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table of Contents - Show for documentation projects */}
      {projectType === 'documentation' && (
        <TableOfContents collapsible={true} defaultExpanded={true} />
      )}

      {/* Files Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-primary-blue mb-4">Project Files</h2>
        
        <div className="space-y-4">
          {/* Documentation File */}
          {project.documentationFile && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <FileText className="text-primary-blue" size={24} />
                <div>
                  <p className="font-semibold text-gray-700">Documentation File</p>
                  <p className="text-sm text-gray-500">{project.documentationFile}</p>
                </div>
              </div>
              <button
                onClick={() => handleDownload(project.documentationFile, 'documentation')}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-green transition-colors"
              >
                <Download size={18} />
                <span>Download</span>
              </button>
            </div>
          )}

          {/* AI Generated Attachments */}
          {documentFiles.length > 0 && (
            <div className="space-y-3">
              {documentFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <FileText className="text-primary-blue" size={24} />
                    <div>
                      <p className="font-semibold text-gray-700">{file.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {file.fileType?.toUpperCase()} • {new Date(file.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDocumentDownload(file.filePath)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-green transition-colors"
                  >
                    <Download size={18} />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Thumbnail File */}
          {project.thumbnail && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <ImageIcon className="text-primary-blue" size={24} />
                <div>
                  <p className="font-semibold text-gray-700">Thumbnail Image</p>
                  <p className="text-sm text-gray-500">{project.thumbnail}</p>
                </div>
              </div>
              <button
                onClick={() => handleDownload(project.thumbnail, 'thumbnail')}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-green transition-colors"
              >
                <Download size={18} />
                <span>Download</span>
              </button>
            </div>
          )}

          {!project.documentationFile && !project.thumbnail && documentFiles.length === 0 && (
            <p className="text-gray-500 text-center py-8">No files uploaded for this project.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProjectView;
