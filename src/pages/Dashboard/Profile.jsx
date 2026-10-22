import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, getAvatarUrl } from '../../services/api';
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
  CalendarDays,
  Camera,
  Loader2,
  KeyRound,
  Sparkles,
  Check,
  ArrowLeft,
  ArrowUpRight,
  Package,
  MessageSquare,
  Compass,
  GraduationCap
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

  const [uploadingImage, setUploadingImage] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.profileImage]);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return toast.error('Please choose a JPEG, PNG, GIF or WebP image');
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be smaller than 5 MB');
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await usersAPI.uploadProfileImage(formData);
      const updated = response.data?.user;
      if (updated) syncUser(updated);
      toast.success(response.data?.message || 'Profile image updated');
    } catch (error) {
      const data = error.response?.data;
      toast.error(data?.message || 'Failed to upload profile image');
    } finally {
      setUploadingImage(false);
    }
  };

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

  const avatarUrl = getAvatarUrl(user?.profileImage);
  const roleLabel = (user?.role || 'student').toLowerCase();
  const RoleIcon = roleLabel === 'admin' ? ShieldCheck : GraduationCap;

  const setupSteps = [
    { label: 'Name added', done: Boolean(user?.name?.trim()) },
    { label: 'Email added', done: Boolean(user?.email?.trim()) },
    { label: 'Profile photo', done: Boolean(user?.profileImage) }
  ];
  const completedSteps = setupSteps.filter((step) => step.done).length;
  const setupPercent = Math.round((completedSteps / setupSteps.length) * 100);
  const setupHint =
    completedSteps === setupSteps.length
      ? 'Everything looks good.'
      : 'Add a profile photo to stand out.';

  const passwordsMatch = passwords.next.length > 0 && passwords.next === passwords.confirm;
  const passwordLongEnough = passwords.next.length >= 6;

  return (
    <div className="min-h-screen bg-[#EEF3F8] pb-16">
      {/* Cover */}
      <section className="relative -mt-24 overflow-hidden md:-mt-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue via-[#0D4278] to-primary-blue-light" />
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border border-white/10" />
        <div className="absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-primary-green/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-24 sm:px-6 md:pb-32 md:pt-28 lg:px-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
          <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.25em] text-primary-green">
            Account settings
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
            Make your profile yours.
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-white/70">
            Keep your details current, add a photo, and manage the password that protects your
            account.
          </p>
        </div>
      </section>

      {/* Identity card */}
      <div className="relative z-10 mx-auto -mt-20 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/80 bg-white p-5 shadow-[0_24px_70px_-32px_rgba(12,57,104,0.4)] md:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0">
                <div className="h-24 w-24 rounded-[1.75rem] bg-gradient-to-br from-primary-green via-primary-blue-light to-primary-blue p-[3px] shadow-lg shadow-primary-blue/20">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.55rem] bg-white text-2xl font-bold text-primary-blue">
                    {avatarUrl && !avatarFailed ? (
                      <img
                        src={avatarUrl}
                        alt={`${user?.name || 'User'} avatar`}
                        onError={() => setAvatarFailed(true)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                </div>

                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-[1.75rem] bg-primary-blue/60 text-white">
                    <Loader2 size={22} className="animate-spin" />
                  </div>
                )}

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingImage}
                  title="Upload a new profile photo"
                  aria-label="Upload profile photo"
                  className="absolute -bottom-1.5 -right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary-blue text-white ring-4 ring-white transition-colors hover:bg-primary-blue-light disabled:cursor-wait disabled:opacity-60"
                >
                  <Camera size={16} />
                </button>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="truncate text-2xl font-bold tracking-tight text-primary-blue md:text-3xl">
                    {user?.name || 'Your profile'}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-green/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#5D9626]">
                    <RoleIcon size={13} />
                    {roleLabel}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-gray-500">
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Mail size={15} className="shrink-0 text-gray-400" />
                    <span className="truncate">{user?.email}</span>
                  </span>
                  {user?.createdAt && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={15} className="text-gray-400" />
                      Joined {format(new Date(user.createdAt), 'MMM yyyy')}
                    </span>
                  )}
                  {user?.emailVerified && (
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#5D9626]">
                      <BadgeCheck size={15} />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full shrink-0 rounded-2xl border border-gray-200/80 bg-gray-50/80 p-4 lg:w-64">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  Profile setup
                </span>
                <span className="text-xs font-bold text-primary-blue">
                  {completedSteps}/{setupSteps.length}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-green to-primary-blue-light transition-all duration-500"
                  style={{ width: `${setupPercent}%` }}
                />
              </div>
              <div className="mt-3 space-y-1.5">
                {setupSteps.map((step) => (
                  <div
                    key={step.label}
                    className={`flex items-center gap-2 text-xs font-medium ${
                      step.done ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full ${
                        step.done ? 'bg-primary-green/15 text-[#5D9626]' : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Check size={11} />
                    </span>
                    {step.label}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-4 text-gray-500">{setupHint}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-6 lg:col-span-2">
          {/* Account details */}
          <section className="rounded-[1.75rem] border border-white bg-white p-5 shadow-[0_18px_50px_-30px_rgba(12,57,104,0.35)] md:p-7">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-blue/10 text-primary-blue">
                <User size={21} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary-blue">Personal information</h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Update the name and email linked to your account.
                </p>
              </div>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleProfileSubmit}>
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  Full name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <User className="h-[18px] w-[18px] text-gray-400" />
                  </div>
                  <input
                    id="profile-name"
                    name="name"
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="block w-full rounded-2xl border border-gray-200 bg-gray-50/80 py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-blue/10"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-[18px] w-[18px] text-gray-400" />
                  </div>
                  <input
                    id="profile-email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="block w-full rounded-2xl border border-gray-200 bg-gray-50/80 py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-blue/10"
                    placeholder="you@example.com"
                  />
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                  {user?.emailVerified ? (
                    <>
                      <BadgeCheck size={14} className="text-primary-green" />
                      Your email is verified.
                    </>
                  ) : (
                    'Changing your email keeps your account active without re-verification.'
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-400">
                  {isProfileDirty ? 'You have unsaved changes.' : 'Everything is up to date.'}
                </p>
                <button
                  type="submit"
                  disabled={savingProfile || !isProfileDirty}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-blue px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-blue/15 transition-all hover:-translate-y-0.5 hover:bg-primary-blue-light hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Security */}
          <section className="rounded-[1.75rem] border border-white bg-white p-5 shadow-[0_18px_50px_-30px_rgba(12,57,104,0.35)] md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-green/10 text-[#5D9626]">
                  <KeyRound size={21} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-primary-blue">Password &amp; security</h2>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Choose a unique password you do not use elsewhere.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPasswords((show) => !show)}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-primary-blue/20 hover:text-primary-blue"
              >
                {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPasswords ? 'Hide' : 'Show'}
              </button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handlePasswordSubmit}>
              <PasswordField
                id="current-password"
                label="Current password"
                value={passwords.current}
                onChange={(value) => setPasswords({ ...passwords, current: value })}
                show={showPasswords}
                autoComplete="current-password"
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <PasswordField
                  id="new-password"
                  label="New password"
                  value={passwords.next}
                  onChange={(value) => setPasswords({ ...passwords, next: value })}
                  show={showPasswords}
                  autoComplete="new-password"
                />
                <PasswordField
                  id="confirm-password"
                  label="Confirm new password"
                  value={passwords.confirm}
                  onChange={(value) => setPasswords({ ...passwords, confirm: value })}
                  show={showPasswords}
                  autoComplete="new-password"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <PasswordRequirement met={passwordLongEnough}>At least 6 characters</PasswordRequirement>
                <PasswordRequirement met={passwordsMatch}>Passwords match</PasswordRequirement>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xs text-xs text-gray-400">
                  Updating your password keeps you signed in on this device.
                </p>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-green px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-green/20 transition-all hover:-translate-y-0.5 hover:bg-primary-green/90 hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Update password
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-[1.75rem] border border-white bg-white p-5 shadow-[0_18px_50px_-30px_rgba(12,57,104,0.35)]">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
              Account overview
            </h2>
            <dl className="mt-4 space-y-4">
              <OverviewRow icon={ShieldCheck} label="Role" value={roleLabel} />
              <OverviewRow
                icon={BadgeCheck}
                label="Email status"
                value={user?.emailVerified ? 'Verified' : 'Not verified'}
                tone={user?.emailVerified ? 'success' : 'muted'}
              />
              <OverviewRow
                icon={CalendarDays}
                label="Member since"
                value={user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : '—'}
              />
            </dl>
          </section>

          <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary-blue to-[#082744] p-5 text-white shadow-xl shadow-primary-blue/20">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                backgroundSize: '18px 18px'
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-primary-green" />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                  Explore
                </h2>
              </div>

              <div className="mt-4 space-y-1">
                <QuickLink to="/dashboard/orders" icon={Package} label="My orders" />
                <QuickLink to="/dashboard/support" icon={MessageSquare} label="Support requests" />
                <QuickLink to="/projects" icon={Compass} label="Browse projects" />
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

const PasswordField = ({ id, label, value, onChange, show, autoComplete }) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Lock className="h-[18px] w-[18px] text-gray-400" />
      </div>
      <input
        id={id}
        name={id}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-2xl border border-gray-200 bg-gray-50/80 py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 transition-all placeholder:text-gray-400 focus:border-primary-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-blue/10"
        placeholder="••••••••"
      />
    </div>
  </div>
);

const PasswordRequirement = ({ met, children }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
      met ? 'bg-primary-green/10 text-[#5D9626]' : 'bg-gray-100 text-gray-500'
    }`}
  >
    <Check size={12} className={met ? 'text-primary-green' : 'text-gray-400'} />
    {children}
  </span>
);

const OverviewRow = ({ icon: Icon, label, value, tone = 'default' }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
      <Icon size={16} />
    </div>
    <div className="min-w-0 flex-1">
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd
        className={`truncate text-sm font-semibold capitalize ${
          tone === 'success' ? 'text-[#5D9626]' : 'text-gray-800'
        }`}
      >
        {value}
      </dd>
    </div>
  </div>
);

const QuickLink = ({ to, icon: Icon, label }) => (
  <Link
    to={to}
    className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
  >
    <span className="inline-flex items-center gap-2.5">
      <Icon size={16} className="text-primary-green" />
      {label}
    </span>
    <ArrowUpRight
      size={15}
      className="opacity-0 transition-all group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
    />
  </Link>
);

export default Profile;
