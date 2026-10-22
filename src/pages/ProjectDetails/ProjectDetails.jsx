import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectsAPI, ordersAPI, supportAPI, downloadProjectFile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import AnimatedHeroSection from '../../components/common/AnimatedHeroSection';
import toast from 'react-hot-toast';
import {
  FileText,
  Code,
  Package,
  Download,
  Lock,
  Eye,
  MessageSquare,
  ArrowLeft,
  BookOpen,
  Monitor,
  HardDrive,
  ShieldCheck,
  Layers,
  Check
} from 'lucide-react';

const formatPrice = (value) => `₦${parseFloat(value || 0).toFixed(2)}`;

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [supportData, setSupportData] = useState({ subject: '', message: '' });

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!authLoading && user) fetchUserOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, authLoading, user]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getById(id);
      setProject(response.data.project);
    } catch {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const response = await ordersAPI.getUserOrders();
      const orders = response.data.orders || [];
      const purchasedItems = orders
        .filter((order) => order.status === 'completed')
        .flatMap((order) => order.items || [])
        .filter((item) => item.projectId === parseInt(id, 10));
      setUserOrders(purchasedItems);
    } catch {
      // A failed order lookup should not break the public project page.
    }
  };

  const purchaseOptions = project?.purchaseOptions || [];
  const documentationFiles = project?.documentationFiles || [];
  const softwareFiles = project?.softwareFiles || [];
  const guideFiles = project?.guideFiles || [];
  const hasDocumentation = project?.hasDocumentation ?? documentationFiles.length > 0;
  const hasSoftware = Boolean(project?.hasSoftware);
  const softwareIncluded = project?.softwareSaleMode === 'included';

  const ownsCategory = (category) => {
    if (!user || userOrders.length === 0) return false;
    return userOrders.some((item) => {
      if (item.itemType === 'full') return true;
      if (category === 'documentation') return item.itemType === 'documentation';
      if (category === 'software' || category === 'guide') {
        return item.itemType === 'software' || (item.itemType === 'documentation' && softwareIncluded);
      }
      return false;
    });
  };

  // A specific purchase option is unavailable once the student already owns
  // everything it contains; remaining options stay purchasable.
  const ownsOption = (type) => {
    if (!user || userOrders.length === 0) return false;
    if (type === 'full') {
      return ownsCategory('full') || (ownsCategory('documentation') && ownsCategory('software'));
    }
    return ownsCategory(type);
  };

  const availableOptions = purchaseOptions.filter((option) => !ownsOption(option.type));
  const ownsEverything = purchaseOptions.length > 0 && availableOptions.length === 0;

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please login to purchase');
      navigate('/login');
      return;
    }

    if (!selectedType) {
      toast.error('Please select a purchase option');
      return;
    }

    if (ownsOption(selectedType)) {
      toast.error('You already own this option');
      setSelectedType(null);
      await fetchUserOrders();
      return;
    }

    setPurchasing(true);
    try {
      const response = await ordersAPI.create({
        items: [{ projectId: parseInt(id, 10), itemType: selectedType }]
      });
      const orderId = response.data.order.id;

      await ordersAPI.processPayment(orderId, {
        paymentMethod: 'mock_payment',
        transactionId: `TXN-${Date.now()}`
      });

      toast.success('Purchase successful! Check your dashboard for downloads.');
      await fetchUserOrders();
      setSelectedType(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const handleSupportSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.error('Please login to submit support request');
      return;
    }

    try {
      await supportAPI.create({
        projectId: parseInt(id, 10),
        subject: supportData.subject,
        message: supportData.message
      });
      toast.success('Support request submitted successfully');
      setShowSupportModal(false);
      setSupportData({ subject: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit support request');
    }
  };

  if (loading) return <Loading />;
  if (!project) return null;

  const imageUrl = project.thumbnail
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/uploads/thumbnails/${project.thumbnail}`
    : null;

  const selectedOption = purchaseOptions.find((option) => option.type === selectedType);

  const FileButtons = ({ files, category }) => {
    const unlocked = ownsCategory(category);
    if (!unlocked) {
      return (
        <div className="flex items-center space-x-2 text-gray-400">
          <Lock size={20} />
          <span className="text-sm">Locked</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-end gap-2">
        {files.map((file) => (
          <button
            key={file.id}
            onClick={() => downloadProjectFile(file)}
            className="inline-flex items-center space-x-2 bg-primary-green hover:bg-primary-green/90 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Download size={18} />
            <span>{file.fileType?.toUpperCase() || 'FILE'}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/projects"
            className="inline-flex items-center space-x-2 text-primary-blue hover:text-primary-green transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Projects</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <AnimatedHeroSection
              project={project}
              imageUrl={imageUrl}
              showAvailability={true}
              showPrice={true}
            />

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="text-primary-blue" size={24} />
                  <h2 className="text-2xl font-bold text-primary-blue">Project Summary</h2>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                  hasSoftware ? 'bg-primary-blue/10 text-primary-blue' : 'bg-primary-green/10 text-primary-green'
                }`}>
                  {hasSoftware ? <Package size={14} /> : <FileText size={14} />}
                  {hasSoftware ? 'Documentation + Software' : 'Documentation only'}
                </span>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {project.summary || project.description}
              </p>
            </div>

            {hasSoftware && (
              <div className="bg-white rounded-xl shadow-md p-6 border-2 border-primary-blue/20">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Code className="text-primary-blue" size={24} />
                    <h2 className="text-2xl font-bold text-primary-blue">Accompanying Software</h2>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    softwareIncluded
                      ? 'bg-primary-green/10 text-primary-green'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {softwareIncluded ? 'Included with documentation' : 'Sold separately'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                  <div className="space-y-2">
                    <p><span className="text-gray-500">Name:</span> <strong>{project.softwareName || '—'}</strong></p>
                    <p><span className="text-gray-500">Version:</span> {project.softwareVersion || '—'}</p>
                    <p className="flex items-start gap-2">
                      <Monitor size={16} className="mt-1 text-primary-blue" />
                      <span>{project.softwareOperatingSystem || 'Operating system not specified'}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <HardDrive size={16} className="mt-1 text-primary-blue" />
                      <span>{project.softwareRequirements || 'System requirements not specified'}</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    {project.softwareDescription && (
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{project.softwareDescription}</p>
                    )}
                    <p className="text-sm"><span className="text-gray-500">Licence:</span> {project.softwareLicense || 'Not specified'}</p>
                    <p className="flex items-center gap-2 text-sm">
                      <ShieldCheck size={16} className="text-primary-blue" />
                      {project.softwareRedistributionAllowed
                        ? 'Redistribution permitted by the supplier'
                        : 'Redistribution not permitted'}
                    </p>
                    {!softwareIncluded && (
                      <p className="text-primary-green font-bold text-lg">
                        {formatPrice(project.softwarePrice)}
                      </p>
                    )}
                  </div>
                </div>

                {project.softwareSaleMode === 'included' && (
                  <p className="mt-4 rounded-lg bg-primary-green/10 p-3 text-sm text-primary-blue">
                    Buying the documentation includes this software at no extra cost.
                  </p>
                )}
              </div>
            )}

            {!hasSoftware && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="text-primary-blue" size={24} />
                  <h2 className="text-xl font-bold text-primary-blue">Documentation only</h2>
                </div>
                <p className="text-gray-600 text-sm">
                  This project is supplied as written documentation. No software package is included.
                </p>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Package className="text-primary-blue" size={24} />
                <h2 className="text-2xl font-bold text-primary-blue">What You Will Get</h2>
              </div>

              <div className="space-y-4">
                {hasDocumentation && (
                  <div className={`p-4 rounded-lg border-2 ${
                    ownsCategory('documentation') ? 'border-primary-green bg-primary-green/5' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${ownsCategory('documentation') ? 'bg-primary-green/20' : 'bg-gray-200'}`}>
                          <FileText className={ownsCategory('documentation') ? 'text-primary-green' : 'text-gray-500'} size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary-blue">Project Documentation</h3>
                          <p className="text-sm text-gray-600">
                            {documentationFiles.length > 0
                              ? `${documentationFiles.length} file${documentationFiles.length === 1 ? '' : 's'} · PDF/DOCX`
                              : 'Complete written documentation'}
                            {softwareIncluded ? ' · software included' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-2 sm:items-end">
                        <Link
                          to={`/projects/${project.id}/preview`}
                          className="inline-flex items-center space-x-2 border-2 border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          <Eye size={18} />
                          <span>View Doc</span>
                        </Link>
                        {documentationFiles.length > 0 && (
                          <FileButtons files={documentationFiles} category="documentation" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {hasSoftware && softwareFiles.length > 0 && (
                  <div className={`p-4 rounded-lg border-2 ${
                    ownsCategory('software') ? 'border-primary-green bg-primary-green/5' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${ownsCategory('software') ? 'bg-primary-green/20' : 'bg-gray-200'}`}>
                          <Code className={ownsCategory('software') ? 'text-primary-green' : 'text-gray-500'} size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary-blue">Software Package</h3>
                          <p className="text-sm text-gray-600">
                            {project.softwareName}{project.softwareVersion ? ` v${project.softwareVersion}` : ''} · installer
                            {softwareIncluded ? ' included with documentation' : ' sold separately'}
                          </p>
                        </div>
                      </div>
                      <FileButtons files={softwareFiles} category="software" />
                    </div>
                  </div>
                )}

                {hasSoftware && guideFiles.length > 0 && (
                  <div className={`p-4 rounded-lg border-2 ${
                    ownsCategory('guide') ? 'border-primary-green bg-primary-green/5' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${ownsCategory('guide') ? 'bg-primary-green/20' : 'bg-gray-200'}`}>
                          <BookOpen className={ownsCategory('guide') ? 'text-primary-green' : 'text-gray-500'} size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary-blue">User Guide</h3>
                          <p className="text-sm text-gray-600">Setup and usage instructions for the software</p>
                        </div>
                      </div>
                      <FileButtons files={guideFiles} category="guide" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {user && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <MessageSquare className="text-primary-blue" size={24} />
                  <h2 className="text-2xl font-bold text-primary-blue">Need Help?</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Request corrections, updates, or ask questions about this project. Our support team is here to help.
                </p>
                <button
                  onClick={() => setShowSupportModal(true)}
                  className="inline-flex items-center space-x-2 bg-primary-blue hover:bg-primary-blue-light text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <MessageSquare size={20} />
                  <span>Request Support</span>
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6 text-primary-blue">Purchase Options</h2>

              <div className="space-y-4 mb-6">
                {purchaseOptions.length === 0 && (
                  <p className="text-sm text-gray-500">This project is not available for purchase yet.</p>
                )}

                {purchaseOptions.map((option) => {
                  const owned = ownsOption(option.type);

                  return (
                    <label
                      key={option.type}
                      className={`flex items-start p-4 border-2 rounded-lg transition-all ${
                        owned
                          ? 'border-primary-green/40 bg-primary-green/5 cursor-not-allowed'
                          : selectedType === option.type
                            ? 'border-primary-green bg-primary-green/5 cursor-pointer'
                            : 'border-gray-200 hover:border-primary-blue cursor-pointer'
                      }`}
                    >
                      <input
                        type="radio"
                        name="purchaseType"
                        value={option.type}
                        checked={owned || selectedType === option.type}
                        disabled={owned}
                        onChange={(event) => setSelectedType(event.target.value)}
                        className="mr-3 mt-1 disabled:cursor-not-allowed"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-semibold text-primary-blue">
                          {option.type === 'documentation' ? <FileText size={16} /> : option.type === 'software' ? <Code size={16} /> : <Layers size={16} />}
                          <span>{option.label}</span>
                          {owned && (
                            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary-green/15 px-2 py-0.5 text-xs font-bold text-primary-green">
                              <Check size={12} />
                              Purchased
                            </span>
                          )}
                        </div>
                        <div className={`font-bold text-lg ${owned ? 'text-gray-400 line-through' : 'text-primary-green'}`}>
                          {formatPrice(option.price)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {owned ? 'You already own this option.' : option.description}
                        </p>
                        {!owned && option.includesSoftware && option.type !== 'software' && (
                          <p className="text-xs font-semibold text-primary-blue mt-1">Includes the software package</p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {selectedOption && (
                <div className="mb-4 rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700">
                  You are buying <strong>{selectedOption.label}</strong> for{' '}
                  <strong>{formatPrice(selectedOption.price)}</strong>.{' '}
                  {selectedOption.type === 'documentation' && softwareIncluded
                    ? 'The software installer is included.'
                    : selectedOption.type === 'documentation' && hasSoftware
                      ? 'The software is not included and can be bought separately.'
                      : selectedOption.type === 'software'
                        ? 'This purchase does not include the written documentation.'
                        : ''}
                </div>
              )}

              {user ? (
                ownsEverything ? (
                  <div className="rounded-lg border-2 border-primary-green/40 bg-primary-green/10 p-4 text-center">
                    <p className="flex items-center justify-center gap-2 font-semibold text-primary-green">
                      <Check size={20} />
                      You own all available options for this project
                    </p>
                    <Link
                      to="/dashboard/orders"
                      className="mt-2 inline-block text-sm font-medium text-primary-blue hover:underline"
                    >
                      Go to My Orders to download your files
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handlePurchase}
                    disabled={!selectedType || purchasing}
                    className="w-full bg-primary-green hover:bg-primary-green/90 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Package size={20} />
                    <span>{purchasing ? 'Processing...' : 'Purchase Now'}</span>
                  </button>
                )
              ) : (
                <Link
                  to="/login"
                  className="w-full bg-primary-green hover:bg-primary-green/90 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <span>Login to Purchase</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSupportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary-blue">Request Support</h2>
            <form onSubmit={handleSupportSubmit}>
              <div className="mb-4">
                <label className="label">Subject</label>
                <input
                  type="text"
                  value={supportData.subject}
                  onChange={(event) => setSupportData({ ...supportData, subject: event.target.value })}
                  className="input-field"
                  required
                  placeholder="What do you need help with?"
                />
              </div>
              <div className="mb-4">
                <label className="label">Message</label>
                <textarea
                  value={supportData.message}
                  onChange={(event) => setSupportData({ ...supportData, message: event.target.value })}
                  className="input-field"
                  rows="5"
                  required
                  placeholder="Describe your issue or question..."
                />
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="btn-primary flex-1">Submit Request</button>
                <button type="button" onClick={() => setShowSupportModal(false)} className="btn-outline flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
