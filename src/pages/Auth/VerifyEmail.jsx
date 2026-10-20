import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { CheckCircle, Loader2, MailWarning, RefreshCw, Send, LogIn } from 'lucide-react';
import logo from '../../assets/logo.png';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const justSent = searchParams.get('sent') === '1';
  const state = location.state || {};

  const [status, setStatus] = useState(token ? 'verifying' : justSent ? 'sent' : 'idle');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState(state.email || '');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    authAPI
      .verifyEmail(token)
      .then((res) => {
        if (cancelled) return;
        setMessage(res.data?.message || 'Email verified successfully.');
        setStatus('success');
      })
      .catch((error) => {
        if (cancelled) return;
        setMessage(
          error.response?.data?.message ||
            'This verification link is invalid or has expired.'
        );
        setStatus('failed');
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail.trim() || resending) return;
    setResending(true);
    try {
      const res = await authAPI.resendVerification(resendEmail.trim());
      toast.success(res.data?.message || 'Verification email sent.');
      if (res.data?.verificationUrl) {
        // Dev console mode: backend returned the link directly — follow it
        navigate(`/verify-email?token=${res.data.verificationUrl.split('token=')[1]}`);
        return;
      }
      setStatus('sent');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const renderContent = () => {
    if (status === 'verifying') {
      return (
        <div className="text-center py-6" data-testid="verifying">
          <Loader2 className="h-12 w-12 text-primary-blue animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Verifying your email…</p>
        </div>
      );
    }

    if (status === 'success') {
      return (
        <div className="text-center py-6" data-testid="verify-success">
          <CheckCircle className="h-14 w-14 text-primary-green mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-primary-blue">Email verified!</h2>
          <p className="mt-2 text-gray-600">{message}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-primary-blue hover:bg-primary-blue-light text-white font-semibold py-3.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <LogIn className="h-5 w-5" />
            <span>Continue to Sign In</span>
          </button>
        </div>
      );
    }

    if (status === 'failed') {
      return (
        <div className="text-center py-6" data-testid="verify-failed">
          <MailWarning className="h-14 w-14 text-red-500 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-red-600">Verification failed</h2>
          <p className="mt-2 text-gray-600">{message}</p>
          <div className="mt-6 space-y-3">
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="Enter your email for a new link"
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            />
            <button
              onClick={handleResend}
              disabled={resending || !resendEmail.trim()}
              className="w-full flex items-center justify-center gap-2 bg-primary-blue hover:bg-primary-blue-light text-white font-semibold py-3.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? (
                <span>Sending…</span>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Send a new verification link</span>
                </>
              )}
            </button>
            <Link to="/login" className="block text-sm font-semibold text-primary-blue hover:text-primary-blue-light">
              Back to sign in
            </Link>
          </div>
        </div>
      );
    }

    if (status === 'sent') {
      return (
        <div className="text-center py-6" data-testid="verify-sent">
          <Send className="h-14 w-14 text-primary-blue mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-primary-blue">Check your inbox</h2>
          <p className="mt-2 text-gray-600">
            We sent a verification link to{' '}
            <span className="font-semibold">{resendEmail || 'your email'}</span>.
            Click it to activate your account.
          </p>
          {state.devUrl && (
            <div className="mt-4 bg-amber-50 border border-amber-300 rounded-lg p-4 text-left text-sm text-amber-800">
              <p className="font-semibold">Development mode</p>
              <p className="mt-1 break-all">
                Email delivery is set to console mode, so here is your link:{' '}
                <a href={state.devUrl} className="font-semibold text-primary-blue underline">
                  {state.devUrl}
                </a>
              </p>
            </div>
          )}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleResend}
              disabled={resending || !resendEmail.trim()}
              className="w-full flex items-center justify-center gap-2 border-2 border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Resend email</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 bg-primary-blue hover:bg-primary-blue-light text-white font-semibold py-3.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <LogIn className="h-5 w-5" />
              <span>Continue to Sign In</span>
            </button>
          </div>
        </div>
      );
    }

    // idle: no token, no sent flag
    return (
      <div className="text-center py-6">
        <MailWarning className="h-14 w-14 text-amber-500 mx-auto" />
        <h2 className="mt-4 text-2xl font-bold text-primary-blue">Verify your email</h2>
        <p className="mt-2 text-gray-600">
          Enter the email you registered with and we&apos;ll send you a new verification link.
        </p>
        <div className="mt-6 space-y-3">
          <input
            type="email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            placeholder="you@example.com"
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
          />
          <button
            onClick={handleResend}
            disabled={resending || !resendEmail.trim()}
            className="w-full flex items-center justify-center gap-2 bg-primary-blue hover:bg-primary-blue-light text-white font-semibold py-3.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? <span>Sending…</span> : <span>Send verification link</span>}
          </button>
          <Link to="/login" className="block text-sm font-semibold text-primary-blue hover:text-primary-blue-light">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img
              src={logo}
              alt="ProjectAid Logo"
              className="h-16 md:h-20 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-blue mb-2">
            Email Verification
          </h1>
          <p className="text-gray-600 text-base">Confirm your address to activate your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
