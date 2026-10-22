import { useEffect, useMemo, useState } from 'react';
import { projectsAPI, uploadProjectFile } from '../../services/api';
import FileUpload from '../common/FileUpload';
import UploadProgress from '../common/UploadProgress';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Info,
  Package,
  Save,
  Send,
  UploadCloud,
  X,
  AlertCircle,
  Archive
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Project information', icon: FileText },
  { id: 2, title: 'Documentation', icon: UploadCloud },
  { id: 3, title: 'Software availability', icon: Package },
  { id: 4, title: 'Review & publish', icon: Check }
];

const LEVELS = ['ND', 'HND', 'BSc', 'MSc'];

const emptyForm = {
  title: '',
  course: '',
  level: '',
  institution: '',
  description: '',
  price: '',
  status: 'draft',
  thumbnail: null,
  documentationFile: null,
  hasSoftware: 'no',
  softwareName: '',
  softwareVersion: '',
  softwareDescription: '',
  softwareOperatingSystem: '',
  softwareRequirements: '',
  softwareSaleMode: 'included',
  softwarePrice: '',
  fullProjectPrice: '',
  softwareLicense: '',
  softwareRedistributionAllowed: '',
  softwareInstaller: null,
  softwareGuide: null
};

const hydrate = (project) => {
  if (!project) return { ...emptyForm };

  return {
    ...emptyForm,
    title: project.title || '',
    course: project.categoryId ? String(project.categoryId) : '',
    level: project.level || '',
    institution: project.institution || '',
    description: project.description || '',
    price: project.documentationPrice ?? project.price ?? '',
    status: project.status || 'draft',
    hasSoftware: project.hasSoftware ? 'yes' : 'no',
    softwareName: project.softwareName || '',
    softwareVersion: project.softwareVersion || '',
    softwareDescription: project.softwareDescription || '',
    softwareOperatingSystem: project.softwareOperatingSystem || '',
    softwareRequirements: project.softwareRequirements || '',
    softwareSaleMode: project.softwareSaleMode || 'included',
    softwarePrice: project.softwarePrice ?? '',
    fullProjectPrice: project.fullProjectPrice ?? '',
    softwareLicense: project.softwareLicense || '',
    softwareRedistributionAllowed:
      project.softwareRedistributionAllowed === true
        ? 'yes'
        : project.softwareRedistributionAllowed === false
          ? 'no'
          : ''
  };
};

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ProjectWizard = ({ project = null, categories = [], onClose, onSaved }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => hydrate(project));
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const editing = Boolean(project);
  const currentStatus = project?.status || 'draft';
  const existingDocumentation = project?.documentationFiles?.[0] || null;
  const existingInstaller = project?.softwareFiles?.[0] || null;
  const existingGuide = project?.guideFiles?.[0] || null;

  useEffect(() => {
    setForm(hydrate(project));
    setStep(1);
    setErrors([]);
  }, [project]);

  const courseName = useMemo(
    () => categories.find((category) => String(category.id) === String(form.course))?.name || '',
    [categories, form.course]
  );

  const set = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));

  const validateStep = (target) => {
    const messages = [];

    if (target >= 1) {
      if (!form.title.trim()) messages.push('Project title is required');
      if (!form.course) messages.push('Course / department is required');
      if (!form.level) messages.push('Academic level is required');
      if (!form.description.trim()) messages.push('Project description is required');
      if (!form.price || parseFloat(form.price) <= 0) {
        messages.push('Documentation price must be greater than 0');
      }
    }

    if (target >= 2) {
      if (!existingDocumentation && !form.documentationFile) {
        messages.push('Upload the project documentation (PDF or DOCX)');
      }
    }

    if (target >= 3 && form.hasSoftware === 'yes') {
      if (!form.softwareName.trim()) messages.push('Software name is required');
      if (!existingInstaller && !form.softwareInstaller) {
        messages.push('Upload the software installer (ZIP or RAR)');
      }
      if (form.softwareSaleMode === 'separate' && (!form.softwarePrice || parseFloat(form.softwarePrice) <= 0)) {
        messages.push('Software price must be greater than 0 when it is sold separately');
      }
      if (form.softwareRedistributionAllowed === '') {
        messages.push('Record whether the software may be redistributed');
      }
    }

    return messages;
  };

  const goNext = () => {
    const messages = step === 1 ? validateStep(1) : [];
    if (messages.length > 0) {
      setErrors(messages);
      return;
    }
    setErrors([]);
    setStep((current) => Math.min(current + 1, 4));
  };

  // Only metadata (plus the public cover image) is sent through the API. The
  // paid files are uploaded directly to private object storage afterwards.
  const buildMetadataPayload = () => {
    const payload = new FormData();
    payload.append('title', form.title.trim());
    payload.append('description', form.description.trim());
    payload.append('course', form.course);
    payload.append('level', form.level);
    payload.append('price', form.price);
    if (form.institution.trim()) payload.append('institution', form.institution.trim());

    if (form.thumbnail) payload.append('thumbnail', form.thumbnail);

    if (form.hasSoftware === 'yes') {
      payload.append('hasSoftware', 'true');
      payload.append('softwareName', form.softwareName.trim());
      payload.append('softwareVersion', form.softwareVersion.trim());
      payload.append('softwareDescription', form.softwareDescription.trim());
      payload.append('softwareOperatingSystem', form.softwareOperatingSystem.trim());
      payload.append('softwareRequirements', form.softwareRequirements.trim());
      payload.append('softwareLicense', form.softwareLicense.trim());
      payload.append('softwareSaleMode', form.softwareSaleMode);
      if (form.softwareSaleMode === 'separate') {
        payload.append('softwarePrice', form.softwarePrice || '0');
        payload.append('fullProjectPrice', form.fullProjectPrice || '0');
      } else {
        payload.append('softwarePrice', '0');
        payload.append('fullProjectPrice', '0');
      }
      payload.append(
        'softwareRedistributionAllowed',
        form.softwareRedistributionAllowed === 'yes' ? 'true' : 'false'
      );
    } else {
      payload.append('hasSoftware', 'false');
    }

    return payload;
  };

  const uploadSelectedFiles = async (projectId) => {
    const uploads = [
      { category: 'documentation', file: form.documentationFile },
      form.hasSoftware === 'yes'
        ? { category: 'software', file: form.softwareInstaller }
        : null,
      form.hasSoftware === 'yes' ? { category: 'guide', file: form.softwareGuide } : null
    ].filter((entry) => entry && entry.file);

    for (const { category, file } of uploads) {
      const label = `Uploading ${file.name}…`;
      setUploadStatus({ label, percent: 0 });
      await uploadProjectFile({
        projectId,
        category,
        file,
        onProgress: (percent) => setUploadStatus({ label, percent })
      });
    }
  };

  const save = async (targetStatus) => {
    const requiresFiles = targetStatus === 'pending_review' || targetStatus === 'published';
    const messages = requiresFiles ? validateStep(3) : validateStep(1);

    if (requiresFiles && messages.length > 0) {
      setErrors(messages);
      if (messages.some((message) => /documentation/i.test(message))) setStep(2);
      else if (messages.some((message) => /software|installer|redistribut/i.test(message))) setStep(3);
      return;
    }

    if (messages.length > 0) {
      setErrors(messages);
      setStep(1);
      return;
    }

    setSaving(true);
    setErrors([]);
    setUploadStatus(null);

    try {
      const metadata = buildMetadataPayload();
      let savedProject;
      let projectId;

      if (editing) {
        const response = await projectsAPI.update(project.id, metadata);
        savedProject = response.data?.project;
        projectId = project.id;
      } else {
        // Create the draft first so files have a project to belong to.
        metadata.append('status', 'draft');
        const response = await projectsAPI.create(metadata);
        savedProject = response.data?.project;
        projectId = savedProject?.id ?? response.data?.projectId;
        if (!projectId) throw new Error('The project was created but no id was returned');
      }

      await uploadSelectedFiles(projectId);

      // Publication is a separate transition so the backend can verify the
      // files that were just uploaded.
      if (targetStatus !== 'draft' && targetStatus !== currentStatus) {
        const response = await projectsAPI.updateStatus(projectId, targetStatus);
        savedProject = response.data?.project || savedProject;
      }

      toast.success(
        targetStatus === 'draft'
          ? 'Draft saved'
          : targetStatus === 'pending_review'
            ? 'Submitted for review'
            : editing
              ? 'Project updated'
              : 'Project published'
      );

      onSaved?.(savedProject);
    } catch (error) {
      const serverErrors = error.response?.data?.errors;
      const list = Array.isArray(serverErrors) && serverErrors.length > 0
        ? serverErrors.map((entry) => entry.msg || entry.message || String(entry))
        : [error.response?.data?.message || error.message || 'Failed to save project'];

      setErrors(list);
      toast.error(list[0]);
    } finally {
      setSaving(false);
      setUploadStatus(null);
    }
  };

  const canSaveDraft = !editing || ['draft', 'pending_review', 'archived'].includes(currentStatus);
  const canSubmit = currentStatus !== 'archived';
  const canPublish = true;
  const canArchive = editing && currentStatus === 'published';

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-5">
          <div>
            <label className="admin-label" htmlFor="wizard-title">Project title<span className="text-admin-pending"> *</span></label>
            <input
              id="wizard-title"
              className="admin-input"
              value={form.title}
              onChange={(event) => set('title', event.target.value)}
              placeholder="e.g. Smart Attendance System Using RFID"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="admin-label" htmlFor="wizard-course">Course / department<span className="text-admin-pending"> *</span></label>
              <select
                id="wizard-course"
                className="admin-input"
                value={form.course}
                onChange={(event) => set('course', event.target.value)}
              >
                <option value="">Select course</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-label" htmlFor="wizard-level">Academic level<span className="text-admin-pending"> *</span></label>
              <select
                id="wizard-level"
                className="admin-input"
                value={form.level}
                onChange={(event) => set('level', event.target.value)}
              >
                <option value="">Select level</option>
                {LEVELS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="admin-label" htmlFor="wizard-institution">Institution (optional)</label>
            <input
              id="wizard-institution"
              className="admin-input"
              value={form.institution}
              onChange={(event) => set('institution', event.target.value)}
              placeholder="e.g. Federal Polytechnic, Kano"
            />
          </div>

          <div>
            <label className="admin-label" htmlFor="wizard-description">Description<span className="text-admin-pending"> *</span></label>
            <textarea
              id="wizard-description"
              className="admin-input"
              rows="5"
              value={form.description}
              onChange={(event) => set('description', event.target.value)}
              placeholder="What the project covers, what the student receives, and who it suits."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="admin-label" htmlFor="wizard-price">Documentation price (₦)<span className="text-admin-pending"> *</span></label>
              <input
                id="wizard-price"
                type="number"
                min="0.01"
                step="0.01"
                className="admin-input"
                value={form.price}
                onChange={(event) => set('price', event.target.value)}
              />
              <p className="text-xs text-admin-muted mt-1">
                If software is included, this is the price for documentation and software together.
              </p>
            </div>
            <FileUpload
              label="Project cover image (optional)"
              accept=".jpg,.jpeg,.png,.webp"
              value={form.thumbnail}
              onChange={(file) => set('thumbnail', file)}
              previewType="image"
              recommendedSize="1200 × 630px"
            />
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-5">
          <div className="rounded-xl border border-admin-border bg-admin-bg p-4 text-sm text-admin-muted">
            <p className="flex items-center gap-2 font-semibold text-admin-text">
              <Info size={16} /> PDF or DOCX, up to 25 MB
            </p>
            <p className="mt-1">
              The file is stored privately in object storage. Only its metadata and storage key are kept in the database,
              and customers can only download it after a completed purchase.
            </p>
          </div>

          {existingDocumentation && (
            <div className="rounded-xl border border-admin-success/30 bg-admin-success/5 p-4">
              <p className="text-sm font-semibold text-admin-text">Current documentation</p>
              <p className="text-sm text-admin-muted mt-1">
                {existingDocumentation.originalName || existingDocumentation.fileName}
                {existingDocumentation.fileSize ? ` · ${formatSize(existingDocumentation.fileSize)}` : ''}
              </p>
              <p className="text-xs text-admin-muted mt-1">
                Uploading a new file replaces it. The previous file is kept for customers who already bought it.
              </p>
            </div>
          )}

          <FileUpload
            label={existingDocumentation ? 'Replacement documentation' : 'Project documentation'}
            accept=".pdf,.doc,.docx"
            value={form.documentationFile}
            onChange={(file) => set('documentationFile', file)}
            previewType="file"
          />

          {!existingDocumentation && !form.documentationFile && (
            <p className="text-sm text-admin-pending">
              You can save a draft without a document, but it cannot be submitted or published until one is uploaded.
            </p>
          )}
        </div>
      );
    }

    if (step === 3) {
      const hasSoftware = form.hasSoftware === 'yes';

      return (
        <div className="space-y-5">
          <fieldset>
            <legend className="admin-label mb-2">Does this project have accompanying software?</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer ${hasSoftware ? 'border-admin-blue bg-admin-blue/5' : 'border-admin-border'}`}>
                <input
                  type="radio"
                  name="hasSoftware"
                  value="yes"
                  checked={hasSoftware}
                  onChange={() => set('hasSoftware', 'yes')}
                  className="mt-1"
                />
                <span>
                  <span className="block font-semibold text-admin-text">Yes, this project has software</span>
                  <span className="block text-sm text-admin-muted">Add the installer, details and licence terms.</span>
                </span>
              </label>
              <label className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer ${!hasSoftware ? 'border-admin-blue bg-admin-blue/5' : 'border-admin-border'}`}>
                <input
                  type="radio"
                  name="hasSoftware"
                  value="no"
                  checked={!hasSoftware}
                  onChange={() => set('hasSoftware', 'no')}
                  className="mt-1"
                />
                <span>
                  <span className="block font-semibold text-admin-text">No, documentation only</span>
                  <span className="block text-sm text-admin-muted">Save now and add software later by editing the project.</span>
                </span>
              </label>
            </div>
          </fieldset>

          {!hasSoftware && editing && project?.hasSoftware && (
            <div className="rounded-xl border border-admin-pending/40 bg-admin-pending/5 p-4 text-sm text-admin-muted">
              <p className="font-semibold text-admin-text">Software will be archived when you save</p>
              <p className="mt-1">
                The documentation stays published, the installer and guide are kept for customers who already bought them,
                and you can re-enable the software at any time by editing this project.
              </p>
            </div>
          )}

          {hasSoftware && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label" htmlFor="software-name">Software name<span className="text-admin-pending"> *</span></label>
                  <input
                    id="software-name"
                    className="admin-input"
                    value={form.softwareName}
                    onChange={(event) => set('softwareName', event.target.value)}
                  />
                </div>
                <div>
                  <label className="admin-label" htmlFor="software-version">Version</label>
                  <input
                    id="software-version"
                    className="admin-input"
                    value={form.softwareVersion}
                    onChange={(event) => set('softwareVersion', event.target.value)}
                    placeholder="e.g. 1.2.0"
                  />
                </div>
              </div>

              <div>
                <label className="admin-label" htmlFor="software-description">Software description</label>
                <textarea
                  id="software-description"
                  className="admin-input"
                  rows="3"
                  value={form.softwareDescription}
                  onChange={(event) => set('softwareDescription', event.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label" htmlFor="software-os">Supported operating system</label>
                  <input
                    id="software-os"
                    className="admin-input"
                    value={form.softwareOperatingSystem}
                    onChange={(event) => set('softwareOperatingSystem', event.target.value)}
                    placeholder="e.g. Windows 10/11, Ubuntu 22.04"
                  />
                </div>
                <div>
                  <label className="admin-label" htmlFor="software-requirements">System requirements</label>
                  <textarea
                    id="software-requirements"
                    className="admin-input"
                    rows="2"
                    value={form.softwareRequirements}
                    onChange={(event) => set('softwareRequirements', event.target.value)}
                    placeholder="e.g. 4 GB RAM, 2 GB free disk"
                  />
                </div>
              </div>

              <fieldset>
                <legend className="admin-label mb-2">How is the software sold?</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className={`rounded-xl border p-4 cursor-pointer ${form.softwareSaleMode === 'included' ? 'border-admin-blue bg-admin-blue/5' : 'border-admin-border'}`}>
                    <span className="flex items-center gap-2 font-semibold text-admin-text">
                      <input
                        type="radio"
                        name="softwareSaleMode"
                        value="included"
                        checked={form.softwareSaleMode === 'included'}
                        onChange={() => set('softwareSaleMode', 'included')}
                      />
                      Included with the documentation
                    </span>
                    <span className="block text-sm text-admin-muted mt-1">
                      One purchase unlocks both. No separate software price.
                    </span>
                  </label>
                  <label className={`rounded-xl border p-4 cursor-pointer ${form.softwareSaleMode === 'separate' ? 'border-admin-blue bg-admin-blue/5' : 'border-admin-border'}`}>
                    <span className="flex items-center gap-2 font-semibold text-admin-text">
                      <input
                        type="radio"
                        name="softwareSaleMode"
                        value="separate"
                        checked={form.softwareSaleMode === 'separate'}
                        onChange={() => set('softwareSaleMode', 'separate')}
                      />
                      Sold separately
                    </span>
                    <span className="block text-sm text-admin-muted mt-1">
                      Customers get separate documentation and software options.
                    </span>
                  </label>
                </div>
              </fieldset>

              {form.softwareSaleMode === 'separate' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="admin-label" htmlFor="software-price">Software price (₦)<span className="text-admin-pending"> *</span></label>
                    <input
                      id="software-price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="admin-input"
                      value={form.softwarePrice}
                      onChange={(event) => set('softwarePrice', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="admin-label" htmlFor="full-price">Bundle price (₦, optional)</label>
                    <input
                      id="full-price"
                      type="number"
                      min="0"
                      step="0.01"
                      className="admin-input"
                      value={form.fullProjectPrice}
                      onChange={(event) => set('fullProjectPrice', event.target.value)}
                    />
                    <p className="text-xs text-admin-muted mt-1">Documentation + software bought together.</p>
                  </div>
                </div>
              )}

              <div>
                <label className="admin-label" htmlFor="software-license">Software licence</label>
                <textarea
                  id="software-license"
                  className="admin-input"
                  rows="2"
                  value={form.softwareLicense}
                  onChange={(event) => set('softwareLicense', event.target.value)}
                  placeholder="Licence terms shown to customers."
                />
              </div>

              <div>
                <span className="admin-label">Redistribution permission<span className="text-admin-pending"> *</span></span>
                <div className="flex flex-wrap gap-4 mt-1">
                  <label className="inline-flex items-center gap-2 text-sm text-admin-text">
                    <input
                      type="radio"
                      name="redistribution"
                      value="no"
                      checked={form.softwareRedistributionAllowed === 'no'}
                      onChange={() => set('softwareRedistributionAllowed', 'no')}
                    />
                    Buyer may not redistribute
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-admin-text">
                    <input
                      type="radio"
                      name="redistribution"
                      value="yes"
                      checked={form.softwareRedistributionAllowed === 'yes'}
                      onChange={() => set('softwareRedistributionAllowed', 'yes')}
                    />
                    Redistribution permitted
                  </label>
                </div>
              </div>

              {existingInstaller && (
                <div className="rounded-xl border border-admin-success/30 bg-admin-success/5 p-4 text-sm">
                  <p className="font-semibold text-admin-text">Current installer</p>
                  <p className="text-admin-muted mt-1">
                    {existingInstaller.originalName || existingInstaller.fileName}
                    {existingInstaller.fileSize ? ` · ${formatSize(existingInstaller.fileSize)}` : ''}
                  </p>
                  <p className="text-xs text-admin-muted mt-1">Uploading a new installer replaces it; the old file is retained.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUpload
                  label={existingInstaller ? 'Replacement installer (ZIP / RAR)' : 'Software installer (ZIP / RAR)'}
                  accept=".zip,.rar"
                  value={form.softwareInstaller}
                  onChange={(file) => set('softwareInstaller', file)}
                  previewType="file"
                />
                <FileUpload
                  label={existingGuide ? 'Replacement user guide (optional)' : 'User guide (optional)'}
                  accept=".pdf,.doc,.docx"
                  value={form.softwareGuide}
                  onChange={(file) => set('softwareGuide', file)}
                  previewType="file"
                />
              </div>
            </>
          )}
        </div>
      );
    }

    const reviewRows = [
      ['Title', form.title || '—'],
      ['Course / department', courseName || '—'],
      ['Academic level', form.level || '—'],
      ['Institution', form.institution || '—'],
      ['Documentation price', form.price ? `₦${parseFloat(form.price).toFixed(2)}` : '—'],
      ['Documentation', form.documentationFile?.name || existingDocumentation?.originalName || 'Not uploaded'],
      ['Software', form.hasSoftware === 'yes' ? form.softwareName || 'Not named' : 'Documentation only']
    ];

    return (
      <div className="space-y-5">
        <div className="overflow-hidden rounded-xl border border-admin-border">
          <table className="admin-table">
            <tbody>
              {reviewRows.map(([label, value]) => (
                <tr key={label}>
                  <th scope="row" className="w-52 text-left">{label}</th>
                  <td className="text-admin-text">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {form.hasSoftware === 'yes' && (
          <div className="rounded-xl border border-admin-border p-4 space-y-2">
            <h3 className="font-semibold text-admin-text flex items-center gap-2"><Package size={16} /> Software</h3>
            <p className="text-sm text-admin-muted">
              {form.softwareName} {form.softwareVersion ? `v${form.softwareVersion}` : ''} —{' '}
              {form.softwareSaleMode === 'included'
                ? `included with the documentation (₦${parseFloat(form.price || 0).toFixed(2)})`
                : `sold separately (₦${parseFloat(form.softwarePrice || 0).toFixed(2)})`}
            </p>
            <p className="text-sm text-admin-muted">
              Installer: {form.softwareInstaller?.name || existingInstaller?.originalName || 'Not uploaded'}
            </p>
            <p className="text-sm text-admin-muted">
              Redistribution: {form.softwareRedistributionAllowed === 'yes' ? 'permitted' : 'not permitted'}
            </p>
          </div>
        )}

        <div className="rounded-xl border border-admin-border p-4 text-sm text-admin-muted">
          <p className="font-semibold text-admin-text">What happens next</p>
          <p className="mt-1">
            Drafts and resources in review are hidden from customers. Publishing makes the project visible in the
            catalogue immediately. Archiving removes it from sale while keeping existing orders and downloads intact.
          </p>
        </div>

        {uploadStatus && (
          <UploadProgress
            label={uploadStatus.label}
            percent={uploadStatus.percent}
            className="mt-2"
          />
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          {canSaveDraft && (
            <button type="button" onClick={() => save('draft')} disabled={saving} className="admin-btn-ghost">
              <Save size={16} /> Save as Draft
            </button>
          )}
          {canSubmit && (
            <button type="button" onClick={() => save('pending_review')} disabled={saving} className="admin-btn-ghost">
              <Send size={16} /> Submit for Review
            </button>
          )}
          {canPublish && (
            <button type="button" onClick={() => save('published')} disabled={saving} className="admin-btn">
              <Check size={16} /> {editing && currentStatus === 'published' ? 'Publish Changes' : 'Publish'}
            </button>
          )}
          {canArchive && (
            <button
              type="button"
              onClick={() => save('archived')}
              disabled={saving}
              className="admin-btn-ghost text-admin-pending"
            >
              <Archive size={16} /> Archive
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-admin-border bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-admin-border p-6">
          <div>
            <h2 className="text-xl font-bold text-admin-text">
              {editing ? 'Edit Project' : 'Add New Project'}
            </h2>
            <p className="mt-1 text-sm text-admin-muted">
              Documentation is always included; software is optional.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-admin-muted hover:bg-admin-bg" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-admin-border px-6 py-4">
          <ol className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {STEPS.map((entry) => {
              const Icon = entry.icon;
              const active = entry.id === step;
              const done = entry.id < step;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => entry.id < step && setStep(entry.id)}
                    className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm ${
                      active
                        ? 'border-admin-blue bg-admin-blue/5 text-admin-blue'
                        : done
                          ? 'border-admin-success/40 bg-admin-success/5 text-admin-success'
                          : 'border-admin-border text-admin-muted'
                    }`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/70">
                      {done ? <Check size={14} /> : <Icon size={14} />}
                    </span>
                    <span className="font-medium">{entry.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {errors.length > 0 && (
            <div className="mb-5 rounded-xl border border-admin-pending/40 bg-admin-pending/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-admin-pending">
                <AlertCircle size={16} /> Please fix the following
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-admin-text">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {renderStep()}
        </div>

        <div className="flex items-center justify-between border-t border-admin-border p-6">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(current - 1, 1))}
            disabled={step === 1 || saving}
            className="admin-btn-ghost disabled:opacity-40"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-3">
            {step < 4 && (
              <button type="button" onClick={goNext} className="admin-btn">
                Continue <ArrowRight size={16} />
              </button>
            )}
            {step === 4 && (
              <button type="button" onClick={onClose} className="admin-btn-ghost">
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectWizard;
