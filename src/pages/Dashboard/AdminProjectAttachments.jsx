import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectsAPI, documentAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import FileUpload from '../../components/common/FileUpload';
import TableOfContents from '../../components/common/TableOfContents';
import { ArrowLeft, Upload, Sparkles, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProjectAttachments = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

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

  const handleGenerateDoc = async () => {
    if (!project) return;

    setIsGenerating(true);
    try {
      const response = await documentAPI.generate(id);
      
      toast.success('Document generated successfully! Redirecting to preview...', {
        duration: 3000,
        icon: '✨',
      });
      
      // Navigate to preview page after a short delay
      setTimeout(() => {
        navigate(`/admin/projects/${id}/doc-preview`);
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to generate document. Please try again.';
      toast.error(errorMessage);
      console.error('Generate document error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdate = async () => {
    if (!project) return;

    // Validate that at least one file is selected
    if (!attachmentFile && !thumbnailFile) {
      toast.error('Please select at least one file to update');
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      
      if (attachmentFile) {
        formData.append('documentationFile', attachmentFile);
      }
      
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      // Update project with new files
      await projectsAPI.update(id, formData);
      
      toast.success('Project attachments updated successfully!', {
        duration: 4000,
        icon: '✅',
      });
      
      // Refresh project data
      await fetchProject();
      
      // Clear file selections
      setAttachmentFile(null);
      setThumbnailFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update attachments');
      console.error('Update attachments error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/projects');
  };

  if (loading) return <Loading />;
  if (!project) return null;

  const projectType = project.projectType || 'documentation';
  const documentFiles = project.documentFiles || [];

  const handleDocumentDownload = (filePath) => {
    if (!filePath) return;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
    const normalized = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    window.open(`${baseUrl}/${normalized}`, '_blank');
  };

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
        <h1 className="text-3xl font-bold text-primary-blue">Project Attachments</h1>
        <p className="text-gray-600 mt-2">Manage attachments and files for: <strong>{project.title}</strong></p>
      </div>

      {/* Project Information Card (Read-only) */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-primary-blue mb-4">Project Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Title</label>
              <p className="text-gray-900 font-medium mt-1">{project.title}</p>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Description</label>
              <p className="text-gray-700 mt-1 text-sm whitespace-pre-wrap line-clamp-4">
                {project.description || project.summary || 'No description available'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Course</label>
              <p className="text-gray-700 mt-1">{project.category?.name || 'N/A'}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Category</label>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                projectType === 'software' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {projectType === 'software' ? 'Software' : 'Documentation'}
              </span>
            </div>
            
            {project.level && (
              <div>
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Level</label>
                <p className="text-gray-700 mt-1">{project.level}</p>
              </div>
            )}
            
            {project.institution && (
              <div>
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Institution</label>
                <p className="text-gray-700 mt-1">{project.institution}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table of Contents (Read-only) */}
      {projectType === 'documentation' && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-primary-blue mb-4">Table of Contents</h2>
          <TableOfContents />
        </div>
      )}

      {/* Existing AI Documents */}
      {documentFiles.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-primary-blue mb-4">AI Generated Documents</h2>
          <div className="space-y-3">
            {documentFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-semibold text-gray-800">{file.fileName}</p>
                  <p className="text-sm text-gray-500">
                    Saved as {file.fileType?.toUpperCase()} on {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDocumentDownload(file.filePath)}
                  className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-green transition-colors"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-primary-blue mb-6">Upload Files</h2>
        
        <div className="space-y-6">
          {/* Attachment File Upload */}
          <FileUpload
            label="Attachment File"
            accept=".pdf,.doc,.docx"
            value={attachmentFile}
            onChange={setAttachmentFile}
            required={false}
            previewType="file"
            className="w-full"
          />

          {/* Thumbnail Upload */}
          <FileUpload
            label="Thumbnail Image"
            accept=".jpg,.jpeg,.png"
            value={thumbnailFile}
            onChange={setThumbnailFile}
            required={false}
            previewType="image"
            recommendedSize="1200 × 630px"
            className="w-full"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          {/* Generate DOC with AI Button */}
          <button
            onClick={handleGenerateDoc}
            disabled={isGenerating || isUpdating}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Generate DOC with AI</span>
              </>
            )}
          </button>

          {/* Update Button */}
          <button
            onClick={handleUpdate}
            disabled={isUpdating || isGenerating || (!attachmentFile && !thumbnailFile)}
            className="px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-green transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Update</span>
              </>
            )}
          </button>

          {/* Cancel Button */}
          <button
            onClick={handleCancel}
            disabled={isUpdating || isGenerating}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProjectAttachments;
