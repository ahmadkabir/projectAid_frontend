import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { Eye, EyeOff, Mail, Lock, LogIn, MailWarning, Send } from 'lucide-react';
import logo from '../../assets/logo.png';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resending, setResending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleResend = async () => {
    if (!unverifiedEmail || resending) return;
    setResending(true);
    try {
      const res = await authAPI.resendVerification(unverifiedEmail);
      toast.success(res.data?.message || 'Verification email sent.');
      if (res.data?.verificationUrl) {
        // Dev console mode: backend returned the link directly
        window.open(res.data.verificationUrl, '_blank');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success && result.user) {
        // Small delay to ensure state is updated
        setTimeout(() => {
          if (result.user?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }, 200);
      } else if (result.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(result.email || formData.email);
      }
    } catch (error) {
      console.error('Login submission error:', error);
      // Error is already handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.email.trim() !== '' && formData.password.trim() !== '';

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
            Welcome back
          </h1>
          <p className="text-gray-600 text-base">
            Sign in to your account to continue
          </p>
        </div>

        {/* Sign In Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  placeholder="Enter your email"
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
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                  placeholder="Enter your password"
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
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full flex items-center justify-center gap-2 bg-primary-blue hover:bg-primary-blue-light text-white font-semibold py-3.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-blue"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Email not verified notice */}
            {unverifiedEmail && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex gap-3" data-testid="unverified-notice">
                <MailWarning className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold">Email not verified</p>
                  <p className="mt-1">
                    We sent a verification link to <span className="font-medium">{unverifiedEmail}</span>.
                    Please confirm your address to sign in.
                  </p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="mt-2 inline-flex items-center gap-1.5 font-semibold text-primary-blue hover:text-primary-blue-light disabled:opacity-50"
                  >
                    {resending ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Resend verification email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Registration Link */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-semibold text-primary-blue hover:text-primary-blue-light transition-colors inline-flex items-center gap-1"
              >
                Create an account
                <span className="text-primary-green">→</span>
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Login;
