import { useState } from 'react';
import { HiUser, HiMail, HiPhone, HiLockClosed, HiSave, HiLogout } from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('profile');

  // Profile form
  const [profile, setProfile] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
    customerid: user?.id || ''
  });
  const [profLoading, setProfLoading] = useState(false);

  // Password form
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '',customerid: user?.id || '' });
  const [passErrors, setPassErrors] = useState({});
  const [passLoading, setPassLoading] = useState(false);

  const handleProfileSave = async () => {
    setProfLoading(true);
    try {
      const res = await authService.updateProfile(profile);
      updateUser(res.user || { ...user, ...profile });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setProfLoading(false);
    }
  };

  const validatePassword = () => {
    const e = {};
    if (!passwords.current)           e.current = 'Required';
    if (passwords.newPass.length < 6) e.newPass  = 'Min 6 characters';
    if (passwords.newPass !== passwords.confirm) e.confirm = 'Passwords do not match';
    setPassErrors(e);
    return !Object.keys(e).length;
  };

  const handlePasswordChange = async () => {
    if (!validatePassword()) return;
    setPassLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
        customerid: passwords.customerid
      });
      toast.success('Password changed successfully!');
      setPasswords({ current: '', newPass: '', confirm: '', customerid: user?.id || '' });
    } catch (err) {
      toast.error(err.message || 'Could not change password');
    } finally {
      setPassLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const AVATAR_URL = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=f97316&color=fff&bold=true&size=128`;

  return (
    <div className="py-8 min-h-screen">
      <div className="page-container max-w-2xl">

        {/* Header card */}
        <div className="card p-8 text-center mb-6">
          <img
            src={AVATAR_URL}
            alt="avatar"
            className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-primary-500/30"
          />
          <h1 className="font-display text-2xl font-bold text-white">{user?.name}</h1>
          <p className="text-brand-muted font-body text-sm">{user?.email}</p>
          {user?.phone && <p className="text-brand-muted font-body text-sm">{user.phone}</p>}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-brand-surface rounded-xl border border-brand-border w-fit">
          {['profile', 'security'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold font-body transition-all capitalize ${
                tab === t ? 'bg-primary-500 text-white shadow-glow' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="card p-6 space-y-5 animate-fade-in">
            <h2 className="font-display font-bold text-white flex items-center gap-2">
              <HiUser className="w-5 h-5 text-primary-400" /> Personal Information
            </h2>
            <Input
              label="Full Name"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              leftIcon={<HiUser className="w-4 h-4" />}
            />
            <Input
              label="Email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              leftIcon={<HiMail className="w-4 h-4" />}
            />
            <Input
              label="Phone"
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              leftIcon={<HiPhone className="w-4 h-4" />}
            />
            <Button
              fullWidth
              loading={profLoading}
              leftIcon={<HiSave className="w-4 h-4" />}
              onClick={handleProfileSave}
            >
              Save Changes
            </Button>
          </div>
        )}

        {/* Security tab */}
        {tab === 'security' && (
          <div className="card p-6 space-y-5 animate-fade-in">
            <h2 className="font-display font-bold text-white flex items-center gap-2">
              <HiLockClosed className="w-5 h-5 text-primary-400" /> Change Password
            </h2>
            <Input
              label="Current Password" type="password"
              value={passwords.current}
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              error={passErrors.current}
              leftIcon={<HiLockClosed className="w-4 h-4" />}
            />
            <Input
              label="New Password" type="password"
              value={passwords.newPass}
              onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
              error={passErrors.newPass}
              leftIcon={<HiLockClosed className="w-4 h-4" />}
            />
            <Input
              label="Confirm New Password" type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              error={passErrors.confirm}
              leftIcon={<HiLockClosed className="w-4 h-4" />}
            />
            <Button fullWidth loading={passLoading} onClick={handlePasswordChange}>
              Update Password
            </Button>
          </div>
        )}

        {/* Danger zone */}
        <div className="card p-6 mt-6 border-red-500/20">
          <h3 className="font-display font-bold text-white mb-4">Account Actions</h3>
          <Button
            variant="danger"
            fullWidth
            leftIcon={<HiLogout className="w-4 h-4" />}
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
