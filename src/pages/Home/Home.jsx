import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectsAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import AnimatedProjectCard from '../../components/common/AnimatedProjectCard';
import {
  BookOpen,
  Code,
  FileText,
  Shield,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Users,
  Search,
  Filter
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: '',
    projectType: ''
  });

  useEffect(() => {
    fetchFeaturedProjects();
    fetchCategories();
  }, []);

  const fetchFeaturedProjects = async () => {
    try {
      // Fetch active projects - backend handles filtering
      const response = await projectsAPI.getAll({ status: 'active' });
      const projects = response.data.projects || [];
      // Get first 6 projects as featured
      setFeaturedProjects(projects.slice(0, 6));
    } catch (error) {
      console.error('Failed to load projects');
      setFeaturedProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await projectsAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };


  const handleFindProjects = () => {
    const params = new URLSearchParams();
    if (filters.department) {
      params.append('category', filters.department);
    }
    // Send projectType filter - backend will handle strict filtering
    if (filters.projectType) {
      params.append('type', filters.projectType.toLowerCase());
    }
    navigate(`/projects?${params.toString()}`);
  };

  if (loading) return <Loading />;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-blue via-primary-blue-light to-primary-blue overflow-hidden -mt-24 md:-mt-28 pt-24 md:pt-28">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-green rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-teal rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="text-primary-green" size={20} />
              <span className="text-white text-sm font-medium">Empowering Student Success</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Complete Final Year Projects
              <br />
              <span className="text-primary-green">with Documentation & Source Code</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-3xl mx-auto">
              Get professionally developed projects with complete documentation, 
              well-commented source code, and expert support for your final year.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/projects"
                className="group bg-primary-green hover:bg-primary-green/90 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center space-x-2"
              >
                <span>Browse Projects</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link
                to="/projects"
                className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-lg text-lg transition-all border-2 border-white/30 hover:border-white/50 flex items-center space-x-2"
              >
                <span>View Sample Projects</span>
                <Zap className="group-hover:rotate-12 transition-transform" size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Project Filter Section */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
            <div className="flex items-center space-x-2 mb-6">
              <Filter className="text-primary-blue" size={24} />
              <h2 className="text-2xl font-bold text-primary-blue">Find Your Perfect Project</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Filter projects by course/department and project type to find exactly what you need
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Department Dropdown */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course / Department
                </label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none transition-all bg-white text-gray-700 font-medium"
                >
                  <option value="">Select Course</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Type Dropdown */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Type
                </label>
                <select
                  value={filters.projectType}
                  onChange={(e) => setFilters({ ...filters, projectType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none transition-all bg-white text-gray-700 font-medium"
                >
                  <option value="">Select Project Type</option>
                  <option value="documentation">Documentation Only</option>
                  <option value="software">Software Only</option>
                  <option value="full">Full Project</option>
                </select>
              </div>

              {/* Find Projects Button */}
              <div className="flex items-end">
                <button
                  onClick={handleFindProjects}
                  className="w-full bg-primary-green hover:bg-primary-green/90 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Search size={20} />
                  <span>Find Projects</span>
                </button>
              </div>
            </div>

            {/* Quick Filter Tags */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Popular searches:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setFilters({ department: '', projectType: 'full' });
                    setTimeout(() => handleFindProjects(), 100);
                  }}
                  className="px-4 py-2 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-medium hover:bg-primary-blue/20 transition-colors"
                >
                  Full Projects
                </button>
                <button
                  onClick={() => {
                    setFilters({ department: '', projectType: 'documentation' });
                    setTimeout(() => handleFindProjects(), 100);
                  }}
                  className="px-4 py-2 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-medium hover:bg-primary-blue/20 transition-colors"
                >
                  Documentation Only
                </button>
                <button
                  onClick={() => {
                    setFilters({ department: '', projectType: 'software' });
                    setTimeout(() => handleFindProjects(), 100);
                  }}
                  className="px-4 py-2 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-medium hover:bg-primary-blue/20 transition-colors"
                >
                  Software Only
                </button>
                <button
                  onClick={() => {
                    setFilters({ department: '', projectType: '' });
                    navigate('/projects');
                  }}
                  className="px-4 py-2 bg-primary-green/10 text-primary-green rounded-full text-sm font-medium hover:bg-primary-green/20 transition-colors"
                >
                  View All Projects
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Projects Showcase */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary-blue mb-4">
              Featured Projects
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore professionally developed final year projects ready for submission
            </p>
          </div>

          {featuredProjects.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500 text-lg">No projects available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <AnimatedProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/projects"
              className="inline-flex items-center space-x-2 text-primary-blue hover:text-primary-green font-semibold text-lg transition-colors"
            >
              <span>View All Projects</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Project Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary-blue mb-4">
              Browse by Category
            </h2>
            <p className="text-xl text-gray-600">
              Find projects in your area of interest
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/projects?category=${category.id}`}
                  className="group bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-200 hover:border-primary-green hover:shadow-lg transition-all text-center"
                >
                  <div className="w-16 h-16 bg-primary-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-green/20 transition-colors">
                    <Code className="text-primary-blue group-hover:text-primary-green" size={32} />
                  </div>
                  <h3 className="font-bold text-primary-blue group-hover:text-primary-green transition-colors">
                    {category.name}
                  </h3>
                </Link>
              ))
            ) : (
              <>
                <CategoryCard name="Web Applications" icon={Code} />
                <CategoryCard name="AI / ML" icon={Zap} />
                <CategoryCard name="Mobile Apps" icon={Code} />
                <CategoryCard name="Research Projects" icon={FileText} />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose ProjectAid */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary-blue mb-4">
              Why Choose ProjectAid?
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for a successful final year project
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={BookOpen}
              title="Complete Documentation"
              description="Comprehensive project reports, presentations, and technical documentation ready for submission."
              color="bg-primary-blue"
            />
            <FeatureCard
              icon={Code}
              title="Well-Commented Source Code"
              description="Clean, professional source code with detailed comments and documentation for easy understanding."
              color="bg-primary-green"
            />
            <FeatureCard
              icon={Shield}
              title="Expert Support"
              description="Get help with corrections, updates, and technical support from our expert team."
              color="bg-primary-blue-light"
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary-blue mb-4">
              Flexible Pricing Options
            </h2>
            <p className="text-xl text-gray-600">
              Choose what you need, pay for what you use
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Documentation Only"
              description="Complete project documentation including reports and presentations"
              price="Starting at"
              highlight={false}
            />
            <PricingCard
              title="Software Only"
              description="Full source code and software files with documentation"
              price="Starting at"
              highlight={true}
            />
            <PricingCard
              title="Full Project"
              description="Everything included: documentation, source code, and all project files"
              price="Starting at"
              highlight={false}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper Components
const CategoryCard = ({ name, icon: Icon }) => (
  <div className="group bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-200 hover:border-primary-green hover:shadow-lg transition-all text-center">
    <div className="w-16 h-16 bg-primary-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-green/20 transition-colors">
      <Icon className="text-primary-blue group-hover:text-primary-green" size={32} />
    </div>
    <h3 className="font-bold text-primary-blue group-hover:text-primary-green transition-colors">
      {name}
    </h3>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
    <div className={`w-16 h-16 ${color} rounded-xl flex items-center justify-center mb-6`}>
      <Icon className="text-white" size={32} />
    </div>
    <h3 className="text-xl font-bold text-primary-blue mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const PricingCard = ({ title, description, price, highlight }) => (
  <div
    className={`bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border-2 ${
      highlight
        ? 'border-primary-green scale-105'
        : 'border-gray-200 hover:border-primary-blue'
    }`}
  >
    <h3 className="text-2xl font-bold text-primary-blue mb-4">{title}</h3>
    <p className="text-gray-600 mb-6">{description}</p>
    <p className="text-sm text-gray-500 mb-4">{price}</p>
    <Link
      to="/projects"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
        highlight
          ? 'bg-primary-green hover:bg-primary-green/90 text-white'
          : 'bg-primary-blue hover:bg-primary-blue-light text-white'
      }`}
    >
      Start with this
    </Link>
  </div>
);

export default Home;
