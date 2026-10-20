import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, CheckCircle } from 'lucide-react';
import logo from '../../assets/logo.png';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register(formData.name, formData.email, formData.password);
    
    if (result.success) {
      // No auto-login: the user must confirm their email first
      navigate('/verify-email?sent=1', {
        state: { email: formData.email, devUrl: result.verificationUrl }
      });
      return;
    }
    
    setLoading(false);
  };

  const isFormValid = 
    formData.name.trim() !== '' && 
    formData.email.trim() !== '' && 
    formData.password.trim() !== '' && 
    formData.confirmPassword.trim() !== '' &&
    formData.password === formData.confirmPassword &&
    formData.password.length >= 6;

  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-green/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src={logo} 
              alt="ProjectAid Logo" 
              className="h-16 md:h-20 w-auto object-contain"
              onError={(e) => {
                console.error('Logo failed to load');
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-blue mb-2">
            Create your account
          </h1>
          <p className="text-gray-600 text-base">
            Join ProjectAid and access professional final year projects
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`block w-full pl-12 pr-12 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all ${
                    formData.password.length > 0 && formData.password.length < 6
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formData.password.length > 0 && formData.password.length < 6 && (
                <p className="mt-1 text-xs text-red-600">Password must be at least 6 characters</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`block w-full pl-12 pr-12 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all ${
                    formData.confirmPassword.length > 0 && !passwordsMatch
                      ? 'border-red-300'
                      : passwordsMatch
                      ? 'border-green-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
                  {passwordsMatch && (
                    <CheckCircle className="h-5 w-5 text-primary-green" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {formData.confirmPassword.length > 0 && !passwordsMatch && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full flex items-center justify-center gap-2 bg-primary-blue hover:bg-primary-blue-light text-white font-semibold py-3.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-blue mt-6"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-semibold text-primary-blue hover:text-primary-blue-light transition-colors inline-flex items-center gap-1"
              >
                Sign in
                <span className="text-primary-green">→</span>
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Register;
