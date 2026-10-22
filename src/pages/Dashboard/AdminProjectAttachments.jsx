import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectsAPI, documentAPI, downloadProjectFile, uploadProjectFile } from '../../services/api';
import Loading from '../../components/common/Loading';
import FileUpload from '../../components/common/FileUpload';
import UploadProgress from '../../components/common/UploadProgress';
import StatusBadge from '../../components/admin/StatusBadge';
import { ArrowLeft, Sparkles, Save, X, Download, Package, Archive, History } from 'lucide-react';
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
  const [softwareInstaller, setSoftwareInstaller] = useState(null);
  const [softwareGuide, setSoftwareGuide] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

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

  const handleGenerateDoc = async () => {
    if (!project) return;
    setIsGenerating(true);
    try {
      await documentAPI.generate(id);
      toast.success('Document generated successfully! Redirecting to preview...', {
        duration: 3000,
        icon: '✨'
      });
      setTimeout(() => navigate(`/admin/projects/${id}/doc-preview`), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdate = async () => {
    if (!project) return;

    const hasChanges = attachmentFile || thumbnailFile || softwareInstaller || softwareGuide;
    if (!hasChanges) {
      toast.error('Please select at least one file to update');
      return;
    }

    if ((softwareInstaller || softwareGuide) && !project.hasSoftware) {
      toast.error('Add the software details first using Edit, then upload the installer here.');
      return;
    }

    setIsUpdating(true);
    setUploadStatus(null);
    try {
      // Cover images stay on the public thumbnails endpoint.
      if (thumbnailFile) {
        setUploadStatus({ label: 'Uploading cover image…', percent: 0 });
        const formData = new FormData();
        formData.append('thumbnail', thumbnailFile);
        await projectsAPI.update(id, formData);
      }

      // Paid files go straight from the browser to private R2 storage.
      const directUploads = [
        { category: 'documentation', file: attachmentFile },
        { category: 'software', file: softwareInstaller },
        { category: 'guide', file: softwareGuide }
      ].filter((entry) => entry.file);

      for (const { category, file } of directUploads) {
        const label = `Uploading ${file.name}…`;
        setUploadStatus({ label, percent: 0 });
        await uploadProjectFile({
          projectId: id,
          category,
          file,
          onProgress: (percent) => setUploadStatus({ label, percent })
        });
      }

      toast.success('Project attachments updated successfully!', { duration: 4000, icon: '✅' });
      await fetchProject();
      setAttachmentFile(null);
      setThumbnailFile(null);
      setSoftwareInstaller(null);
      setSoftwareGuide(null);
    } catch (error) {
      const fieldErrors = error.response?.data?.errors;
      const fieldMessage = Array.isArray(fieldErrors) && fieldErrors[0]?.msg;
      toast.error(
        fieldMessage ||
          error.response?.data?.message ||
          error.message ||
          'Failed to update attachments'
      );
    } finally {
      setIsUpdating(false);
      setUploadStatus(null);
    }
  };

  const handleArchiveSoftware = async () => {
    if (!window.confirm('Archive the software? The documentation stays published and the installer is kept for existing buyers.')) {
      return;
    }
    try {
      await projectsAPI.archiveSoftware(id);
      toast.success('Software archived');
      await fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to archive software');
    }
  };

  if (loading) return <Loading />;
  if (!project) return null;

  const currentFiles = (project.files || []).filter((file) => file.isCurrent);
  const historyFiles = (project.files || []).filter((file) => !file.isCurrent);
  const documentationFiles = currentFiles.filter((file) => file.category === 'documentation');
  const softwareFiles = currentFiles.filter((file) => file.category === 'software');
  const guideFiles = currentFiles.filter((file) => file.category === 'guide');

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
        <p className="text-sm text-admin-muted mt-2">
          Managing attachments for: <strong className="text-admin-text">{project.title}</strong>
        </p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-admin-blue">Project Information</h2>
          <div className="flex items-center gap-2">
            <StatusBadge status={project.status} />
            <span className={`status-pill ${project.hasSoftware ? 'bg-admin-blue/10 text-admin-blue' : 'bg-admin-success/10 text-admin-success'}`}>
              {project.hasSoftware ? 'Documentation + Software' : 'Documentation only'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-admin-muted uppercase tracking-wide">Description</label>
              <p className="text-admin-text mt-1 text-sm whitespace-pre-wrap">
                {project.description || 'No description available'}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-admin-muted uppercase tracking-wide">Course</label>
              <p className="text-admin-text mt-1">{project.category?.name || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-admin-muted uppercase tracking-wide">Documentation price</label>
              <p className="text-admin-text mt-1">
                ₦{parseFloat(project.documentationPrice || project.price || 0).toFixed(2)}
              </p>
            </div>
            {project.level && (
              <div>
                <label className="text-sm font-semibold text-admin-muted uppercase tracking-wide">Level</label>
                <p className="text-admin-text mt-1">{project.level}</p>
              </div>
            )}
            {project.institution && (
              <div>
                <label className="text-sm font-semibold text-admin-muted uppercase tracking-wide">Institution</label>
                <p className="text-admin-text mt-1">{project.institution}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-xl font-bold text-admin-blue mb-4">Current files</h2>
        <div className="space-y-3">
          {currentFiles.length === 0 && <p className="text-admin-muted">No files uploaded yet.</p>}
          {[...documentationFiles, ...softwareFiles, ...guideFiles].map((file) => (
            <div key={file.id} className="flex flex-col gap-3 p-4 bg-admin-bg rounded-lg border border-admin-border sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-admin-text">
                  {file.category === 'documentation' ? 'Documentation' : file.category === 'software' ? 'Software installer' : 'User guide'}
                </p>
                <p className="text-sm text-admin-muted">
                  {file.originalName || file.fileName}
                  {file.fileSize ? ` · ${(file.fileSize / (1024 * 1024)).toFixed(1)} MB` : ''}
                </p>
              </div>
              <button
                onClick={() => downloadProjectFile(file)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-admin-blue text-white rounded-lg hover:bg-admin-blue-hover transition-colors"
              >
                <Download size={16} /> Download
              </button>
            </div>
          ))}
        </div>

        {historyFiles.length > 0 && (
          <div className="mt-6 pt-4 border-t border-admin-border">
            <h3 className="text-sm font-semibold text-admin-text mb-3 flex items-center gap-2">
              <History size={16} /> Replaced files (retained for existing purchases)
            </h3>
            <div className="space-y-2">
              {historyFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-admin-bg rounded-lg border border-admin-border">
                  <span className="text-sm text-admin-muted truncate">
                    {file.category === 'software' ? 'Installer' : file.category === 'guide' ? 'Guide' : 'Documentation'} ·{' '}
                    {file.originalName || file.fileName}
                  </span>
                  <button
                    onClick={() => downloadProjectFile(file)}
                    className="text-admin-blue hover:text-admin-blue-hover"
                    aria-label="Download previous file"
                  >
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-xl font-bold text-admin-blue mb-6">Upload / replace files</h2>

        <div className="space-y-6">
          <div>
            <FileUpload
              label="Documentation (PDF, DOC or DOCX)"
              accept=".pdf,.doc,.docx"
              value={attachmentFile}
              onChange={setAttachmentFile}
              previewType="file"
              className="w-full"
            />
            <p className="text-xs text-admin-muted mt-2">
              Replacing the document keeps the previous file available to customers who already bought it.
            </p>
          </div>

          <FileUpload
            label="Cover image"
            accept=".jpg,.jpeg,.png,.webp"
            value={thumbnailFile}
            onChange={setThumbnailFile}
            previewType="image"
            recommendedSize="1200 × 630px"
            className="w-full"
          />

          {project.hasSoftware ? (
            <div className="rounded-xl border border-admin-border p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold text-admin-text flex items-center gap-2">
                  <Package size={16} /> Software files
                </h3>
                <button
                  type="button"
                  onClick={handleArchiveSoftware}
                  className="admin-btn-ghost text-admin-pending"
                >
                  <Archive size={16} /> Archive software
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUpload
                  label="Software installer (ZIP / RAR)"
                  accept=".zip,.rar"
                  value={softwareInstaller}
                  onChange={setSoftwareInstaller}
                  previewType="file"
                />
                <FileUpload
                  label="User guide (optional)"
                  accept=".pdf,.doc,.docx"
                  value={softwareGuide}
                  onChange={setSoftwareGuide}
                  previewType="file"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-admin-border bg-admin-bg p-4 text-sm text-admin-muted">
              This project is documentation only. Use <strong className="text-admin-text">Edit</strong> to add software,
              its price and installer.
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        {uploadStatus && (
          <UploadProgress
            label={uploadStatus.label}
            percent={uploadStatus.percent}
            className="mb-6"
          />
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            onClick={handleGenerateDoc}
            disabled={isGenerating || isUpdating}
            className="px-6 py-3 bg-gradient-to-r from-admin-blue to-admin-blue text-white rounded-lg hover:from-admin-blue-hover hover:to-admin-blue-hover transition-all font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Generate DOC with AI</span>
              </>
            )}
          </button>

          <button
            onClick={handleUpdate}
            disabled={isUpdating || isGenerating || (!attachmentFile && !thumbnailFile && !softwareInstaller && !softwareGuide)}
            className="px-6 py-3 bg-admin-blue text-white rounded-lg hover:bg-admin-blue-hover transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Update</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/admin/projects')}
            disabled={isUpdating || isGenerating}
            className="px-6 py-3 bg-admin-bg text-admin-text rounded-lg hover:bg-admin-bg transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
