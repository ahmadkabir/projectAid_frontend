import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectsAPI, ordersAPI, supportAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import AnimatedHeroSection from '../../components/common/AnimatedHeroSection';
import TableOfContents from '../../components/common/TableOfContents';
import { allowsSoftwareProjects } from '../../utils/courseValidation';
import toast from 'react-hot-toast';
import {
  FileText,
  Code,
  Package,
  CheckCircle,
  Download,
  Lock,
  MessageSquare,
  ArrowLeft,
  Target,
  List,
  BookOpen
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [supportData, setSupportData] = useState({
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchProject();
    if (user) {
      fetchUserOrders();
    }
  }, [id, user]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getById(id);
      setProject(response.data.project);
    } catch (error) {
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
      // Check if user has purchased this project
      const purchasedItems = orders
        .filter(order => order.status === 'completed')
        .flatMap(order => order.items || [])
        .filter(item => item.projectId === parseInt(id));
      setUserOrders(purchasedItems);
    } catch (error) {
      console.error('Failed to fetch user orders');
    }
  };

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

    try {
      const orderData = {
        items: [{ projectId: parseInt(id), itemType: selectedType }]
      };

      const response = await ordersAPI.create(orderData);
      const orderId = response.data.order.id;

      // Process mock payment
      await ordersAPI.processPayment(orderId, {
        paymentMethod: 'mock_payment',
        transactionId: `TXN-${Date.now()}`
      });

      toast.success('Purchase successful! Check your dashboard for downloads.');
      await fetchUserOrders(); // Refresh orders
      setSelectedType(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    }
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit support request');
      return;
    }

    try {
      await supportAPI.create({
        projectId: parseInt(id),
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

  const downloadFile = (filename, type, isDirectPath = false) => {
    if (!filename) return;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
    const normalized = filename.startsWith('/') ? filename.slice(1) : filename;
    const url = isDirectPath ? `${baseUrl}/${normalized}` : `${baseUrl}/uploads/${type}/${filename}`;
    window.open(url, '_blank');
  };

  const hasPurchased = (type) => {
    if (!user || userOrders.length === 0) return false;
    return userOrders.some(item => {
      if (type === 'documentation') {
        return item.itemType === 'documentation' || item.itemType === 'full';
      } else if (type === 'software') {
        return item.itemType === 'software' || item.itemType === 'full';
      }
      return item.itemType === type;
    });
  };

  const getPrice = (type) => {
    if (type === 'documentation') return project.documentationPrice;
    if (type === 'software') return project.softwarePrice;
    if (type === 'full') return project.fullProjectPrice;
    return 0;
  };

  const getProjectType = () => {
    const types = [];
    if (project.documentationPrice > 0) types.push('Documentation');
    if (allowsSoftware && project.softwarePrice > 0) types.push('Software');
    if (allowsSoftware && project.fullProjectPrice > 0) types.push('Full Project');
    return types;
  };

  if (loading) return <Loading />;
  if (!project) return null;

  const allowsSoftware = project.category ? allowsSoftwareProjects(project.category.name) : false;
  const projectType = project.projectType || 'documentation';
  const documentFiles = project.documentFiles || [];

  const imageUrl = project.thumbnail
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/uploads/thumbnails/${project.thumbnail}`
    : null;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Back Button */}
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Hero Header - Animated */}
            <AnimatedHeroSection
              project={project}
              imageUrl={imageUrl}
              showAvailability={true}
              showPrice={true}
            />

            {/* Project Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="text-primary-blue" size={24} />
                <h2 className="text-2xl font-bold text-primary-blue">Project Summary</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {project.summary || project.description}
              </p>
            </div>

            {/* Table of Contents - Show for documentation projects */}
            {projectType === 'documentation' && (
              <TableOfContents collapsible={true} defaultExpanded={true} />
            )}

            {/* Project Objective */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="text-primary-blue" size={24} />
                <h2 className="text-2xl font-bold text-primary-blue">Project Objective</h2>
              </div>
              <div className="space-y-3">
                {project.objective ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {project.objective}
                  </p>
                ) : (
                  <>
                    <p className="text-gray-700 leading-relaxed">
                      This project aims to provide a comprehensive solution for {project.category?.name?.toLowerCase()} needs, 
                      {allowsSoftware 
                        ? ' delivering professional-grade implementation with complete documentation and source code.'
                        : ' delivering comprehensive documentation and technical analysis suitable for final year project submission.'
                      }
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Provide a complete, production-ready {allowsSoftware ? 'solution' : 'documentation package'}</li>
                      <li>Include comprehensive documentation for easy understanding</li>
                      {allowsSoftware && <li>Offer well-commented source code for learning and customization</li>}
                      <li>Ensure {allowsSoftware ? 'scalability and maintainability' : 'academic rigor and professional presentation'}</li>
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Project Features / Analysis */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <List className="text-primary-blue" size={24} />
                <h2 className="text-2xl font-bold text-primary-blue">Key Features & Technologies</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-primary-blue mb-2">Core Features</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="text-primary-green" size={16} />
                      <span>Modern architecture and design patterns</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="text-primary-green" size={16} />
                      <span>Responsive and user-friendly interface</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="text-primary-green" size={16} />
                      <span>Secure and optimized implementation</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="text-primary-green" size={16} />
                      <span>Well-structured codebase</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-primary-blue mb-2">Technology Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.category?.name === 'Web Development' && (
                      <>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">React</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">Node.js</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">MongoDB</span>
                      </>
                    )}
                    {project.category?.name === 'Mobile Development' && (
                      <>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">React Native</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">Firebase</span>
                      </>
                    )}
                    {project.category?.name === 'Data Science' && (
                      <>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">Python</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">TensorFlow</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">Pandas</span>
                      </>
                    )}
                    {project.category?.name === 'Desktop Applications' && (
                      <>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">Java</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">JavaFX</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Deliverables / What You Will Get */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Package className="text-primary-blue" size={24} />
                <h2 className="text-2xl font-bold text-primary-blue">What You Will Get</h2>
              </div>
              <div className="space-y-4">
                {project.documentationPrice > 0 && (
                  <div className={`p-4 rounded-lg border-2 ${
                    hasPurchased('documentation') 
                      ? 'border-primary-green bg-primary-green/5' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          hasPurchased('documentation') 
                            ? 'bg-primary-green/20' 
                            : 'bg-gray-200'
                        }`}>
                          <FileText className={hasPurchased('documentation') ? 'text-primary-green' : 'text-gray-500'} size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary-blue">Project Documentation</h3>
                          <p className="text-sm text-gray-600">Complete PDF documentation including requirements, design, and implementation details</p>
                        </div>
                      </div>
                      {hasPurchased('documentation') && (project.documentationFile || documentFiles.length > 0) ? (
                        <div className="flex flex-col gap-2">
                          {project.documentationFile && (
                            <button
                              onClick={() => downloadFile(project.documentationFile, 'documentation')}
                              className="inline-flex items-center space-x-2 bg-primary-green hover:bg-primary-green/90 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                            >
                              <Download size={18} />
                              <span>Download</span>
                            </button>
                          )}
                          {documentFiles.map((file) => (
                            <button
                              key={file.id}
                              onClick={() => downloadFile(file.filePath, null, true)}
                              className="inline-flex items-center space-x-2 bg-primary-blue hover:bg-primary-green text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                            >
                              <Download size={18} />
                              <span>{file.fileType?.toUpperCase() || 'DOC'}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Lock size={20} />
                          <span className="text-sm">Locked</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {allowsSoftware && project.softwarePrice > 0 && (
                  <div className={`p-4 rounded-lg border-2 ${
                    hasPurchased('software') 
                      ? 'border-primary-green bg-primary-green/5' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          hasPurchased('software') 
                            ? 'bg-primary-green/20' 
                            : 'bg-gray-200'
                        }`}>
                          <Code className={hasPurchased('software') ? 'text-primary-green' : 'text-gray-500'} size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary-blue">Source Code</h3>
                          <p className="text-sm text-gray-600">Complete source code files, database schemas, and configuration files</p>
                        </div>
                      </div>
                      {hasPurchased('software') && project.softwareFile ? (
                        <button
                          onClick={() => downloadFile(project.softwareFile, 'software')}
                          className="inline-flex items-center space-x-2 bg-primary-green hover:bg-primary-green/90 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          <Download size={18} />
                          <span>Download</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Lock size={20} />
                          <span className="text-sm">Locked</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {allowsSoftware && project.fullProjectPrice > 0 && (
                  <div className={`p-4 rounded-lg border-2 ${
                    hasPurchased('full') 
                      ? 'border-primary-green bg-primary-green/5' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          hasPurchased('full') 
                            ? 'bg-primary-green/20' 
                            : 'bg-gray-200'
                        }`}>
                          <Package className={hasPurchased('full') ? 'text-primary-green' : 'text-gray-500'} size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary-blue">Full Project Package</h3>
                          <p className="text-sm text-gray-600">Everything included: documentation, source code, and all project files</p>
                        </div>
                      </div>
                      {hasPurchased('full') ? (
                        <div className="flex flex-col gap-2">
                          {project.documentationFile && (
                            <button
                              onClick={() => downloadFile(project.documentationFile, 'documentation')}
                              className="inline-flex items-center space-x-2 bg-primary-green hover:bg-primary-green/90 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
                            >
                              <Download size={16} />
                              <span>Docs</span>
                            </button>
                          )}
                          {documentFiles.map((file) => (
                            <button
                              key={file.id}
                              onClick={() => downloadFile(file.filePath, null, true)}
                              className="inline-flex items-center space-x-2 bg-primary-blue hover:bg-primary-blue-light text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
                            >
                              <Download size={16} />
                              <span>{file.fileType?.toUpperCase()}</span>
                            </button>
                          ))}
                          {project.softwareFile && (
                            <button
                              onClick={() => downloadFile(project.softwareFile, 'software')}
                              className="inline-flex items-center space-x-2 bg-primary-blue hover:bg-primary-blue-light text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
                            >
                              <Download size={16} />
                              <span>Code</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Lock size={20} />
                          <span className="text-sm">Locked</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Support Section */}
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

          {/* Sidebar - Purchase Options */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6 text-primary-blue">Purchase Options</h2>
              
              <div className="space-y-4 mb-6">
                {project.documentationPrice > 0 && (
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedType === 'documentation'
                      ? 'border-primary-green bg-primary-green/5'
                      : 'border-gray-200 hover:border-primary-blue'
                  }`}>
                    <input
                      type="radio"
                      name="purchaseType"
                      value="documentation"
                      checked={selectedType === 'documentation'}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-primary-blue">Documentation Only</div>
                      <div className="text-primary-green font-bold text-lg">₦{parseFloat(project.documentationPrice).toFixed(2)}</div>
                    </div>
                  </label>
                )}

                {allowsSoftware && project.softwarePrice > 0 && (
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedType === 'software'
                      ? 'border-primary-green bg-primary-green/5'
                      : 'border-gray-200 hover:border-primary-blue'
                  }`}>
                    <input
                      type="radio"
                      name="purchaseType"
                      value="software"
                      checked={selectedType === 'software'}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-primary-blue">Software Only</div>
                      <div className="text-primary-green font-bold text-lg">₦{parseFloat(project.softwarePrice).toFixed(2)}</div>
                    </div>
                  </label>
                )}

                {allowsSoftware && project.fullProjectPrice > 0 && (
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedType === 'full'
                      ? 'border-primary-green bg-primary-green/5'
                      : 'border-gray-200 hover:border-primary-blue'
                  }`}>
                    <input
                      type="radio"
                      name="purchaseType"
                      value="full"
                      checked={selectedType === 'full'}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-primary-blue">Full Project</div>
                      <div className="text-primary-green font-bold text-lg">₦{parseFloat(project.fullProjectPrice).toFixed(2)}</div>
                      <div className="text-xs text-gray-500 mt-1">Best Value</div>
                    </div>
                  </label>
                )}
              </div>

              {user ? (
                <button
                  onClick={handlePurchase}
                  disabled={!selectedType}
                  className="w-full bg-primary-green hover:bg-primary-green/90 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Package size={20} />
                  <span>Purchase Now</span>
                </button>
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

      {/* Support Modal */}
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
                  onChange={(e) => setSupportData({ ...supportData, subject: e.target.value })}
                  className="input-field"
                  required
                  placeholder="What do you need help with?"
                />
              </div>
              <div className="mb-4">
                <label className="label">Message</label>
                <textarea
                  value={supportData.message}
                  onChange={(e) => setSupportData({ ...supportData, message: e.target.value })}
                  className="input-field"
                  rows="5"
                  required
                  placeholder="Describe your issue or question..."
                />
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="btn-primary flex-1">
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowSupportModal(false)}
                  className="btn-outline flex-1"
                >
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
