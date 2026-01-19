import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="inline-block mb-4 hover:opacity-90 transition-opacity">
              <img 
                src={logo} 
                alt="ProjectAid Logo" 
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  console.error('Logo failed to load');
                  e.target.style.display = 'none';
                }}
              />
            </Link>
            <p className="text-gray-400 text-sm max-w-md">
              Your trusted platform for final year project support and resources. 
              Empowering students with complete projects, documentation, and expert support.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold mb-4 text-white uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/projects" className="text-gray-400 hover:text-primary-green transition-colors text-sm">
                  Browse Projects
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-primary-green transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/support" className="text-gray-400 hover:text-primary-green transition-colors text-sm">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold mb-4 text-white uppercase tracking-wide">Contact</h3>
            <p className="text-gray-400 text-sm mb-2">
              Email: <a href="mailto:atomakabir001@gmail.com" className="hover:text-primary-green transition-colors">
                atomakabir001@gmail.com
              </a>
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            &copy; 2024 ProjectAid. All rights reserved. • Empowering Student Success
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
