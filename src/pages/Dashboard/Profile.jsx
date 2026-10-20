import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  ShieldCheck,
  BadgeCheck,
  CalendarDays
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, syncUser } = useAuth();
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({ name: '', email: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const response = await usersAPI.getProfile();
        if (cancelled) return;
        const fresh = response.data?.user;
        if (fresh) {
          // Keep context + localStorage in sync (login only stores id/name/email/role)
          syncUser(fresh);
          setProfile({ name: fresh.name || '', email: fresh.email || '' });
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load profile:', error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seed the form once the auth context resolves the saved user
  useEffect(() => {
    if (user && !profile.name && !profile.email) {
      setProfile({ name: user.name || '', email: user.email || '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const isProfileDirty =
    profile.name.trim() !== (user?.name || '') ||
    profile.email.trim() !== (user?.email || '');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    const name = profile.name.trim();
    const email = profile.email.trim();

    if (!name) {
      return toast.error('Name cannot be empty');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return toast.error('Please enter a valid email address');
    }

    setSavingProfile(true);
    try {
      const response = await usersAPI.updateProfile({ name, email });
      const updated = response.data?.user;
      if (updated) {
        syncUser(updated);
        setProfile({ name: updated.name || '', email: updated.email || '' });
      }
      toast.success(response.data?.message || 'Profile updated successfully');
    } catch (error) {
      const data = error.response?.data;
      toast.error(data?.errors?.[0]?.msg || data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwords.current || !passwords.next) {
      return toast.error('Please fill in all password fields');
    }
    if (passwords.next.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    if (passwords.next !== passwords.confirm) {
      return toast.error('New passwords do not match');
    }

    setSavingPassword(true);
    try {
      const response = await usersAPI.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.next
      });
      toast.success(response.data?.message || 'Password updated successfully');
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (error) {
      const data = error.response?.data;
      toast.error(data?.errors?.[0]?.msg || data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <Loading />;

  const initials = (user?.name || 'U')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="bg-gray-50">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary-blue to-primary-blue-light text-white -mt-24 md:-mt-28 pt-24 md:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold">{user?.name || 'Your profile'}</h1>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold capitalize flex items-center gap-1">
                  <ShieldCheck size={16} />
                  {user?.role || 'student'}
                </span>
              </div>
              <p className="text-gray-100 text-lg mt-1">{user?.email}</p>
              {user?.createdAt && (
                <p className="text-white/80 text-sm mt-2 flex items-center gap-1">
                  <CalendarDays size={16} />
                  Member since {format(new Date(user.createdAt), 'MMMM yyyy')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Details */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-primary-blue/10 p-3 rounded-lg">
                <User className="text-primary-blue" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary-blue">Account Details</h2>
                <p className="text-sm text-gray-600">Update your name and email address</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleProfileSubmit}>
              <div>
                <label htmlFor="profile-name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full name
                </label>
                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="profile-email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="profile-email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  {user?.emailVerified ? (
                    <>
                      <BadgeCheck className="text-primary-green" size={14} />
                      Email verified
                    </>
                  ) : (
                    'Changing your email keeps your account active without re-verification.'
                  )}
                </p>
              </div>

              <button
                type="submit"
                disabled={savingProfile || !isProfileDirty}
                className="inline-flex items-center space-x-2 bg-primary-blue hover:bg-primary-blue-light text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingProfile ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-primary-green/10 p-3 rounded-lg">
                <Lock className="text-primary-green" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary-blue">Change Password</h2>
                <p className="text-sm text-gray-600">Use at least 6 characters</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handlePasswordSubmit}>
              <PasswordField
                id="current-password"
                label="Current password"
                value={passwords.current}
                onChange={(value) => setPasswords({ ...passwords, current: value })}
                show={showPasswords}
              />
              <PasswordField
                id="new-password"
                label="New password"
                value={passwords.next}
                onChange={(value) => setPasswords({ ...passwords, next: value })}
                show={showPasswords}
              />
              <PasswordField
                id="confirm-password"
                label="Confirm new password"
                value={passwords.confirm}
                onChange={(value) => setPasswords({ ...passwords, confirm: value })}
                show={showPasswords}
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="inline-flex items-center space-x-1.5 text-sm font-medium text-gray-600 hover:text-primary-blue transition-colors"
                >
                  {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span>{showPasswords ? 'Hide passwords' : 'Show passwords'}</span>
                </button>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="inline-flex items-center space-x-2 bg-primary-green hover:bg-primary-green/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingPassword ? (
                    <span>Updating...</span>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const PasswordField = ({ id, label, value, onChange, show }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Lock className="h-5 w-5 text-gray-400" />
      </div>
      <input
        id={id}
        name={id}
        type={show ? 'text' : 'password'}
        autoComplete="current-password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all"
        placeholder="••••••••"
      />
    </div>
  </div>
);

export default Profile;
